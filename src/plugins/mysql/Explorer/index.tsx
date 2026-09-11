import React, { useCallback, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Resizable } from 're-resizable';
import { Button, Tabs, Form } from 'antd';

import { IS_ENT } from '@/utils/constant';
import { timeRangeUnix } from '@/components/TimeRangePicker';
import AiQueryDock from '@/components/AiQueryDock';
import { AiQueryDockTrigger } from '@/components/AiQueryDock/Trigger';
import { useQueryDockActions, QueryDockAction } from '@/components/AiQueryDock/useQueryDockActions';
import { useFormQueryControl } from '@/components/AiQueryDock/useFormQueryControl';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';

import { NAME_SPACE } from '../constants';
import Meta from '../components/Meta';
import QueryBuilder from './QueryBuilder';
import Graph from './Graph';
import Table from './Table';

import './style.less';

// How this panel's statement is named to the assistant.
const SQL_ACTION: QueryDockAction = {
  name: 'set_sql_query',
  argument: 'sql',
  language: 'SQL statement',
  followUpExample: '改成按小时汇总',
  page: { title: 'SQL explorer', summary: 'The user writes SQL against a MySQL data source and reads the rows it returns.' },
};

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
  const queryRowRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLButtonElement>(null);
  const refresh = () => setRefreshFlag(_.uniqueId('refreshFlag_'));
  const undoRef = useRef<() => void>();
  // The dock's control: the box, the window, and how this page runs a query.
  const formControl = useFormQueryControl({
    form,
    datasourceValue,
    paths: () => ({ statement: ['query', 'query'], range: ['query', 'range'] }),
    // The box being empty is the panel's only rule, and the dock already
    // refuses that with a reason, so there is nothing here to validate.
    // Rows are the honest view of a statement: the graph needs a value column
    // the assistant never chose, and would silently draw nothing.
    commit: () => {
      setMode('table');
      refresh();
    },
    refresh,
    // The box itself, not the whole row.
    queryInput: () => queryRowRef.current?.querySelector('.logql-codemirror') ?? queryRowRef.current,
    queryButton: () => queryButtonRef.current,
    onInvalidate: () => undoRef.current?.(),
  });
  const aiActions = useQueryDockActions({
    enabled: IS_ENT && aiOpen,
    datasourceValue,
    getControl: formControl.getControl,
    action: SQL_ACTION,
  });
  undoRef.current = aiActions.invalidateUndo;
  // Every hand the user lays on the panel: a dock turn that started earlier may not write.
  const invalidate = formControl.invalidate;
  const executeQuery = () => {
    invalidate();
    form.validateFields().then(refresh);
  };
  // What the dock sends with each message: the data source plus what is in the
  // box and which window the panel is on, read at send time.
  const readAiPageFrom = useCallback(() => {
    const snapshot = formControl.getControl()?.snapshot();
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
  }, [datasourceValue, formControl]);
  const aiPromptList = useMemo(
    () => ['tables', 'per_minute', 'group'].map((topic) => ({ label: tAi(`dock.prompt_sql_${topic}`), value: tAi(`dock.prompt_sql_${topic}_query`) })),
    [tAi],
  );

  const dock = IS_ENT ? (
    <AiQueryDock
      open={aiOpen}
      pageFrom={readAiPageFrom}
      progress={aiActions.progress}
      prepareTurn={aiActions.prepareTurn}
      canUndo={aiActions.canUndo}
      onUndo={aiActions.undo}
      promptList={aiPromptList}
      resultNoun='rows'
      placeholder={tAi('dock.placeholder_first_sql')}
      onNewConversation={aiActions.reset}
      onClose={() => {
        aiActions.cancel();
        setAiOpen(false);
      }}
    />
  ) : undefined;

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
          <div ref={queryRowRef}>
            <QueryBuilder
              extra={
                <Button type='primary' onClick={executeQuery} ref={queryButtonRef}>
                  {t('query.execute')}
                </Button>
              }
              executeQuery={executeQuery}
              onUserContextChange={invalidate}
              queryExtra={
                IS_ENT ? (
                  <AiQueryDockTrigger
                    open={aiOpen}
                    onClick={() => {
                      if (aiOpen) aiActions.cancel();
                      setAiOpen((previous) => !previous);
                    }}
                  />
                ) : undefined
              }
              noticeBanner={dock}
              datasourceValue={datasourceValue}
              getMode={getMode}
            />
          </div>
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
                <Table form={form} datasourceValue={datasourceValue} refreshFlag={refreshFlag} setRefreshFlag={setRefreshFlag} queryRequest={formControl.queryRequest} />
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
