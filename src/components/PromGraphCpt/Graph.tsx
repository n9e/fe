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
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Space, InputNumber, Radio, Button, Popover, Tooltip } from 'antd';
import { LineChartOutlined, AreaChartOutlined, SettingOutlined, ShareAltOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { useTranslation } from 'react-i18next';

import { CommonStateContext, basePrefix } from '@/App';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { interpolateString, getRealStep } from '@/components/PromQLInputNG';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils';
import { DASHBOARD_VERSION } from '@/pages/dashboard/config';

import { getPromData, setTmpChartData } from './services';
import { QueryStats } from './components/QueryStatsView';
import LineGraphStandardOptions from './components/GraphStandardOptions';

interface IProps {
  url: string;
  datasourceValue: number;
  promql?: string;
  setQueryStats: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight: number;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  minStep?: number;
  setMinStep: (step?: number) => void;
  maxDataPoints?: number;
  setMaxDataPoints: (maxDataPoints?: number) => void;
  graphOperates: {
    enabled: boolean;
  };
  refreshFlag: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  graphStandardOptionsType?: 'vertical' | 'horizontal';
  graphStandardOptionsPlacement?: TooltipPlacement;
  defaultUnit?: string;
  panelWidth?: number; // 用于 Graph 组件的宽度计算
  refetchOnZoom?: boolean;
}

enum ChartType {
  Line = 'line',
  StackArea = 'stackArea',
}

const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

export default function Graph(props: IProps) {
  const { t } = useTranslation();
  const { datasourceList, darkMode: appDarkMode, siteInfo } = useContext(CommonStateContext);
  const darkMode = appDarkMode || localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('theme-dark');
  const {
    url,
    datasourceValue,
    promql,
    setQueryStats,
    setErrorContent,
    contentMaxHeight,
    range,
    setRange,
    minStep,
    setMinStep,
    maxDataPoints,
    setMaxDataPoints,
    graphOperates,
    refreshFlag,
    loading,
    setLoading,
    graphStandardOptionsType,
    graphStandardOptionsPlacement = 'left',
    defaultUnit,
    panelWidth,
    refetchOnZoom = false,
  } = props;
  const [data, setData] = useState<any[]>([]);
  const [zoomRangeState, setZoomRangeState] = useState<{ range: IRawTimeRange; sourceKey: string }>();
  const [resetZoomVersion, setResetZoomVersion] = useState(0);
  const querySeqRef = useRef(0);
  const rangeKey = JSON.stringify(range);
  const zoomSourceKey = JSON.stringify({ datasourceValue, promql, range });
  const activeZoomRange = refetchOnZoom && zoomRangeState?.sourceKey === zoomSourceKey ? zoomRangeState.range : undefined;
  const effectiveRange = activeZoomRange || range;
  const effectiveRangeKey = JSON.stringify(effectiveRange);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: false,
    sharedSortDirection: 'desc',
    legend: true,
    unit: 'sishort', // 2024-05-08 从 'default' 改为 'sishort'
    reverseColorOrder: false,
    colorDomainAuto: true,
    colorDomain: [],
    chartheight: 300,
  });
  const [chartType, setChartType] = useState<ChartType>(ChartType.Line);
  const lineGraphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: chartType === ChartType.Line ? 0 : 0.5,
      stack: chartType === ChartType.Line ? 'hidden' : 'normal',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: highLevelConfig.legend ? 'table' : 'hidden',
        columns: _.isEmpty(siteInfo?.explorer_timeseries_legend_columns) ? ['last'] : siteInfo?.explorer_timeseries_legend_columns,
      },
      tooltip: {
        mode: highLevelConfig.shared ? 'all' : 'single',
        sort: highLevelConfig.sharedSortDirection,
      },
      standardOptions: {
        unit: highLevelConfig.unit,
      },
    },
  };

  useEffect(() => {
    if (defaultUnit) {
      setHighLevelConfig({
        ...highLevelConfig,
        unit: defaultUnit,
      });
    }
  }, [defaultUnit]);

  useEffect(() => {
    if (refetchOnZoom) {
      setZoomRangeState(undefined);
      setResetZoomVersion((v) => v + 1);
    }
  }, [refetchOnZoom, zoomSourceKey]);

  const handleZoomWithoutDefault = useCallback(
    (times?: Date[]) => {
      if (!refetchOnZoom) return;
      if (times?.length === 2) {
        setZoomRangeState({
          range: {
            start: moment(times[0]),
            end: moment(times[1]),
          },
          sourceKey: zoomSourceKey,
        });
      } else {
        setZoomRangeState(undefined);
        setResetZoomVersion((v) => v + 1);
      }
    },
    [refetchOnZoom, zoomSourceKey],
  );

  useEffect(() => {
    if (datasourceValue && promql) {
      const parsedRange = parseRange(effectiveRange);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      const realStep = getRealStep({
        minStep,
        maxDataPoints: maxDataPoints || panelWidth,
        fromUnix: start,
        toUnix: end,
      });
      const queryStart = Date.now();
      const querySeq = ++querySeqRef.current;
      setLoading(true);
      getPromData(`${url}/${datasourceValue}/api/v1/query_range`, {
        query: interpolateString({
          query: promql,
          range: effectiveRange,
          minStep,
          maxDataPoints: maxDataPoints || panelWidth,
        }),
        start: moment(parsedRange.start).unix(),
        end: moment(parsedRange.end).unix(),
        step: realStep,
      })
        .then((res) => {
          if (querySeq !== querySeqRef.current) return;
          const series = _.map(res?.result, (item) => {
            return {
              id: _.uniqueId('series_'),
              name: getSerieName(item.metric),
              metric: item.metric,
              data: completeBreakpoints(realStep, item.values),
            };
          });
          setQueryStats({
            loadTime: Date.now() - queryStart,
            resolution: realStep,
            resultSeries: series.length,
          });

          setData(series);
          setErrorContent('');
        })
        .catch((err) => {
          if (querySeq !== querySeqRef.current) return;
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
        })
        .finally(() => {
          if (querySeq !== querySeqRef.current) return;
          setLoading(false);
        });
    }
  }, [effectiveRangeKey, minStep, maxDataPoints, datasourceValue, promql, refreshFlag]);

  return (
    <div className={activeZoomRange ? 'prom-graph-graph-container prom-graph-graph-zoom-owner' : 'prom-graph-graph-container'}>
      <div className='prom-graph-graph-controls'>
        <Space wrap>
          <TimeRangePicker value={range} onChange={setRange} dateFormat='YYYY-MM-DD HH:mm:ss' />
          <InputGroupWithFormItem
            label={
              <Space>
                {t('promGraphCpt:max_data_points')}
                <Tooltip title={t('dashboard:query.prometheus.maxDataPoints.tip_2')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              style={{ width: 70 }}
              placeholder={_.toString(panelWidth ?? 240)}
              min={1}
              value={maxDataPoints}
              onKeyDown={(e: any) => {
                if (e.code === 'Enter') {
                  if (e.target.value) {
                    setMaxDataPoints(_.toNumber(e.target.value));
                  } else {
                    setMaxDataPoints(undefined);
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setMaxDataPoints(_.toNumber(e.target.value));
                } else {
                  setMaxDataPoints(undefined);
                }
              }}
              controls={false}
            />
          </InputGroupWithFormItem>
          <InputGroupWithFormItem
            label={
              <Space>
                {t('promGraphCpt:min_step')}
                <Tooltip title={t('dashboard:query.prometheus.minStep.tip')}>
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <InputNumber
              placeholder='15'
              style={{ width: 60 }}
              value={minStep}
              onKeyDown={(e: any) => {
                if (e.code === 'Enter') {
                  if (e.target.value) {
                    setMinStep(_.toNumber(e.target.value));
                  } else {
                    setMinStep(undefined);
                  }
                }
              }}
              onBlur={(e) => {
                if (e.target.value) {
                  setMinStep(_.toNumber(e.target.value));
                } else {
                  setMinStep(undefined);
                }
              }}
              onStep={(value) => {
                setMinStep(value);
              }}
            />
          </InputGroupWithFormItem>
          <Radio.Group
            options={[
              { label: <LineChartOutlined />, value: ChartType.Line },
              { label: <AreaChartOutlined />, value: ChartType.StackArea },
            ]}
            onChange={(e) => {
              e.preventDefault();
              setChartType(e.target.value);
            }}
            value={chartType}
            optionType='button'
            buttonStyle='solid'
          />
          {graphOperates.enabled && (
            <>
              <Button
                icon={
                  <ShareAltOutlined
                    onClick={() => {
                      const dataProps = {
                        type: 'timeseries',
                        version: DASHBOARD_VERSION,
                        name: promql,
                        step: minStep,
                        range: effectiveRange,
                        ...lineGraphProps,
                        targets: [
                          {
                            expr: promql,
                          },
                        ],
                        datasourceCate: 'prometheus',
                        datasourceName: _.find(datasourceList, { id: datasourceValue })?.name,
                        datasourceValue,
                      };
                      setTmpChartData([
                        {
                          configs: JSON.stringify({
                            dataProps,
                          }),
                        },
                      ]).then((res) => {
                        const ids = res.dat;
                        window.open(basePrefix + '/chart/' + ids);
                      });
                    }}
                  />
                }
              />
              {graphStandardOptionsType === 'horizontal' ? (
                <LineGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} type={graphStandardOptionsType} />
              ) : (
                <Popover
                  placement={graphStandardOptionsPlacement}
                  content={<LineGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />}
                  trigger='click'
                  autoAdjustOverflow={false}
                  getPopupContainer={() => document.body}
                >
                  <Button icon={<SettingOutlined />} />
                </Popover>
              )}
            </>
          )}
        </Space>
      </div>
      <Timeseries
        key={refetchOnZoom ? `${resetZoomVersion}-${zoomSourceKey}` : undefined}
        inDashboard={false}
        values={lineGraphProps as any}
        series={data}
        time={effectiveRange}
        themeMode={darkMode ? 'dark' : undefined}
        legendTableMaxHeight={contentMaxHeight - 200} // line chart height
        onZoomWithoutDefult={refetchOnZoom ? (handleZoomWithoutDefault as any) : undefined}
      />
    </div>
  );
}
