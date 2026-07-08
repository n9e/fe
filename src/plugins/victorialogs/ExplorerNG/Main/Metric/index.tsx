import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Empty, Form, Pagination, Radio, Select, Space, Spin, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { AlignedData, Options } from 'uplot';
import { useRequest, useSize } from 'ahooks';
import { Trans, useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import UPlotChart, { axisBuilder, cursorBuider, paddingSide, scalesBuilder, seriesBuider, tooltipPlugin } from '@/components/UPlotChart';
import { hexPalette } from '@/pages/dashboard/config';
import UnitPicker from '@/pages/dashboard/Components/UnitPicker';
import getDataFrameAndBaseSeries, { BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';
import { LegendTable } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/components/Legend';
import getLegendData from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getLegendData';
import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';
import flatten from '@/pages/logExplorer/components/LogsViewer/utils/flatten';
import getFieldsFromTableData from '@/pages/logExplorer/components/LogsViewer/utils/getFieldsFromTableData';

import { NAME_SPACE as VICTORIALOGS_NS } from '../../../constants';
import { DEFAULT_LOGS_PAGE_SIZE, METRIC_TABLE_COLUMNS_WIDTH_CACHE_KEY, METRIC_TABLE_OPTIONS_CACHE_KEY } from '../../constants';
import { Field } from '../../types';
import { dsQuery, logsQuery } from '../../services';
import filteredFields, { filterOutBuiltinFields } from '../../utils/filteredFields';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import { inferMetricTimeseriesKeysFromQuery } from '../../utils/logsQL';
import renderBuiltinFields from '../../utils/renderBuiltinFields';
import renderLogViewerFieldValueWithoutFilters from '../../utils/renderLogViewerFieldValueWithoutFilters';
import ResetZoomButton from './ResetZoomButton';

interface Props {
  indexData: Field[];
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
}

interface TableData {
  list: Record<string, any>[];
  total: number;
  hash: string;
  colWidths?: Record<string, number>;
  fields: string[];
}

function pickVisibleFields(row: Record<string, any>) {
  return _.pick(row, filterOutBuiltinFields(_.keys(row)));
}

function getSerieName(metric?: Record<string, string>) {
  const name = _.join(
    _.map(_.omit(metric || {}, '__name__'), (value, key) => `${key}: ${value}`),
    ' ',
  );
  return name || metric?.__name__ || 'value';
}

function Graph(props: {
  width: number;
  height: number;
  frames: AlignedData;
  baseSeries: BaseSeriesItem[];
  unit: string;
  showResetZoomBtn: boolean;
  setShowResetZoomBtn: (show: boolean) => void;
}) {
  const { darkMode } = useContext(CommonStateContext);
  const { width, height, frames, baseSeries, unit, showResetZoomBtn, setShowResetZoomBtn } = props;
  const xScaleInitMinMaxRef = useRef<[number, number]>();
  const yScaleInitMinMaxRef = useRef<[number, number]>();
  const uplotRef = useRef<any>();
  const id = useMemo(() => _.uniqueId('victorialogs_metric_'), []);
  const uOptions: Options = useMemo(() => {
    return {
      width,
      height,
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: 'all',
          sort: 'asc',
          pointValueformatter: (val) => {
            return valueFormatter({ unit }, val).text;
          },
        }),
      ],
      cursor: cursorBuider({}),
      scales: scalesBuilder({}),
      series: seriesBuider({
        baseSeries,
        colors: hexPalette,
        width: 2,
        pathsType: 'spline',
        points: { show: false },
        fillOpacity: 0,
        spanGaps: true,
      }),
      axes: [
        axisBuilder({
          isTime: true,
          theme: darkMode ? 'dark' : 'light',
        }),
        axisBuilder({
          scaleKey: 'y',
          theme: darkMode ? 'dark' : 'light',
          formatValue: (v) => {
            return valueFormatter({ unit }, v).text;
          },
        }),
      ],
      hooks: {
        setScale: [
          (u, scaleKey) => {
            if (scaleKey === 'x') {
              const min = u.scales.x.min;
              const max = u.scales.x.max;
              if (u.status === 0 && typeof min === 'number' && typeof max === 'number') {
                xScaleInitMinMaxRef.current = [min, max];
              } else if (u.status === 1) {
                if (_.isEqual(xScaleInitMinMaxRef.current, [min, max])) {
                  setShowResetZoomBtn(false);
                } else {
                  setShowResetZoomBtn(true);
                }
              }
            } else if (scaleKey === 'y') {
              const min = u.scales.y.min;
              const max = u.scales.y.max;
              if (u.status === 0 && typeof min === 'number' && typeof max === 'number') {
                yScaleInitMinMaxRef.current = [min, max];
              }
            }
          },
        ],
      },
    };
  }, [width, height, darkMode, JSON.stringify(baseSeries), unit]);

  return (
    <div className='relative'>
      <UPlotChart
        id={id}
        options={uOptions}
        data={frames}
        className='h-full min-h-0'
        onCreate={(_id, uplot) => {
          uplotRef.current = uplot;
        }}
      />
      <ResetZoomButton
        showResetZoomBtn={showResetZoomBtn}
        getUplot={() => {
          return uplotRef.current;
        }}
        xScaleInitMinMax={xScaleInitMinMaxRef.current}
        yScaleInitMinMax={yScaleInitMinMaxRef.current}
      />
    </div>
  );
}

export default function Metric(props: Props) {
  const { indexData, setExecuteLoading, executeQuery } = props;
  const { t } = useTranslation(VICTORIALOGS_NS);
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');
  const eleRef = useRef<HTMLDivElement>(null);
  const eleSize = useSize(eleRef);
  const loadTimeRef = useRef<number | null>(null);
  const timeseriesRequestIdRef = useRef(0);
  const [unit, setUnit] = useState('none');
  const [activeLegend, setActiveLegend] = useState<string>();
  const [dataRefresh, setDataRefresh] = useState(_.uniqueId('dataRefresh_'));
  const [showResetZoomBtn, setShowResetZoomBtn] = useState(false);
  const [timeseriesLoading, setTimeseriesLoading] = useState(false);
  const [series, setSeries] = useState<any[]>([]);
  const [options, setOptions] = useState({
    ...getOptionsFromLocalstorage(METRIC_TABLE_OPTIONS_CACHE_KEY, {
      logMode: 'table',
    }),
    time: 'false' as 'true' | 'false',
  });
  const [serviceParams, setServiceParams] = useState({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
  });
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const inferredKeys = useMemo(() => inferMetricTimeseriesKeysFromQuery(queryValues?.query), [queryValues?.query]);
  const valueKeyOptions = useMemo(() => {
    return _.map(_.uniq([...(queryValues?.keys?.valueKey || []), ...inferredKeys.valueKey]), (item) => ({ label: item, value: item }));
  }, [JSON.stringify(queryValues?.keys?.valueKey), JSON.stringify(inferredKeys.valueKey)]);
  const labelKeyOptions = useMemo(() => {
    return _.map(_.uniq([...(queryValues?.keys?.labelKey || []), ...inferredKeys.labelKey]), (item) => ({ label: item, value: item }));
  }, [JSON.stringify(queryValues?.keys?.labelKey), JSON.stringify(inferredKeys.labelKey)]);

  const setVizType = (value: 'table' | 'timeseries') => {
    form.setFields([
      {
        name: ['query', 'vizType'],
        value,
      },
    ]);
  };

  const vizTypeRadio = (
    <Radio.Group
      options={[
        { label: t(`${logExplorerNS}:logs.settings.mode.table`), value: 'table' },
        { label: t(`${logExplorerNS}:logs.settings.mode.timeseries`), value: 'timeseries' },
      ]}
      optionType='button'
      size='small'
      value={queryValues?.vizType}
      onChange={(e) => {
        setVizType(e.target.value);
      }}
    />
  );

  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(METRIC_TABLE_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      setServiceParams({
        current: 1,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
      });
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    }
  };

  const tableService = () => {
    const latestQueryValues = form.getFieldValue('query');
    if (latestQueryValues?.vizType === 'table' && refreshFlag && datasourceValue && latestQueryValues?.range && _.trim(latestQueryValues?.query)) {
      const range = parseRange(latestQueryValues.range);
      const queryStart = Date.now();
      return logsQuery({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue,
        query: [
          {
            query: _.trim(latestQueryValues.query),
            start: moment(range.start).unix(),
            end: moment(range.end).unix(),
            ref: 'A',
          },
        ],
      })
        .then((res) => {
          loadTimeRef.current = Date.now() - queryStart;
          const list = _.map(res.list || [], (item) => {
            const row = flatten(item) || {};
            return {
              ...row,
              ___raw___: item,
              ___id___: _.uniqueId('log_id_'),
            };
          });
          const visibleList = _.map(list, pickVisibleFields);
          return {
            list,
            total: list.length,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(visibleList),
            fields: filterOutBuiltinFields(getFieldsFromTableData(visibleList)),
          };
        })
        .catch(() => {
          loadTimeRef.current = null;
          return {
            list: [],
            total: 0,
            hash: _.uniqueId('logs_'),
            fields: [],
          };
        });
    }
    return Promise.resolve({
      list: [],
      total: 0,
      hash: _.uniqueId('logs_'),
      fields: [],
    });
  };

  const { data: tableData, loading: tableLoading } = useRequest<TableData, any>(tableService, {
    refreshDeps: [refreshFlag, queryValues?.vizType],
  });

  useEffect(() => {
    if (refreshFlag && queryValues?.vizType === 'table' && (serviceParams.current !== 1 || serviceParams.pageSize !== DEFAULT_LOGS_PAGE_SIZE)) {
      setServiceParams({ current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE });
    }
  }, [refreshFlag]);

  useEffect(() => {
    if (queryValues?.vizType !== 'timeseries') return;
    if (!_.isEmpty(queryValues?.keys?.valueKey) || (_.isEmpty(inferredKeys.valueKey) && _.isEmpty(inferredKeys.labelKey))) return;
    form.setFieldsValue({
      query: {
        ...queryValues,
        keys: inferredKeys,
      },
    });
  }, [queryValues?.vizType, queryValues?.query]);

  useEffect(() => {
    const requestId = ++timeseriesRequestIdRef.current;
    if (!refreshFlag || !datasourceValue || !queryValues?.range || !_.trim(queryValues?.query) || queryValues?.vizType !== 'timeseries') {
      setTimeseriesLoading(false);
      return;
    }
    const range = parseRange(queryValues.range);
    const valueKey = _.isEmpty(queryValues?.keys?.valueKey) ? inferredKeys.valueKey : queryValues.keys.valueKey;
    const labelKey = _.isEmpty(queryValues?.keys?.labelKey) ? inferredKeys.labelKey : queryValues.keys.labelKey;
    const keys = {
      valueKey: _.join(valueKey, ' '),
      labelKey: _.join(labelKey, ' '),
    };
    setTimeseriesLoading(true);
    dsQuery({
      cate: DatasourceCateEnum.victorialogs,
      datasource_id: datasourceValue,
      query: [
        {
          query: _.trim(queryValues.query),
          start: moment(range.start).unix(),
          end: moment(range.end).unix(),
          keys,
          ref: 'A',
        },
      ],
    })
      .then((res) => {
        if (requestId !== timeseriesRequestIdRef.current) return;
        const nextSeries = _.map(res, (item) => {
          return {
            id: _.uniqueId('series_'),
            refId: item.ref || item.refId,
            name: getSerieName(item.metric),
            metric: item.metric || {},
            data: _.map(item.values || [], (value) => [value[0], value[1] === null ? null : _.toNumber(value[1])]),
          };
        });
        setSeries(nextSeries);
        setDataRefresh(_.uniqueId('dataRefresh_'));
      })
      .catch((err) => {
        if (requestId !== timeseriesRequestIdRef.current) return;
        console.error('victorialogs dsQuery failed:', err);
        setSeries([]);
        setDataRefresh(_.uniqueId('dataRefresh_'));
      })
      .finally(() => {
        if (requestId !== timeseriesRequestIdRef.current) return;
        setTimeseriesLoading(false);
        setActiveLegend(undefined);
        setShowResetZoomBtn(false);
      });
  }, [refreshFlag, queryValues?.vizType, JSON.stringify(queryValues?.keys)]);

  useEffect(() => {
    setExecuteLoading(queryValues?.vizType === 'table' ? tableLoading : timeseriesLoading);
  }, [queryValues?.vizType, tableLoading, timeseriesLoading, setExecuteLoading]);

  const { frames, baseSeries } = useMemo(() => {
    return getDataFrameAndBaseSeries(series);
  }, [JSON.stringify(series)]);

  const seriesData = useMemo(() => {
    return _.map(baseSeries, (item) => {
      const id = item.n9e_internal.id;
      return {
        ...item,
        show: activeLegend ? activeLegend === id : true,
      };
    });
  }, [dataRefresh, activeLegend, JSON.stringify(baseSeries)]);

  const legendData = useMemo(() => {
    return getLegendData({
      frames,
      baseSeries: seriesData,
      hexPalette,
      standardOptions: { unit },
    });
  }, [dataRefresh, activeLegend, JSON.stringify(seriesData), unit]);

  const tableLogs = useMemo(() => {
    const list = tableData?.list || [];
    if (pageLoadMode !== 'pagination') return list;
    return _.slice(list, (serviceParams.current - 1) * serviceParams.pageSize, serviceParams.current * serviceParams.pageSize);
  }, [tableData?.hash, pageLoadMode, serviceParams.current, serviceParams.pageSize]);

  if (!refreshFlag) {
    return (
      <>
        <div className='flex justify-between pb-2'>{vizTypeRadio}</div>
        <div className='h-full flex items-center justify-center'>
          <Empty
            className='ant-empty-normal'
            image='/image/img_execute.svg'
            description={
              <Trans
                ns={logExplorerNS}
                i18nKey='before_query'
                components={{
                  b: (
                    <a
                      onClick={() => {
                        executeQuery();
                      }}
                    />
                  ),
                }}
              />
            }
            imageStyle={{ height: 80 }}
          />
        </div>
      </>
    );
  }

  if (queryValues?.vizType === 'table') {
    return !_.isEmpty(tableData?.list) ? (
      <LogsViewer
        indexData={indexData}
        id_key='___id___'
        raw_key='___raw___'
        hideHistogram
        hideTypeIcon
        loading={tableLoading}
        logs={tableLogs}
        logsHash={`${tableData?.hash}_${serviceParams.current}_${serviceParams.pageSize}`}
        colWidths={tableData?.colWidths}
        fields={tableData?.fields || []}
        options={options}
        filterFields={(fieldKeys) => filteredFields(fieldKeys)}
        logViewerFilterFields={(log) => filteredFields(_.keys(log))}
        logViewerRenderCustomTagsArea={renderBuiltinFields}
        customLogFieldRender={renderLogViewerFieldValueWithoutFilters}
        addonBefore={vizTypeRadio}
        optionsExtraRender={
          <Space>
            {loadTimeRef.current !== null && (
              <Space size={4}>
                <span>{t(`${logExplorerNS}:logs.duration`)} :</span>
                <span>{loadTimeRef.current} ms</span>
              </Space>
            )}
            {pageLoadMode === 'pagination' ? (
              <Pagination
                showQuickJumper
                size='small'
                total={tableData?.total}
                current={serviceParams.current}
                pageSize={serviceParams.pageSize}
                onChange={(current, pageSize) => {
                  setServiceParams({
                    current,
                    pageSize,
                  });
                }}
                showTotal={(total) => {
                  return (
                    <Space>
                      <span>{t(`${logExplorerNS}:logs.count`)} :</span>
                      <span>{total}</span>
                    </Space>
                  );
                }}
              />
            ) : (
              <Space size={4}>
                <span>{t(`${logExplorerNS}:logs.count`)} :</span>
                <span>{tableData?.total}</span>
              </Space>
            )}
          </Space>
        }
        onOptionsChange={updateOptions}
        tableColumnsWidthCacheKey={`${METRIC_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({ datasourceValue })}`}
        showDateField={false}
        showLogMode={false}
        showPageLoadMode
        linesColumnFormat={(val) => {
          if (pageLoadMode === 'infiniteScroll') return val;
          return serviceParams.pageSize * (serviceParams.current - 1) + val;
        }}
      />
    ) : tableLoading ? (
      <div className='flex justify-center'>
        <Empty className='ant-empty-normal' image='/image/img_executing.svg' description={t(`${logExplorerNS}:loading`)} imageStyle={{ height: 80 }} />
      </div>
    ) : (
      <>
        <div className='flex justify-between pb-2'>{vizTypeRadio}</div>
        <div className='flex justify-center'>
          <Empty className='ant-empty-normal' image='/image/img_empty.svg' description={t(`${logExplorerNS}:no_data`)} imageStyle={{ height: 80 }} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className='flex-shrink-0 mb-[18px] flex justify-between items-center'>
        <Space wrap align='start'>
          <Form.Item className='input-group-with-form-item-content-small' style={{ margin: 0 }}>
            {vizTypeRadio}
          </Form.Item>
          <InputGroupWithFormItem
            size='small'
            label={
              <Space>
                {t('explorer.timeseries.value_field')}
                <Tooltip title={t('explorer.timeseries.value_field_tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item
              name={['query', 'keys', 'valueKey']}
              rules={[
                {
                  required: true,
                  message: t('explorer.timeseries.value_field_required'),
                },
              ]}
              style={{ margin: 0 }}
            >
              <Select
                allowClear
                className='min-w-[120px] no-padding-small-multiple-select'
                mode='tags'
                size='small'
                options={valueKeyOptions}
                onChange={() => {
                  form.setFieldsValue({
                    refreshFlag: _.uniqueId('refreshFlag_'),
                  });
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem
            size='small'
            label={
              <Space>
                {t('explorer.timeseries.label_field')}
                <Tooltip title={t('explorer.timeseries.label_field_tip')}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Form.Item name={['query', 'keys', 'labelKey']} style={{ margin: 0 }}>
              <Select
                allowClear
                className='min-w-[120px] no-padding-small-multiple-select'
                mode='tags'
                size='small'
                options={labelKeyOptions}
                onChange={() => {
                  form.setFieldsValue({
                    refreshFlag: _.uniqueId('refreshFlag_'),
                  });
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
          <InputGroupWithFormItem label={t('explorer.timeseries.unit')} size='small'>
            <Form.Item noStyle>
              <UnitPicker
                size='small'
                dropdownMatchSelectWidth={false}
                style={{
                  minWidth: 120,
                }}
                value={unit}
                onChange={(val) => {
                  setUnit(val);
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Space>
      </div>
      {!_.isEmpty(frames) ? (
        <div className='min-h-0 best-looking-scroll'>
          <div ref={eleRef} className='min-h-[422px] relative'>
            <div className='n9e-antd-table-height-full'>
              <Spin spinning={timeseriesLoading}>
                {eleSize?.width && eleSize?.height && (
                  <Graph
                    width={eleSize.width}
                    height={eleSize.height}
                    frames={frames}
                    baseSeries={seriesData}
                    unit={unit}
                    showResetZoomBtn={showResetZoomBtn}
                    setShowResetZoomBtn={setShowResetZoomBtn}
                  />
                )}
              </Spin>
            </div>
          </div>
          <div className='flex-1 min-h-0 renderer-timeseries-ng-legend-container'>
            <LegendTable
              panel={{ options: {} } as any}
              data={legendData}
              legendColumns={['max', 'min', 'avg', 'sum', 'last']}
              onRowClick={(record) => {
                setActiveLegend(activeLegend !== record.id ? record.id : '');
              }}
            />
          </div>
        </div>
      ) : timeseriesLoading ? (
        <div className='flex justify-center'>
          <Empty className='ant-empty-normal' image='/image/img_executing.svg' description={t(`${logExplorerNS}:loading`)} imageStyle={{ height: 80 }} />
        </div>
      ) : (
        <div className='flex justify-center'>
          <Empty className='ant-empty-normal' image='/image/img_empty.svg' description={t(`${logExplorerNS}:no_data`)} imageStyle={{ height: 80 }} />
        </div>
      )}
    </>
  );
}
