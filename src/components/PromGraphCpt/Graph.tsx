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
import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Space, InputNumber, Radio, Button, Popover, Spin } from 'antd';
import { LineChartOutlined, AreaChartOutlined, SettingOutlined, ShareAltOutlined } from '@ant-design/icons';
import TimeRangePicker, { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import LineGraphStandardOptions from './components/GraphStandardOptions';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils';
import { DASHBOARD_VERSION } from '@/pages/dashboard/config';
import { CommonStateContext, basePrefix } from '@/App';
import { getPromData, setTmpChartData } from './services';
import { QueryStats } from './components/QueryStatsView';

interface IProps {
  url: string;
  datasourceValue: number;
  promql?: string;
  setQueryStats: (stats: QueryStats) => void;
  setErrorContent: (content: string) => void;
  contentMaxHeight: number;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  step?: number;
  setStep: (step?: number) => void;
  graphOperates: {
    enabled: boolean;
  };
  refreshFlag: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  graphStandardOptionsType?: 'vertical' | 'horizontal';
  defaultUnit?: string;
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
    step,
    setStep,
    graphOperates,
    refreshFlag,
    loading,
    setLoading,
    graphStandardOptionsType,
    defaultUnit,
  } = props;
  const [data, setData] = useState<any[]>([]);
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
      stack: chartType === ChartType.Line ? 'hidden' : 'noraml',
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
        util: highLevelConfig.unit,
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
    if (datasourceValue && promql) {
      const parsedRange = parseRange(range);
      const start = moment(parsedRange.start).unix();
      const end = moment(parsedRange.end).unix();
      let realStep = step;
      if (!step) realStep = Math.max(Math.floor((end - start) / 240), 1);
      const queryStart = Date.now();
      setLoading(true);
      getPromData(`${url}/${datasourceValue}/api/v1/query_range`, {
        query: promql,
        start: moment(parsedRange.start).unix(),
        end: moment(parsedRange.end).unix(),
        step: realStep,
      })
        .then((res) => {
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
            resolution: step,
            resultSeries: series.length,
          });

          setData(series);
          setErrorContent('');
        })
        .catch((err) => {
          const msg = _.get(err, 'message');
          setErrorContent(`Error executing query: ${msg}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [JSON.stringify(range), step, datasourceValue, promql, refreshFlag]);

  return (
    <div className='prom-graph-graph-container'>
      <div className='prom-graph-graph-controls'>
        <Space>
          <TimeRangePicker value={range} onChange={setRange} dateFormat='YYYY-MM-DD HH:mm:ss' />
          <InputNumber
            placeholder='Res. (s)'
            value={step}
            onKeyDown={(e: any) => {
              if (e.code === 'Enter') {
                setStep(_.toNumber(e.target.value));
              }
            }}
            onBlur={(e) => {
              setStep(_.toNumber(e.target.value));
            }}
            onStep={(value) => {
              setStep(value);
            }}
          />
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
                        step,
                        range,
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
                  placement='left'
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
      <Timeseries inDashboard={false} values={lineGraphProps as any} series={data} time={range} themeMode={darkMode ? 'dark' : undefined} />
    </div>
  );
}
