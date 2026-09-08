/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * 类似 prometheus graph 的组件
 */
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tabs, Button, Alert, Checkbox } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { N9E_PATHNAME } from '@/utils/constant';
import PromQLInputNG, { interpolateString, instantInterpolateString, includesVariables } from '@/components/PromQLInputNG';

import Table from './Table';
import { QueryRequest } from './services';
import Graph from './Graph';
import QueryStatsView, { QueryStats } from './components/QueryStatsView';
import PromQLInputNGWithTooltipWrapper from './components/PromQLInputNGWithTooltipWrapper';
import Panel from './components/Panel';
import './locale';
import './style.less';

interface IProps {
  url?: string;
  datasourceValue: number;
  contentMaxHeight?: number;
  defaultType?: 'table' | 'graph';
  type?: 'table' | 'graph';
  onTypeChange?: (type: 'table' | 'graph') => void;
  defaultTime?: IRawTimeRange | number;
  defaultRange?: IRawTimeRange;
  onTimeChange?: (time: IRawTimeRange) => void; // 用于外部控制时间范围
  promQL?: string;
  graphOperates?: {
    enabled: boolean;
  };
  globalOperates?: {
    enabled: boolean;
  };
  headerExtra?: HTMLDivElement | null;
  executeQuery?: (promQL?: string) => void;
  showBuiltinMetrics?: boolean;
  graphStandardOptionsType?: 'vertical' | 'horizontal';
  graphStandardOptionsPlacement?: TooltipPlacement;
  defaultUnit?: string;
  showGlobalMetrics?: boolean;
  showBuilder?: boolean;
  onChange?: (promQL?: string) => void;
  promQLInputTooltip?: string;
  /** Sits to the left of the PromQL box, outside its border (e.g. the AI orb). */
  leadingExtra?: React.ReactNode;
  extra?: React.ReactElement;
  showExportButton?: boolean; // 是否显示导出按钮
  refetchOnZoom?: boolean;
  noticeBanner?: React.ReactNode; // 查询框与结果区之间的提示横幅（如数据源体检结论），由调用方控制显隐
  /**
   * Lets the page drive the query box the way a user would: write into it,
   * then press 查询. Separate steps on purpose — the assistant's cursor moves
   * between them, so what the user sees matches what happened.
   */
  controlRef?: React.MutableRefObject<PromGraphControl | null>;
  onUserContextChange?: () => void;
}

export interface PromGraphSnapshot {
  promql: string;
  submitted?: string;
  range: IRawTimeRange;
  timestamp?: number;
}

export interface PromGraphControl {
  snapshot(): PromGraphSnapshot;
  revision(): number;
  fill(next: string, range?: IRawTimeRange): void;
  run(options?: { signal?: AbortSignal }): Promise<{ empty: boolean }>;
  restore(snapshot: PromGraphSnapshot): void;
  queryInput(): Element | null;
  queryButton(): Element | null;
}

const TabPane = Tabs.TabPane;

export default function index(props: IProps) {
  const { t } = useTranslation('promGraphCpt');
  const {
    url = `/api/${N9E_PATHNAME}/proxy`,
    datasourceValue,
    promQL,
    contentMaxHeight = 400,
    defaultType,
    type,
    onTypeChange,
    defaultTime,
    onTimeChange,
    graphOperates = {
      enabled: false,
    },
    globalOperates = {
      enabled: false,
    },
    headerExtra,
    executeQuery,
    showBuiltinMetrics,
    graphStandardOptionsType,
    graphStandardOptionsPlacement,
    showGlobalMetrics = true,
    showBuilder = true,
    onChange,
    promQLInputTooltip,
    leadingExtra,
    extra,
    defaultRange,
    showExportButton,
    refetchOnZoom = false,
    noticeBanner,
    controlRef,
    onUserContextChange,
  } = props;
  const [value, setValue] = useState<string | undefined>(promQL); // for promQLInput
  // What the results show. Kept apart from `value` so the box can hold an
  // expression that has not been run yet, the way it does while a user types.
  const [submitted, setSubmitted] = useState<string | undefined>(promQL);
  const valueRef = useRef<string | undefined>(promQL);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const queryButtonRef = useRef<HTMLElement>(null);
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [errorContent, setErrorContent] = useState('');
  const [tabActiveKey, setTabActiveKey] = useState(type || defaultType || 'table');
  const [timestamp, setTimestamp] = useState<number>(); // for table
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_')); // for table
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' }); // for graph
  const [minStep, setMinStep] = useState<number>(); // for graph
  const [maxDataPoints, setMaxDataPoints] = useState<number>(); // for graph
  const rangeRef = useRef(range);
  const timestampRef = useRef(timestamp);
  const submittedRef = useRef(submitted);
  const revisionRef = useRef(0);
  const pendingRef = useRef<{ abort: () => void }>();
  const [queryRequest, setQueryRequest] = useState<QueryRequest>();
  const [queryPaused, setQueryPaused] = useState(false);
  const invalidate = () => {
    revisionRef.current += 1;
    onUserContextChange?.();
    pendingRef.current?.abort();
    setQueryRequest(undefined);
    setQueryPaused(false);
  };
  const updateRange = (next: IRawTimeRange) => {
    rangeRef.current = _.cloneDeep(next);
    setRange(next);
  };
  const updateTimestamp = (next?: number) => {
    timestampRef.current = next;
    setTimestamp(next);
  };
  const updateSubmitted = (next?: string) => {
    submittedRef.current = next;
    setSubmitted(next);
  };
  const externalContext = JSON.stringify({ datasourceValue, url, promQL, defaultTime, defaultRange, type });
  const previousContextRef = useRef(externalContext);
  useLayoutEffect(() => {
    if (previousContextRef.current !== externalContext) {
      previousContextRef.current = externalContext;
      invalidate();
    }
  }, [externalContext]);
  useEffect(() => () => pendingRef.current?.abort(), []);
  const [completeEnabled, setCompleteEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [defaultUnit, setDefaultUnit] = useState<string | undefined>(props.defaultUnit);
  const [seriesFilterText, setSeriesFilterText] = useState('');
  const preserveSeriesFilterRef = useRef(false);
  const handleQueryRequest = useCallback(() => {
    if (preserveSeriesFilterRef.current) {
      preserveSeriesFilterRef.current = false;
      return;
    }
    setSeriesFilterText('');
  }, []);

  useEffect(() => {
    if (typeof defaultTime === 'number') {
      if (tabActiveKey == 'table') {
        updateTimestamp(defaultTime);
      }
    } else {
      if (defaultTime?.start && defaultTime?.end) {
        updateRange(defaultTime);
      }
    }
  }, [defaultTime]);

  useEffect(() => {
    if (defaultRange?.start && defaultRange?.end) {
      updateRange(defaultRange);
    }
  }, [defaultRange]);

  useEffect(() => {
    if (type) {
      if (type !== tabActiveKey && value && datasourceValue) {
        preserveSeriesFilterRef.current = true;
      }
      setTabActiveKey(type);
    }
  }, [type]);

  useEffect(() => {
    // The caller's expression is both shown and queried: deep links, jumps from an event.
    valueRef.current = promQL;
    setValue(promQL);
    updateSubmitted(promQL);
  }, [promQL]);

  const change = (next?: string) => {
    valueRef.current = next;
    setValue(next);
  };
  const submit = () => {
    updateSubmitted(valueRef.current);
    setRefreshFlag(_.uniqueId('refreshFlag_'));
    executeQuery && executeQuery(valueRef.current);
  };

  useLayoutEffect(() => {
    if (!controlRef) return;
    controlRef.current = {
      snapshot: () => ({ promql: valueRef.current || '', submitted: submittedRef.current, range: _.cloneDeep(rangeRef.current), timestamp: timestampRef.current }),
      revision: () => revisionRef.current,
      fill: (next, nextRange) => {
        pendingRef.current?.abort();
        setQueryPaused(true);
        change(next);
        if (nextRange) updateRange(nextRange);
      },
      run: ({ signal } = {}) => {
        pendingRef.current?.abort();
        if (signal?.aborted) return Promise.reject(new DOMException('Query stopped', 'AbortError'));
        if (!valueRef.current?.trim() || !datasourceValue) return Promise.reject(new Error('A query and data source are required'));
        const controller = new AbortController();
        const promise = new Promise<{ empty: boolean }>((resolve, reject) => {
          let settled = false;
          const complete = (result: { empty: boolean } | Error) => {
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
        setQueryPaused(false);
        submit();
        return promise;
      },
      restore: (snapshot) => {
        pendingRef.current?.abort();
        setErrorContent('');
        setQueryStats(null);
        setQueryRequest(undefined);
        setQueryPaused(false);
        change(snapshot.promql);
        updateSubmitted(snapshot.submitted);
        updateRange(_.cloneDeep(snapshot.range));
        updateTimestamp(snapshot.timestamp);
        setRefreshFlag(_.uniqueId('refreshFlag_'));
      },
      queryInput: () => inputWrapRef.current,
      queryButton: () => queryButtonRef.current,
    };
    return () => {
      controlRef.current = null;
    };
  });

  return (
    <div className='prom-graph-container'>
      {headerExtra && globalOperates.enabled ? (
        createPortal(
          <div className='prom-graph-global-operate' style={{ marginTop: 5 }}>
            <Checkbox
              checked={completeEnabled}
              onChange={(e) => {
                setCompleteEnabled(e.target.checked);
              }}
            >
              {t('enable_autocomplete')}
            </Checkbox>
          </div>,
          headerExtra,
        )
      ) : (
        <div className='prom-graph-global-operate'>
          <Checkbox
            checked={completeEnabled}
            onChange={(e) => {
              setCompleteEnabled(e.target.checked);
            }}
          >
            {t('enable_autocomplete')}
          </Checkbox>
        </div>
      )}

      <div className='prom-graph-expression-input-ng' ref={inputWrapRef}>
        <div className='flex items-center gap-[8px]'>
          {leadingExtra && <div className='flex-shrink-0 self-stretch flex items-center'>{leadingExtra}</div>}
          <div className='flex-shrink-1 min-w-0 w-full overflow-hidden'>
            <PromQLInputNGWithTooltipWrapper tooltip={promQLInputTooltip}>
              <PromQLInputNG
                maxHeight={200}
                enableAutocomplete={completeEnabled}
                datasourceValue={datasourceValue}
                showBuiltinMetrics={showBuiltinMetrics}
                interpolateString={(query) => {
                  return interpolateString({
                    query,
                    range,
                    minStep,
                  });
                }}
                onMetricUnitChange={(newUnit) => {
                  setDefaultUnit(newUnit);
                }}
                showGlobalMetrics={showGlobalMetrics}
                onChangeTrigger={['onBlur', 'onEnter']}
                value={value}
                onDraftChange={(next) => {
                  if (next !== valueRef.current) {
                    invalidate();
                    setQueryPaused(true);
                    change(next);
                  }
                }}
                onChange={(newVal) => {
                  // The user finished typing (blur or Enter): that both shows and runs it.
                  if (newVal !== valueRef.current) invalidate();
                  setQueryPaused(false);
                  change(newVal);
                  updateSubmitted(newVal);
                  onChange && onChange(newVal);
                }}
              />
            </PromQLInputNGWithTooltipWrapper>
          </div>
          {extra && (
            <div className='flex-shrink-0'>
              {React.cloneElement(extra as React.ReactElement, {
                onChange: (newValue?: string) => {
                  if (typeof newValue === 'string') {
                    invalidate();
                    change(newValue);
                    updateSubmitted(newValue);
                  }
                },
              })}
            </div>
          )}
          <Button
            ref={queryButtonRef}
            className='flex-shrink-0'
            type='primary'
            loading={loading}
            onClick={() => {
              invalidate();
              submit();
            }}
          >
            {t('query_btn')}
          </Button>
        </div>
      </div>
      {tabActiveKey === 'table' && value && includesVariables(value) && (
        <Alert
          style={{ marginBottom: 16 }}
          message={t('table_promql_interpolate_string', {
            query: instantInterpolateString({
              query: value,
            }),
          })}
          type='info'
        />
      )}
      {noticeBanner}
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <div style={{ minHeight: 0, height: '100%' }}>
        <Tabs
          destroyInactiveTabPane
          tabBarGutter={0}
          activeKey={tabActiveKey}
          onChange={(key: 'table' | 'graph') => {
            invalidate();
            if (key !== tabActiveKey && value && datasourceValue) {
              preserveSeriesFilterRef.current = true;
            }
            setTabActiveKey(key);
            onTypeChange && onTypeChange(key);
            setErrorContent('');
            setQueryStats(null);
          }}
          type='card'
          tabBarExtraContent={queryStats && <QueryStatsView {...queryStats} />}
        >
          <TabPane tab={t('tab_table')} key='table'>
            <Table
              url={url}
              contentMaxHeight={contentMaxHeight}
              datasourceValue={datasourceValue}
              promql={submitted}
              setQueryStats={setQueryStats}
              setErrorContent={setErrorContent}
              timestamp={timestamp}
              setTimestamp={(next) => {
                invalidate();
                updateTimestamp(next);
              }}
              refreshFlag={refreshFlag}
              loading={loading}
              setLoading={setLoading}
              defaultUnit={defaultUnit}
              showExportButton={showExportButton}
              seriesFilterText={seriesFilterText}
              onSeriesFilterTextChange={setSeriesFilterText}
              queryRequest={queryRequest}
              queryPaused={queryPaused}
              onQueryRequest={handleQueryRequest}
            />
          </TabPane>
          <TabPane tab={t('tab_graph')} key='graph'>
            <Panel>
              <Graph
                url={url}
                contentMaxHeight={contentMaxHeight}
                datasourceValue={datasourceValue}
                promql={submitted}
                setQueryStats={setQueryStats}
                setErrorContent={setErrorContent}
                range={range}
                setRange={(newRange) => {
                  invalidate();
                  updateRange(newRange);
                  onTimeChange && onTimeChange(newRange);
                }}
                minStep={minStep}
                setMinStep={(next) => {
                  if (next !== minStep) {
                    invalidate();
                    setMinStep(next);
                  }
                }}
                maxDataPoints={maxDataPoints}
                setMaxDataPoints={(next) => {
                  if (next !== maxDataPoints) {
                    invalidate();
                    setMaxDataPoints(next);
                  }
                }}
                graphOperates={graphOperates}
                refreshFlag={refreshFlag}
                loading={loading}
                setLoading={setLoading}
                graphStandardOptionsType={graphStandardOptionsType}
                graphStandardOptionsPlacement={graphStandardOptionsPlacement}
                defaultUnit={defaultUnit}
                refetchOnZoom={refetchOnZoom}
                onQueryContextChange={invalidate}
                seriesFilterText={seriesFilterText}
                onSeriesFilterTextChange={setSeriesFilterText}
                queryRequest={queryRequest}
                queryPaused={queryPaused}
                onQueryRequest={handleQueryRequest}
              />
            </Panel>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
