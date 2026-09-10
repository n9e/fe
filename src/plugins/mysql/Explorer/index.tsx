import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Tabs, Form } from 'antd';

import { IS_ENT } from '@/utils/constant';
import { IRawTimeRange, timeRangeUnix } from '@/components/TimeRangePicker';
import AiQueryDock from '@/components/AiQueryDock';
import { AiQueryDockTrigger } from '@/components/AiQueryDock/Trigger';
import { useQueryDockActions, QueryDockAction, QueryDockControl, QueryDockSnapshot } from '@/components/AiQueryDock/useQueryDockActions';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';

import { NAME_SPACE } from '../constants';
import Meta from '../components/Meta';
import QueryBuilder from './QueryBuilder';
import Graph from './Graph';
import Table, { QueryRequest, QueryResult } from './Table';

import './style.less';

// How this panel's statement is named to the assistant.
const SQL_ACTION: QueryDockAction = {
  name: 'set_sql_query',
  argument: 'sql',
  language: 'SQL statement',
  followUpExample: '改成按小时汇总',
  page: { title: 'SQL explorer', summary: 'The user writes SQL against a MySQL data source and reads the rows it returns.' },
};

interface SQLSnapshot extends QueryDockSnapshot {
  range?: IRawTimeRange;
}
interface IProps {
  datasourceValue: number;
}

export default function Prometheus(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { t: tAi } = useTranslation(AI_CHAT_NS);
  const { datasourceValue } = props;
  const form = Form.useFormInstance();
  const [mode, setMode, getMode] = useGetState<string>('table');
  const [refreshFlag, setRefreshFlag] = useState<string>();
  const [width, setWidth] = useState(_.toNumber(localStorage.getItem('tdengine-meta-sidebar') || 200));
  const [aiOpen, setAiOpen] = useState(false);
  // Every hand the user lays on the panel bumps this; a dock turn that started
  // on an older revision may not write, and its undo is gone.
  const revisionRef = useRef(0);
  const pendingRef = useRef<{ abort: () => void }>();
  const [queryRequest, setQueryRequest] = useState<QueryRequest>();
  const queryRowRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLButtonElement>(null);
  const control = useRef<QueryDockControl<SQLSnapshot> | null>(null);
  const aiActions = useQueryDockActions({
    enabled: IS_ENT && aiOpen,
    datasourceValue,
    getControl: () => control.current,
    action: SQL_ACTION,
  });
  const refresh = () => setRefreshFlag(_.uniqueId('refreshFlag_'));
  const invalidate = () => {
    revisionRef.current += 1;
    pendingRef.current?.abort();
    setQueryRequest(undefined);
    aiActions.invalidateUndo();
  };
  const executeQuery = () => {
    invalidate();
    form.validateFields().then(refresh);
  };
  // What the dock sends with each message: the data source plus what is in the
  // box and which window the panel is on, read at send time.
  const readAiPageFrom = useCallback(() => {
    const snapshot = control.current?.snapshot();
    const range = snapshot?.range?.start && snapshot.range.end ? timeRangeUnix(snapshot.range) : undefined;
    return buildPageFrom({
      param: {
        datasource_type: 'mysql',
        datasource_id: datasourceValue,
        query: snapshot?.query?.trim() || undefined,
        start: range ? String(range.start) : undefined,
        end: range ? String(range.end) : undefined,
      },
    });
  }, [datasourceValue]);
  const aiPromptList = useMemo(
    () => ['tables', 'per_minute', 'group'].map((topic) => ({ label: tAi(`dock.prompt_sql_${topic}`), value: tAi(`dock.prompt_sql_${topic}_query`) })),
    [tAi],
  );

  useLayoutEffect(() => {
    control.current = {
      snapshot: () => ({ query: form.getFieldValue(['query', 'query']) || '', range: _.cloneDeep(form.getFieldValue(['query', 'range'])) }),
      revision: () => revisionRef.current,
      fill: (sql, range) => {
        pendingRef.current?.abort();
        form.setFieldsValue({ query: range ? { query: sql, range } : { query: sql } });
      },
      run: ({ signal } = {}) => {
        pendingRef.current?.abort();
        if (signal?.aborted) return Promise.reject(new DOMException('Query stopped', 'AbortError'));
        const sql: string | undefined = form.getFieldValue(['query', 'query']);
        if (!sql?.trim() || !datasourceValue) return Promise.reject(new Error('A query and data source are required'));
        const controller = new AbortController();
        const promise = new Promise<QueryResult>((resolve, reject) => {
          let settled = false;
          const complete = (result: QueryResult | Error) => {
            if (settled) return;
            settled = true;
            signal?.removeEventListener('abort', abort);
            if (pendingRef.current?.abort === abort) pendingRef.current = undefined;
            if (result instanceof Error) reject(result);
            else resolve(result);
          };
          const abort = () => {
            controller.abort();
            complete(new DOMException('Query stopped', 'AbortError'));
          };
          pendingRef.current = { abort };
          signal?.addEventListener('abort', abort, { once: true });
          setQueryRequest({ signal: controller.signal, complete });
        });
        // Rows are the honest view of a statement: the graph needs a value
        // column the assistant never chose, and would silently draw nothing.
        setMode('table');
        refresh();
        return promise;
      },
      restore: (snapshot) => {
        pendingRef.current?.abort();
        form.setFieldsValue({ query: { query: snapshot.query, range: snapshot.range } });
        refresh();
      },
      queryInput: () => queryRowRef.current,
      queryButton: () => queryButtonRef.current,
    };
    return () => {
      control.current = null;
    };
  });

  const queryBuilder = (
    <QueryBuilder
      extra={
        <Button type='primary' onClick={executeQuery} ref={queryButtonRef}>
          {t('query.execute')}
        </Button>
      }
      executeQuery={executeQuery}
      onUserContextChange={invalidate}
      datasourceValue={datasourceValue}
      getMode={getMode}
    />
  );

  return (
    <div className={`${NAME_SPACE}-explorer-container`}>
      <div className='explorer-query-container'>
        <div className='explorer-meta-container'>
          <Resizable
            size={{ width, height: '100%' }}
            enable={{
              right: true,
            }}
            onResizeStop={(e, direction, ref, d) => {
              let curWidth = width + d.width;
              if (curWidth < 200) {
                curWidth = 200;
              }
              setWidth(curWidth);
              localStorage.setItem('tdengine-meta-sidebar', curWidth.toString());
            }}
          >
            <Meta
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                invalidate();
                const query = form.getFieldValue(['query']);
                _.set(query, 'query', `select * from ${nodeData.database}.${nodeData.table} limit 20;`);
                form.setFieldsValue({
                  query,
                });
                refresh();
              }}
            />
          </Resizable>
        </div>
        <div
          className='explorer-main'
          style={{
            width: `calc(100% - ${width + 8}px)`,
          }}
        >
          {IS_ENT ? (
            <>
              {/*
                Two rows share a w-8 rail: the orb on the query row, a spine
                bridging into the dock row so trigger and panel read as one control.
              */}
              <div className='flex items-start gap-[8px]'>
                <div className='ai-query-dock-rail flex h-8 w-8 shrink-0 items-center justify-center'>
                  <AiQueryDockTrigger
                    open={aiOpen}
                    onClick={() => {
                      if (aiOpen) aiActions.cancel();
                      setAiOpen((previous) => !previous);
                    }}
                  />
                </div>
                <div className='min-w-0 flex-1' ref={queryRowRef}>
                  {queryBuilder}
                </div>
              </div>
              <div className='flex items-stretch gap-[8px]'>
                <div className='ai-query-dock-rail flex w-8 shrink-0 flex-col items-center' aria-hidden='true'>
                  {aiOpen ? <div className='ai-query-dock-spine' /> : null}
                </div>
                <div className='ai-query-dock-slot min-w-0 flex-1'>
                  <AiQueryDock
                    open={aiOpen}
                    pageFrom={readAiPageFrom}
                    progress={aiActions.progress}
                    prepareTurn={aiActions.prepareTurn}
                    canUndo={aiActions.canUndo}
                    onUndo={aiActions.undo}
                    promptList={aiPromptList}
                    resultNoun='rows'
                    onNewConversation={aiActions.reset}
                    onClose={() => {
                      aiActions.cancel();
                      setAiOpen(false);
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            queryBuilder
          )}
          <Tabs
            destroyInactiveTabPane
            tabBarGutter={0}
            activeKey={mode}
            onChange={(key: 'table' | 'graph') => {
              invalidate();
              setMode(key);
              // TODO 不清楚这里为什么要加延迟 200ms
              setTimeout(refresh, 200);
            }}
            type='card'
          >
            <Tabs.TabPane tab='Table' key='table'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <Table form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} queryRequest={queryRequest} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab='Graph' key='graph'>
              <Graph form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
