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
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Card, Space, Dropdown, Menu, Tag, Popover, Divider, Tooltip } from 'antd';
import { ShareAltOutlined, SyncOutlined, CloseCircleOutlined, DownOutlined, PlusCircleOutlined, SettingOutlined, LineChartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { getLabels, getQueryRange, getExprs, setTmpChartData } from '@/services/metricViews';
import { CommonStateContext } from '@/App';
import { getMatchStr } from './utils';
import { IMatch } from '../types';
import Timeseries from '../../../dashboard/Renderer/Renderer/Timeseries';
import Hexbin from '../../../dashboard/Renderer/Renderer/Hexbin';
import { calcsOptions } from '../../../dashboard/Editor/config';
import { colors } from '../../../dashboard/Components/ColorRangeMenu/config';
import LineGraphStandardOptions from './graphStandardOptions/Line';
import HexbinGraphStandardOptions from './graphStandardOptions/Hexbin';
import { HexbinIcon } from './config';

interface IProps {
  datasourceValue: number;
  metric: string;
  match: IMatch;
  range: IRawTimeRange;
  step?: number;
  onClose: () => void;
}

export default function Graph(props: IProps) {
  const { t, i18n } = useTranslation('objectExplorer');
  const { datasourceList } = useContext(CommonStateContext);
  const { datasourceValue, metric, match, range, step, onClose } = props;
  const newGroups = _.map(
    _.filter(match.dimensionLabels, (item) => !_.isEmpty(item.value)),
    'label',
  );
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [calcFunc, setCalcFunc] = useState('');
  const [comparison, setComparison] = useState<string[]>([]);
  const [aggrFunc, setAggrFunc] = useState('avg');
  const [aggrGroups, setAggrGroups] = useState<string[]>(newGroups);
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [highLevelConfig, setHighLevelConfig] = useState({
    shared: true,
    sharedSortDirection: 'desc',
    legend: true,
    unit: 'default',
    colorRange: colors[1].value,
    reverseColorOrder: false,
    colorDomainAuto: true,
    colorDomain: [],
    chartheight: 300,
  });
  const [chartType, setChartType] = useState('line');
  const [reduceFunc, setReduceFunc] = useState('last');
  const lineGraphProps = {
    custom: {
      drawStyle: 'lines',
      fillOpacity: 0,
      stack: 'hidden',
      lineInterpolation: 'smooth',
    },
    options: {
      legend: {
        displayMode: highLevelConfig.legend ? 'table' : 'hidden',
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
  const hexbinGraphProps = {
    custom: {
      calc: reduceFunc,
      colorRange: highLevelConfig.colorRange,
      reverseColorOrder: highLevelConfig.reverseColorOrder,
      colorDomainAuto: highLevelConfig.colorDomainAuto,
      colorDomain: highLevelConfig.colorDomain,
    },
    options: {
      standardOptions: {
        util: highLevelConfig.unit,
      },
    },
  };
  const graphStandardOptions = {
    line: <LineGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />,
    hexbin: <HexbinGraphStandardOptions highLevelConfig={highLevelConfig} setHighLevelConfig={setHighLevelConfig} />,
  };

  useEffect(() => {
    setAggrGroups(newGroups);
  }, [JSON.stringify(newGroups)]);

  useEffect(() => {
    const matchStr = getMatchStr(match);
    getLabels(datasourceValue, `${metric}${matchStr}`, range).then((res) => {
      setLabels(res);
    });
  }, [refreshFlag, JSON.stringify(match), JSON.stringify(range)]);

  useEffect(() => {
    getQueryRange(datasourceValue, {
      metric,
      match: getMatchStr(match),
      range,
      step,
      aggrFunc,
      aggrGroups,
      calcFunc,
      comparison,
    }).then((res) => {
      setSeries(res);
    });
  }, [refreshFlag, metric, JSON.stringify(match), JSON.stringify(range), step, calcFunc, comparison, aggrFunc, aggrGroups]);

  return (
    <Card
      size='small'
      style={{ marginBottom: 10 }}
      title={
        <Space>
          {metric}
          <Tooltip
            title={
              <div>
                {getExprs({
                  metric,
                  match: getMatchStr(match),
                  aggrFunc,
                  aggrGroups,
                  calcFunc,
                  comparison,
                })}
              </div>
            }
          >
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
      className='n9e-metric-views-metrics-graph'
      extra={
        <Space>
          <Space size={0} style={{ marginRight: 10 }}>
            <LineChartOutlined
              className={classNames({
                'button-link-icon': true,
                active: chartType === 'line',
              })}
              onClick={() => {
                setChartType('line');
              }}
            />
            <Divider type='vertical' />
            <HexbinIcon
              className={classNames({
                'button-link-icon': true,
                active: chartType === 'hexbin',
              })}
              onClick={() => {
                setChartType('hexbin');
              }}
            />
          </Space>
          <Popover placement='left' content={graphStandardOptions[chartType]} trigger='click' autoAdjustOverflow={false} getPopupContainer={() => document.body}>
            <a className='a-icon'>
              <SettingOutlined />
            </a>
          </Popover>
          <a className='a-icon'>
            <SyncOutlined
              onClick={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </a>
          <a className='a-icon'>
            <ShareAltOutlined
              onClick={() => {
                const dataProps = {
                  type: 'timeseries',
                  version: '3.0.0',
                  name: metric,
                  step,
                  range,
                  ...lineGraphProps,
                  targets: _.map(
                    getExprs({
                      metric,
                      match: getMatchStr(match),
                      aggrFunc,
                      aggrGroups,
                      calcFunc,
                      comparison,
                    }),
                    (expr) => {
                      return {
                        expr,
                      };
                    },
                  ),
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
                  window.open('/chart/' + ids);
                });
              }}
            />
          </a>
          <a className='a-icon'>
            <CloseCircleOutlined onClick={onClose} />
          </a>
        </Space>
      }
    >
      <div>
        <Space size={'large'}>
          <div>
            {t('graph.function')}：
            <Dropdown
              overlay={
                <Menu onClick={(e) => setCalcFunc(e.key === 'clear' ? '' : e.key)} selectedKeys={[calcFunc]}>
                  <Menu.Item key='rate_1m'>rate_1m</Menu.Item>
                  <Menu.Item key='rate_5m'>rate_5m</Menu.Item>
                  <Menu.Item key='increase_1m'>increase_1m</Menu.Item>
                  <Menu.Item key='increase_5m'>increase_5m</Menu.Item>
                  <Menu.Divider></Menu.Divider>
                  <Menu.Item key='clear'>clear</Menu.Item>
                </Menu>
              }
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                {calcFunc || t('graph.none')} <DownOutlined />
              </a>
            </Dropdown>
          </div>
          <div>
            {t('graph.offset')}：
            {comparison.map((ag) => (
              <Tag
                key={ag}
                closable
                onClose={() => {
                  setComparison(_.without(comparison, ag));
                }}
              >
                {ag}
              </Tag>
            ))}
            <Dropdown
              overlay={
                <Menu
                  style={{ maxHeight: '200px', overflowY: 'auto' }}
                  onClick={(e) => {
                    if (comparison.indexOf(e.key) === -1) {
                      setComparison([...comparison, e.key]);
                    } else {
                      setComparison(_.without(comparison, e.key));
                    }
                  }}
                  selectedKeys={comparison}
                >
                  <Menu.Item key='1d'>1d</Menu.Item>
                  <Menu.Item key='7d'>7d</Menu.Item>
                </Menu>
              }
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                <PlusCircleOutlined />
              </a>
            </Dropdown>
          </div>
          <div>
            {t('graph.aggregation')}：
            <Dropdown
              overlay={
                <Menu onClick={(e) => setAggrFunc(e.key)} selectedKeys={[aggrFunc]}>
                  <Menu.Item key='sum'>sum</Menu.Item>
                  <Menu.Item key='avg'>avg</Menu.Item>
                  <Menu.Item key='max'>max</Menu.Item>
                  <Menu.Item key='min'>min</Menu.Item>
                </Menu>
              }
            >
              <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                {aggrFunc} <DownOutlined />
              </a>
            </Dropdown>
          </div>
          {aggrFunc ? (
            <div className='graph-config-inner-item'>
              {t('graph.aggregation_by')}：
              {aggrGroups.map((ag) => (
                <Tag
                  key={ag}
                  closable
                  onClose={() => {
                    setAggrGroups(_.without(aggrGroups, ag));
                  }}
                >
                  {ag}
                </Tag>
              ))}
              <Dropdown
                overlay={
                  <Menu
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                    onClick={(e) => {
                      if (aggrGroups.indexOf(e.key) === -1) {
                        setAggrGroups([...aggrGroups, e.key]);
                      } else {
                        setAggrGroups(_.without(aggrGroups, e.key));
                      }
                    }}
                    selectedKeys={aggrGroups}
                  >
                    {_.map(
                      _.filter(labels, (n) => n !== '__name__'),
                      (ag) => (
                        <Menu.Item key={ag}>{ag}</Menu.Item>
                      ),
                    )}
                  </Menu>
                }
              >
                <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                  <PlusCircleOutlined />
                </a>
              </Dropdown>
            </div>
          ) : null}
          {chartType === 'hexbin' && (
            <div>
              {t('graph.calc')}：
              <Dropdown
                overlay={
                  <Menu onClick={(e) => setReduceFunc(e.key)} selectedKeys={[reduceFunc]}>
                    {_.map(calcsOptions, (val, key) => {
                      return <Menu.Item key={key}>{t(`dashboard:calcs.${key}`)}</Menu.Item>;
                    })}
                  </Menu>
                }
              >
                <a className='ant-dropdown-link' onClick={(e) => e.preventDefault()}>
                  {t(`dashboard:calcs.${reduceFunc}`)} <DownOutlined />
                </a>
              </Dropdown>
            </div>
          )}
        </Space>
      </div>
      <div>
        {chartType === 'line' && <Timeseries inDashboard={false} values={lineGraphProps as any} series={series} time={range} />}
        {chartType === 'hexbin' && (
          <div style={{ padding: '20px 0 0 0', height: highLevelConfig.chartheight }}>
            <Hexbin values={hexbinGraphProps as any} series={series} time={range} />
          </div>
        )}
      </div>
    </Card>
  );
}
