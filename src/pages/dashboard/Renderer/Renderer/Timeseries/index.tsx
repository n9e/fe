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
import React, { useRef, useEffect, useState, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { useHistory, useLocation } from 'react-router-dom';
import { VerticalRightOutlined, VerticalLeftOutlined } from '@ant-design/icons';
import { useSize } from 'ahooks';
import TsGraph from '@fc-plot/ts-graph';
import '@fc-plot/ts-graph/dist/index.css';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { IPanel } from '../../../types';
import { hexPalette } from '../../../config';
import valueFormatter from '../../utils/valueFormatter';
import getSerieName from '../../utils/getSerieName';
import { getLegendValues, getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { useGlobalState } from '../../../globalState';
import './style.less';

interface ColData {
  value: number;
  unit?: string;
  text: string;
}

interface DataItem {
  id: string;
  name: string;
  min: ColData;
  max: ColData;
  avg: ColData;
  last: ColData;
  sum: ColData;
  disabled: boolean;
}

interface IProps {
  time?: IRawTimeRange;
  setRange?: (range: IRawTimeRange) => void;
  inDashboard?: boolean;
  chartHeight?: string;
  tableHeight?: string;
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  hideResetBtn?: boolean;
  onClick?: (event: any, datetime: Date, value: number, points: any[]) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
  isPreview?: boolean;
  colors?: string[];
}

function getStartAndEndByTargets(targets: any[]) {
  let start = undefined as number | undefined;
  let end = undefined as number | undefined;
  _.forEach(targets, (target) => {
    if (target.time) {
      const { start: targetStart, end: targetEnd } = parseRange(target.time);
      if (!start || targetStart?.unix()! < start) {
        start = targetStart?.unix()!;
      }
      if (!end || targetEnd?.unix()! > end) {
        end = targetEnd?.unix()!;
      }
    }
  });
  return { start, end };
}

function NameWithTooltip({ record, children }) {
  const name = _.get(record, 'name');
  const metric = _.get(record, 'metric.__name__');
  return (
    <Tooltip
      placement='left'
      title={
        <div>
          <div>{_.get(record, 'name')}</div>
          {name !== metric && <div>{_.get(record, 'metric.__name__')}</div>}
          <div>{record.offset && record.offset !== 'current' ? `offfset ${record.offset}` : ''}</div>
          {_.map(_.omit(record.metric, '__name__'), (val, key) => {
            return (
              <div key={key}>
                {key}={val}
              </div>
            );
          })}
        </div>
      }
      getTooltipContainer={() => document.body}
    >
      {children}
    </Tooltip>
  );
}

export default function index(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation('dashboard');
  const { time, setRange, values, series, inDashboard = true, chartHeight = '200px', tableHeight = '200px', onClick, isPreview, colors } = props;
  const themeMode = props.themeMode || (darkMode ? 'dark' : 'light');
  const history = useHistory();
  const location = useLocation();
  const { custom, options = {}, targets, overrides } = values;
  const { lineWidth = 1, gradientMode = 'none', scaleDistribution, showPoints, pointSize } = custom;
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [activeLegend, setActiveLegend] = useState('');
  const chartEleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<TsGraph>(null);
  const legendEleRef = useRef<HTMLDivElement>(null);
  const legendEleSize = useSize(legendEleRef);
  const displayMode = options.legend?.displayMode || 'table';
  const placement = displayMode === 'table' ? 'bottom' : options.legend?.placement || 'bottom';
  const heightInPercentage = options.legend?.heightInPercentage || 30;
  const legendColumns = !_.isEmpty(options.legend?.columns) ? options.legend?.columns : displayMode === 'table' ? ['max', 'min', 'avg', 'sum', 'last'] : [];
  const detailUrl = options.legend?.detailUrl || undefined;
  const detailName = options.legend?.detailName || undefined;
  const legendBehaviour = options.legend?.behaviour || 'showItem';
  const hasLegend = displayMode !== 'hidden';
  const [legendData, setLegendData] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  let _chartHeight = hasLegend ? `calc(100% - ${legendEleSize?.height! + 16}px)` : '100%';
  let minChartHeight = hasLegend ? `${100 - heightInPercentage}%` : '100%';
  let _tableHeight = hasLegend ? `${heightInPercentage}%` : '0px';

  const detailFormatter = (data: any) => {
    if (detailUrl && time) {
      return getDetailUrl(detailUrl, data, dashboardMeta, time);
    }
    return;
  };
  if (!inDashboard) {
    _chartHeight = chartHeight;
    minChartHeight = chartHeight;
    _tableHeight = tableHeight;
  }

  if (placement === 'right') {
    _chartHeight = '100%';
    minChartHeight = '100%';
    _tableHeight = '100%';
  }

  useEffect(() => {
    if (chartEleRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      chartRef.current = new TsGraph({
        timestamp: 'X',
        xkey: 0,
        ykey: 1,
        ykey2: 2,
        ykeyFormatter: (value) => Number(value),
        chart: {
          renderTo: chartEleRef.current,
          height: chartEleRef.current.clientHeight,
          colors: colors || hexPalette,
          marginTop: 0,
        },
        series: [],
        onClick: (event, datetime, value, points) => {
          if (onClick) onClick(event, datetime, value, points);
        },
      });
    }
    if (hasLegend) {
      setLegendData(getLegendValues(seriesData, options?.standardOptions, colors || hexPalette, undefined, options?.valueMappings, overrides));
    } else {
      setLegendData([]);
    }
    return () => {
      if (chartRef.current && typeof chartRef.current.destroy === 'function') {
        chartRef.current.destroy();
      }
    };
  }, [hasLegend]);

  useEffect(() => {
    setSeriesData(
      _.map(series, (item) => {
        return {
          ...item,
          // 2024-06-28 serie.name 放到这里处理，原 datasource 里的 name 都删除掉
          // 目前只有 mysql 源生效
          name: item.name === undefined ? getSerieName(item.metric, { legend: item.target?.legend, ref: item.isExp ? item.refId : undefined }) : item.name,
        };
      }),
    );
  }, [JSON.stringify(series)]);

  useEffect(() => {
    let xAxisDamin = {};
    if (time) {
      const parsedRange = parseRange(time);
      const startAndEnd = getStartAndEndByTargets(targets);
      const start = startAndEnd.start || moment(parsedRange.start).unix();
      const end = startAndEnd.end || moment(parsedRange.end).unix();
      xAxisDamin = { min: start, max: end };
    }
    if (chartRef.current) {
      chartRef.current.update({
        type: custom.drawStyle === 'lines' ? 'line' : 'bar',
        series: _.cloneDeep(seriesData),
        line: {
          width: lineWidth,
          showPoints,
          pointSize,
        },
        area: {
          ...chartRef.current.options.area,
          opacity: custom.fillOpacity,
          gradientMode,
          gradientOpacityStopColor: themeMode === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
        },
        stack: {
          enabled: custom.stack === 'noraml',
        },
        curve: {
          enabled: true,
          mode: custom.lineInterpolation,
        },
        tooltip: {
          ...chartRef.current.options.tooltip,
          shared: options.tooltip?.mode === 'all',
          sharedSortDirection: options.tooltip?.sort !== 'none' ? options.tooltip?.sort : undefined,
          cascade: isPreview === false ? _.includes(['sharedCrosshair', 'sharedTooltip'], dashboardMeta.graphTooltip) : undefined,
          cascadeScope: 'cascadeScope',
          cascadeMode: _.includes(['sharedCrosshair', 'sharedTooltip'], dashboardMeta.graphTooltip) ? dashboardMeta.graphTooltip : undefined,
          pointNameformatter: (val, nearestPoint) => {
            let name = val;
            if (options?.standardOptions?.displayName) {
              name = options?.standardOptions?.displayName;
            }
            const override = _.find(overrides, (item) => item.matcher.value === nearestPoint?.serieOptions?.refId);
            if (override && override?.properties?.standardOptions?.displayName) {
              name = override?.properties?.standardOptions?.displayName;
            }
            return getMappedTextObj(name, options?.valueMappings)?.text;
          },
          pointValueformatter: (val, nearestPoint) => {
            const override = _.find(overrides, (item) => item.matcher.value === nearestPoint?.serieOptions?.refId);
            if (override) {
              return valueFormatter(
                {
                  unit: override?.properties?.standardOptions?.util,
                  decimals: override?.properties?.standardOptions?.decimals,
                  dateFormat: override?.properties?.standardOptions?.dateFormat,
                },
                val,
              ).text;
            }
            return valueFormatter(
              {
                unit: options?.standardOptions?.util,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              val,
            ).text;
          },
        },
        xAxis: {
          ...chartRef.current.options.xAxis,
          ...xAxisDamin,
          plotLines: options?.xThresholds?.steps,
          lineColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : '#ccc',
          tickColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : '#ccc',
        },
        yAxis: {
          ...chartRef.current.options.yAxis,
          min: options?.standardOptions?.min,
          max: options?.standardOptions?.max,
          scale: scaleDistribution,
          plotLines: _.map(
            _.filter(options?.thresholds?.steps, (item) => {
              return item.value !== null; // 过滤掉 base 值
            }),
            (item) => {
              return {
                ...item,
                shadowColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : '#fff',
              };
            },
          ),
          backgroundColor: themeMode === 'dark' ? '#272a38' : '#fff',
          gridLineColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : '#efefef',
          tickValueFormatter: (val) => {
            return valueFormatter(
              {
                unit: options?.standardOptions?.util,
                decimals: options?.standardOptions?.decimals,
                dateFormat: options?.standardOptions?.dateFormat,
              },
              val,
            ).text;
          },
        },
        yAxis2: {
          ...chartRef.current.options.yAxis,
          visible: overrides?.[0]?.properties?.rightYAxisDisplay === 'noraml',
          matchRefId: overrides?.[0]?.matcher?.value,
          min: overrides?.[0]?.properties?.standardOptions?.min,
          max: overrides?.[0]?.properties?.standardOptions?.max,
          backgroundColor: themeMode === 'dark' ? '#2A2D3C' : '#fff',
          tickValueFormatter: (val) => {
            return valueFormatter(
              {
                unit: overrides?.[0]?.properties?.standardOptions?.util,
                decimals: overrides?.[0]?.properties?.standardOptions?.decimals,
                dateFormat: overrides?.[0]?.properties?.standardOptions?.dateFormat,
              },
              val,
            ).text;
          },
        },
        onClick: (event, datetime, value, points) => {
          if (onClick) onClick(event, datetime, value, points);
        },
        hideResetBtn: props.hideResetBtn || dashboardMeta.graphZoom === 'updateTimeRange',
        onZoomWithoutDefult: props.onZoomWithoutDefult
          ? props.onZoomWithoutDefult
          : dashboardMeta.graphZoom === 'updateTimeRange'
          ? (times: Date[]) => {
              if (setRange) {
                setRange({
                  start: moment(times[0]),
                  end: moment(times[1]),
                });
                // 开启了缩放后更新全局时间范围时，url 中保存时间范围数据
                history.replace({
                  pathname: location.pathname,
                  search: querystring.stringify({
                    ...(querystring.parse(location.search) || {}),
                    __from: moment(times[0]).valueOf(),
                    __to: moment(times[1]).valueOf(),
                  }),
                });
              }
            }
          : undefined,
      });
    }
    if (hasLegend) {
      setLegendData(getLegendValues(seriesData, options?.standardOptions, colors || hexPalette, custom.stack === 'noraml', options?.valueMappings, overrides));
    } else {
      setLegendData([]);
    }
  }, [JSON.stringify(seriesData), JSON.stringify(custom), JSON.stringify(options), themeMode, JSON.stringify(overrides)]);

  useEffect(() => {
    // TODO: 这里布局变化了，但是 fc-plot 没有自动 resize，所以这里需要手动 resize
    if (chartRef.current) {
      chartRef.current.handleResize();
    }
  }, [placement, JSON.stringify(legendEleSize), heightInPercentage]);

  let tableColumn: ColumnProps<DataItem>[] = [
    {
      title: `Series (${series.length})`,
      dataIndex: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: (text, record: any) => {
        return (
          <Space>
            <div className='renderer-timeseries-legend-color-symbol' style={{ backgroundColor: record.color }} />
            <div className='ant-table-cell-ellipsis'>
              <NameWithTooltip record={record}>
                <span>
                  {record.offset && record.offset !== 'current' ? <span style={{ paddingRight: 5 }}>offfset {record.offset}</span> : ''}
                  <span>{text}</span>
                </span>
              </NameWithTooltip>
            </div>
          </Space>
        );
      },
    },
  ];
  _.forEach(legendColumns, (column) => {
    tableColumn = [
      ...tableColumn,
      {
        title: t(`panel.options.legend.${column}`, {
          lng: 'en_US', // fixed to en_US, optimize column width
        }),
        dataIndex: column,
        sorter: (a, b) => a[column].stat - b[column].stat,
        render: (text) => {
          return text.text;
        },
      },
    ];
  });

  // 是否添加详情
  if (detailUrl) {
    tableColumn = [
      ...tableColumn,
      {
        title: detailName,
        dataIndex: 'detail',
        width: 60,
        render: (_text, record: any) => {
          const url = detailFormatter(record);
          return (
            <a href={url} target='_blank'>
              {detailName}
            </a>
          );
        },
      },
    ];
  }

  return (
    <div
      className='renderer-timeseries-container'
      style={{
        display: placement === 'right' ? 'flex' : 'block',
      }}
    >
      <div
        ref={chartEleRef}
        className='renderer-timeseries-graph'
        style={{
          height: _chartHeight,
          minHeight: minChartHeight,
          width: '100%',
          minWidth: 0,
        }}
      />
      <div
        className='renderer-timeseries-legend-table'
        style={{
          [inDashboard ? 'maxHeight' : 'maxHeight']: _tableHeight,
          // height: legendEleSize?.height! + 14,
          width: placement === 'right' ? (isExpanded ? '100%' : 'max-content') : '100%',
          maxWidth: placement === 'right' ? (isExpanded ? '100%' : '40%') : '100%',
          overflow: 'auto',
          display: hasLegend ? 'block' : 'none',
          flexShrink: displayMode === 'table' ? 1 : 0,
          minHeight: 0,
        }}
      >
        {displayMode === 'table' && (
          <div ref={legendEleRef}>
            <Table
              tableLayout='auto' // 2024-01-10 对齐 grafana 效果，取消 fixed 改成 auto，开启 x 轴滚动条
              rowKey='id'
              size='small'
              columns={tableColumn}
              dataSource={legendData}
              pagination={false}
              rowClassName={(record) => {
                return record.disabled ? 'renderer-timeseries-legend-table-row disabled' : 'renderer-timeseries-legend-table-row';
              }}
              onRow={(record) => {
                return {
                  onClick: () => {
                    const newActiveLegend = activeLegend !== record.id ? record.id : '';
                    setActiveLegend(newActiveLegend);
                    setSeriesData(
                      _.map(seriesData, (subItem) => {
                        return {
                          ...subItem,
                          visible: newActiveLegend ? (legendBehaviour === 'hideItem' ? newActiveLegend !== subItem.id : newActiveLegend === subItem.id) : true,
                        };
                      }),
                    );
                  },
                };
              }}
            />
          </div>
        )}
        {displayMode === 'list' && !_.isEmpty(legendData) && (
          <div className='renderer-timeseries-legend-container' ref={legendEleRef}>
            <div
              className={classNames({
                'renderer-timeseries-legend-list': true,
                'renderer-timeseries-legend-list-placement-right': placement === 'right',
                'scroll-container': true,
              })}
            >
              {_.map(legendData, (item) => {
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      const newActiveLegend = activeLegend !== item.id ? item.id : '';
                      setActiveLegend(newActiveLegend);
                      setSeriesData(
                        _.map(seriesData, (subItem) => {
                          return {
                            ...subItem,
                            visible: newActiveLegend ? (legendBehaviour === 'hideItem' ? newActiveLegend !== subItem.id : newActiveLegend === subItem.id) : true,
                          };
                        }),
                      );
                    }}
                    className={classNames('renderer-timeseries-legend-list-item', {
                      disabled: item.disabled,
                    })}
                  >
                    <span className='renderer-timeseries-legend-color-symbol' style={{ backgroundColor: item.color }} />
                    <NameWithTooltip record={item}>
                      <span className='renderer-timeseries-legend-list-item-name'>{item.name}</span>
                    </NameWithTooltip>

                    <span className='renderer-timeseries-legend-list-item-calcs'>
                      {_.map(legendColumns, (column) => {
                        return (
                          <span key={column}>
                            {t(`panel.options.legend.${column}`)}: {item[column].text}
                          </span>
                        );
                      })}
                    </span>
                    <span className='renderer-timeseries-legend-list-item-link'>
                      {detailUrl && (
                        <a href={detailFormatter(item)} target='_blank'>
                          {detailName}
                        </a>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            {placement === 'right' && (
              <div
                className='renderer-timeseries-legend-toggle'
                onClick={() => {
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
