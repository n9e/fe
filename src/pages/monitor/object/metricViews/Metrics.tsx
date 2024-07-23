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
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Input, Card, Row, Col, Space, Button, Tooltip } from 'antd';
import { DownOutlined, RightOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import TimeRangePicker, { IRawTimeRange } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { getMetricValues, getMetricsDesc } from '@/services/metricViews';
import Graph from './Graph';
import { IMatch } from '../types';
import { getMatchStr } from './utils';

interface IProps {
  datasourceValue: number;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  match: IMatch;
  metricModeWhenMatchChange?: 'replace' | 'append';
  parentSource?: string;
}

export default function Metrics(props: IProps) {
  const { t } = useTranslation('objectExplorer');
  const { datasourceValue, range, setRange, match, metricModeWhenMatchChange = 'replace', parentSource } = props;
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [search, setSearch] = useState('');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [metricsDesc, setMetricsDesc] = useState({});
  const [activeKey, setActiveKey] = useState('all');
  const [metricPrefixes, setMetricPrefixes] = useState<any[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<any[]>([]);
  const [step, setStep] = useState<number>();
  const [metricFold, setMetricFold] = useState<boolean>(false);
  const [chartFold, setChartFold] = useState<boolean>(false);

  const matchStr = getMatchStr(match);
  const renderMetricList = (metrics: any[] = [], metricTabKey: string) => {
    const filtered = _.filter(metrics, (metric) => {
      let flag = true;
      flag = metricTabKey === 'all' ? true : metric.indexOf(`${metricTabKey}_`) === 0;
      if (flag && search) {
        try {
          const reg = new RegExp(search, 'gi');
          flag = reg.test(metric);
        } catch (e) {
          flag = false;
        }
      }
      return flag;
    });
    return (
      <div className='tabPane' style={{ height: 240, overflow: 'auto' }}>
        {filtered.length ? (
          <ul className='n9e-metric-views-metrics-content' style={{ border: 'none' }}>
            {_.map(filtered, (metric, i) => {
              return (
                <li
                  className='item'
                  key={i}
                  onClick={() => {
                    setSelectedMetrics(_.union(_.concat(metric, selectedMetrics)));
                  }}
                >
                  <span>{metric}</span>
                  {_.find(selectedMetrics, (sm) => sm === metric) ? <span style={{ marginLeft: 8 }}>+1</span> : null}
                  {metricsDesc[metric] ? (
                    <Tooltip title={metricsDesc[metric]}>
                      <span className='desc'>{metricsDesc[metric]}</span>
                    </Tooltip>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{ textAlign: 'center' }}>No Data</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (matchStr) {
      getMetricValues(datasourceValue, matchStr, range).then((res) => {
        const _metrics: any[] = _.union(metricModeWhenMatchChange === 'append' ? [...metrics, ...res] : res);
        const metricPrefixes = _.union(
          _.compact(
            _.map(_metrics, (m) => {
              return _.get(_.split(m, '_'), '[0]');
            }),
          ),
        );
        setMetrics(_metrics);
        setMetricPrefixes(metricPrefixes);
        getMetricsDesc(_metrics).then((res) => {
          setMetricsDesc(res);
        });
      });
    }
  }, [refreshFlag, matchStr]);

  useEffect(() => {
    if (metricModeWhenMatchChange === 'append') return;
    setSelectedMetrics([]);
    setActiveKey('all');
    setMetrics([]);
  }, [match.id, matchStr]);

  return (
    <div className='n9e-metric-views-metrics'>
      <div>
        <div className='n9e-metric-views-metrics-header'>
          {parentSource === 'srm' ? (
            <div className='page-title' style={{ margin: 0 }}>
              {t('metrics.title')}
              <span
                style={{ cursor: 'pointer', marginLeft: 8 }}
                onClick={() => {
                  setMetricFold(!metricFold);
                }}
              >
                {metricFold ? <RightOutlined /> : <DownOutlined />}
              </span>
            </div>
          ) : (
            <div className='metric-page-title'>{t('metrics.title')}</div>
          )}
          <Input
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder={t('metrics.search_placeholder')}
            addonAfter={
              <SyncOutlined
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                }}
              />
            }
          />
        </div>
        <div>
          {metrics.length > 0 ? (
            <>
              {!metricFold && (
                <Card
                  size='small'
                  style={{ width: '100%' }}
                  tabList={_.map(['all', ...metricPrefixes], (item) => {
                    return {
                      key: item,
                      tab: item,
                    };
                  })}
                  activeTabKey={activeKey}
                  onTabChange={setActiveKey}
                >
                  <div>{renderMetricList(metrics, activeKey)}</div>
                </Card>
              )}
              {parentSource === 'srm' && (
                <div className='page-title'>
                  {t('metrics.chart_title')}
                  <span
                    style={{ cursor: 'pointer', marginLeft: 8 }}
                    onClick={() => {
                      setChartFold(!chartFold);
                    }}
                  >
                    {chartFold ? <RightOutlined /> : <DownOutlined />}
                  </span>
                </div>
              )}
              {!chartFold && (
                <>
                  <Row style={{ padding: '10px 0' }}>
                    <Col span={8}>
                      <Space>
                        <TimeRangePicker
                          value={range}
                          onChange={(e: IRawTimeRange) => {
                            setRange(e);
                          }}
                        />
                        <Resolution
                          onChange={(v) => {
                            setStep(v === null ? undefined : v);
                          }}
                          value={step}
                        />
                        <Button
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            setRange({
                              ...range,
                              refreshFlag: _.uniqueId('refreshFlag_'),
                            });
                          }}
                          icon={<SyncOutlined />}
                        ></Button>
                      </Space>
                    </Col>
                    <Col span={16} style={{ textAlign: 'right' }}>
                      <Button
                        onClick={() => {
                          setSelectedMetrics([]);
                        }}
                        disabled={!selectedMetrics.length}
                      >
                        {t('metrics.clear')}
                      </Button>
                    </Col>
                  </Row>
                  {_.map(selectedMetrics, (metric, i) => {
                    return (
                      <Graph
                        key={metric}
                        datasourceValue={datasourceValue}
                        metric={metric}
                        match={match}
                        range={range}
                        step={step}
                        onClose={() => {
                          const newselectedMetrics = [...selectedMetrics];
                          newselectedMetrics.splice(i, 1);
                          setSelectedMetrics(newselectedMetrics);
                        }}
                      />
                    );
                  })}
                </>
              )}
            </>
          ) : (
            <div style={{ marginTop: 12 }}>{t('metrics.noData')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
