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
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tabs, Button, Alert, Checkbox } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { N9E_PATHNAME } from '@/utils/constant';
import PromQLInputNG, { interpolateString, instantInterpolateString, includesVariables } from '@/components/PromQLInputNG';

import Table from './Table';
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
  extra?: React.ReactElement;
  showExportButton?: boolean; // 是否显示导出按钮
}

const TabPane = Tabs.TabPane;

export default function index(props: IProps) {
  const { t } = useTranslation('promGraphCpt');
  const {
    url = `/api/${N9E_PATHNAME}/proxy`,
    datasourceValue,
    promQL,
    contentMaxHeight = 300,
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
    extra,
    defaultRange,
    showExportButton,
  } = props;
  const [value, setValue] = useState<string | undefined>(promQL); // for promQLInput
  const [queryStats, setQueryStats] = useState<QueryStats | null>(null);
  const [errorContent, setErrorContent] = useState('');
  const [tabActiveKey, setTabActiveKey] = useState(type || defaultType || 'table');
  const [timestamp, setTimestamp] = useState<number>(); // for table
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_')); // for table
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' }); // for graph
  const [minStep, setMinStep] = useState<number>(); // for graph
  const [maxDataPoints, setMaxDataPoints] = useState<number>(); // for graph
  const [completeEnabled, setCompleteEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [defaultUnit, setDefaultUnit] = useState<string | undefined>(props.defaultUnit);

  useEffect(() => {
    if (typeof defaultTime === 'number') {
      if (tabActiveKey == 'table') {
        setTimestamp(defaultTime);
      }
    } else {
      if (defaultTime?.start && defaultTime?.end) {
        setRange(defaultTime);
      }
    }
  }, [defaultTime]);

  useEffect(() => {
    if (defaultRange?.start && defaultRange?.end) {
      setRange(defaultRange);
    }
  }, [defaultRange]);

  useEffect(() => {
    if (type) {
      setTabActiveKey(type);
    }
  }, [type]);

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
              Enable autocomplete
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
            Enable autocomplete
          </Checkbox>
        </div>
      )}

      <div className='prom-graph-expression-input-ng'>
        <div className='flex gap-[8px]'>
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
                onChange={(newVal) => {
                  setValue(newVal);
                  onChange && onChange(newVal);
                }}
              />
            </PromQLInputNGWithTooltipWrapper>
          </div>
          {extra && (
            <div className='flex-shrink-0'>
              {React.cloneElement(extra as React.ReactElement, {
                onChange: (newValue?: string) => {
                  setValue(newValue);
                },
              })}
            </div>
          )}
          <Button
            className='flex-shrink-0'
            type='primary'
            loading={loading}
            onClick={() => {
              setRefreshFlag(_.uniqueId('refreshFlag_'));
              executeQuery && executeQuery(value);
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
      {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
      <div style={{ minHeight: 0, height: '100%' }}>
        <Tabs
          destroyInactiveTabPane
          tabBarGutter={0}
          activeKey={tabActiveKey}
          onChange={(key: 'table' | 'graph') => {
            setTabActiveKey(key);
            onTypeChange && onTypeChange(key);
            setErrorContent('');
            setQueryStats(null);
          }}
          type='card'
          tabBarExtraContent={queryStats && <QueryStatsView {...queryStats} />}
        >
          <TabPane tab='Table' key='table'>
            <Table
              url={url}
              contentMaxHeight={contentMaxHeight}
              datasourceValue={datasourceValue}
              promql={value}
              setQueryStats={setQueryStats}
              setErrorContent={setErrorContent}
              timestamp={timestamp}
              setTimestamp={(val) => {
                setTimestamp(val);
              }}
              refreshFlag={refreshFlag}
              loading={loading}
              setLoading={setLoading}
              defaultUnit={defaultUnit}
              showExportButton={showExportButton}
            />
          </TabPane>
          <TabPane tab='Graph' key='graph'>
            <Panel>
              <Graph
                url={url}
                contentMaxHeight={contentMaxHeight}
                datasourceValue={datasourceValue}
                promql={value}
                setQueryStats={setQueryStats}
                setErrorContent={setErrorContent}
                range={range}
                setRange={(newRange) => {
                  setRange(newRange);
                  onTimeChange && onTimeChange(newRange);
                }}
                minStep={minStep}
                setMinStep={setMinStep}
                maxDataPoints={maxDataPoints}
                setMaxDataPoints={setMaxDataPoints}
                graphOperates={graphOperates}
                refreshFlag={refreshFlag}
                loading={loading}
                setLoading={setLoading}
                graphStandardOptionsType={graphStandardOptionsType}
                graphStandardOptionsPlacement={graphStandardOptionsPlacement}
                defaultUnit={defaultUnit}
              />
            </Panel>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
