import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Form, Space, Pagination, Empty, Popover, InputNumber, Select, Tag } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { useRequest } from 'ahooks';
import purify from 'dompurify';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';
import useFieldConfig from '@/pages/logExplorer/components/RenderValue/useFieldConfig';

import { NAME_SPACE, LOGS_OPTIONS_CACHE_KEY, DEFAULT_LOGS_PAGE_SIZE, LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY } from '../../../constants';
import { getLogsQuery, getHistogram } from '../../../services';
import dslBuilder from '../../../utils/dslBuilder';
import { getHighlightHtml } from '../../../utils/highlight';
import { Field, Interval } from '../../types';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import filteredFields, { filterOutBuiltinFields } from '../../utils/filteredFields';
import { HandleValueFilterParams } from '../../types';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

export function getFields(logs, DateField) {
  const fields: string[] = [];
  _.forEach(logs, (log) => {
    _.forEach(log, (_val, key) => {
      if (fields.indexOf(key) === -1 && key !== DateField) {
        fields.push(key);
      }
    });
  });
  return _.sortBy(fields);
}

export function getFieldLabel(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.attrs?.[fieldKey]?.alias || fieldKey;
}

interface Props {
  indexData: Field[];
  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  handleValueFilter: HandleValueFilterParams;
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;

  interval?: Interval;
  setInterval: React.Dispatch<React.SetStateAction<Interval | undefined>>;
  intervalFixedRef: React.MutableRefObject<boolean>;

  serviceParams: {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
  setServiceParams: React.Dispatch<
    React.SetStateAction<{
      current: number;
      pageSize: number;
      reverse: boolean;
      refreshFlag: string | undefined;
    }>
  >;
  getServiceParams: () => {
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  };
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  const {
    indexData,
    rangeRef,
    snapRangeRef,
    organizeFields,
    setOrganizeFields,
    handleValueFilter,
    setExecuteLoading,
    executeQuery,
    interval,
    setInterval,
    intervalFixedRef,
    serviceParams,
    setServiceParams,
    getServiceParams,
  } = props;

  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');

  const requestId = useMemo(() => _.uniqueId('requestId_'), []);

  const [options, setOptions] = useState(getOptionsFromLocalstorage(LOGS_OPTIONS_CACHE_KEY));

  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    // 只有在修改了 pageLoadMode 时才重置分页参数
    if (reload) {
      setServiceParams({
        ...serviceParams,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
        current: 1,
        refreshFlag: _.uniqueId('refreshFlag_'), // 避免其他参数没变时不触发刷新
      });
    }
  };

  // 分页时的时间范围不变
  const fixedRangeRef = useRef<boolean>(false);
  const loadTimeRef = useRef<number | null>(null);

  const service = () => {
    const queryValues = form.getFieldValue('query'); // 实时获取最新的查询条件
    if (refreshFlag && datasourceValue && queryValues.range) {
      const range = parseRange(queryValues.range);
      let timeParams =
        fixedRangeRef.current === false
          ? {
              from: moment(range.start).valueOf(),
              to: moment(range.end).valueOf(),
            }
          : rangeRef.current!;
      if (snapRangeRef.current && snapRangeRef.current.from && snapRangeRef.current.to) {
        timeParams = snapRangeRef.current as { from: number; to: number };
      }
      rangeRef.current = timeParams;

      let requestBody;
      try {
        requestBody = dslBuilder({
          start: timeParams.from,
          end: timeParams.to,
          index: queryValues.index,
          date_field: queryValues.date_field,
          filters: queryValues.filters,
          syntax: queryValues.syntax,
          query_string: queryValues.query,
          kuery: queryValues.query,
          from: (serviceParams.current - 1) * serviceParams.pageSize,
          limit: serviceParams.pageSize,
          sorter: [
            {
              field: queryValues.date_field,
              order: serviceParams.reverse ? 'desc' : 'asc',
            },
          ],
          _source: true,
          shouldHighlight: true,
        });
      } catch (e: any) {
        loadTimeRef.current = null;
        return Promise.resolve({
          list: [],
          total: 0,
          hash: _.uniqueId('logs_'),
          fields: [],
          highlights: [],
        });
      }

      const queryStart = Date.now();
      return getLogsQuery(datasourceValue, requestBody, requestId)
        .then((res) => {
          if (fixedRangeRef.current === false) {
            loadTimeRef.current = Date.now() - queryStart;
          }
          const newData = _.map(res.list, (item) => {
            const log = (item._source ?? {}) as {
              [index: string]: string;
            };
            return {
              ...log,
              __n9e_raw_n9e__: log as any,
              __n9e_id_n9e__: _.uniqueId('log_id_'),
            };
          });
          return {
            list: newData,
            total: res.total,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(newData),
            fields: filterOutBuiltinFields(getFields(newData, queryValues.date_field)),
            highlights: _.map(res.list, (item) => item.highlight || {}),
          };
        })
        .catch((e: any) => {
          loadTimeRef.current = null;
          return {
            list: [],
            total: 0,
            hash: _.uniqueId('logs_'),
            fields: [],
            highlights: [],
          };
        })
        .finally(() => {
          fixedRangeRef.current = false;
        });
    }
    return Promise.resolve({
      list: [],
      total: 0,
      hash: _.uniqueId('logs_'),
      fields: [],
      highlights: [],
    });
  };

  const {
    data,
    loading,
    run: fetchLogs,
    mutate: setData,
  } = useRequest<
    {
      list: { [index: string]: string }[];
      total: number;
      hash: string;
      colWidths?: { [key: string]: number };
      fields: string[]; // 日志内容的所有不重复字段名
      highlights: {
        [key: string]: string[];
      }[];
    },
    any
  >(service, {
    refreshDeps: [JSON.stringify(serviceParams)],
  });

  const histogramService = () => {
    const queryValues = form.getFieldValue('query'); // 实时获取最新的查询条件
    if (refreshFlag && datasourceValue && queryValues && queryValues.index && queryValues.date_field && queryValues.range) {
      const range = parseRange(queryValues.range);
      return getHistogram({
        datasourceValue: datasourceValue,
        query: {
          index: queryValues.index,
          syntax: queryValues.syntax,
          date_field: queryValues.date_field,
          query: queryValues.query,
        },
        start: moment(range.start).valueOf(),
        end: moment(range.end).valueOf(),
        interval: interval?.value || 60,
        intervalUnit: interval?.unit || 'second',
        filters: queryValues.filters,
      })
        .then((res) => {
          return {
            data: res,
            hash: _.uniqueId('histogram_'),
          };
        })
        .catch(() => {
          return {
            data: [],
            hash: _.uniqueId('histogram_'),
          };
        });
    } else {
      return Promise.resolve({
        data: [],
        hash: _.uniqueId('histogram_'),
      });
    }
  };

  const {
    data: histogramData,
    loading: histogramLoading,
    mutate: setHistogramData,
  } = useRequest<
    {
      data: any[];
      hash: string;
    },
    any
  >(histogramService, {
    refreshDeps: [refreshFlag, interval?.unit, interval?.value],
  });

  useEffect(() => {
    if (refreshFlag) {
      const currentServiceParams = getServiceParams();
      if (currentServiceParams.current !== 1) {
        setServiceParams((prev) => ({
          ...prev,
          current: 1,
        }));
      } else {
        fetchLogs();
      }
    }
  }, [refreshFlag]);

  const currentFieldConfig = useFieldConfig(
    {
      cate: DatasourceCateEnum.elasticsearch,
      indexPatternId: queryValues?.indexPattern,
      datasource_id: form.getFieldValue('datasourceValue'),
      resource: { es_resource: { index: queryValues?.index } },
    },
    refreshFlag,
  );

  useEffect(() => {
    setExecuteLoading(loading || histogramLoading);
  }, [loading, histogramLoading]);

  return (
    <>
      {!_.isEmpty(queryValues?.filters) && (
        <div className='flex flex-wrap gap-2 mb-2 children:mr-0'>
          {_.map(queryValues.filters, (filter) => {
            if (filter.operator === 'EXISTS') {
              return (
                <Tag
                  key={JSON.stringify(filter)}
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    form.setFieldsValue({
                      query: {
                        filters: _.filter(queryValues.filters, (item) => {
                          if (item.key === filter.key && item.operator === filter.operator && item.value === filter.value) return false;
                          return true;
                        }),
                      },
                    });
                    executeQuery();
                  }}
                >
                  {getFieldLabel(filter.key, currentFieldConfig)}: exists
                </Tag>
              );
            }
            return (
              <Tag
                key={JSON.stringify(filter)}
                closable
                color={filter.operator === 'NOT' ? 'red' : undefined}
                onClose={(e) => {
                  e.preventDefault();
                  form.setFieldsValue({
                    query: {
                      filters: _.filter(queryValues.filters, (item) => {
                        if (item.key === filter.key && item.operator === filter.operator && item.value === filter.value) return false;
                        return true;
                      }),
                    },
                  });
                  executeQuery();
                }}
              >
                {filter.operator === 'NOT' ? 'NOT ' : ''}
                {getFieldLabel(filter.key, currentFieldConfig)}: {filter.value}
              </Tag>
            );
          })}
        </div>
      )}
      {refreshFlag ? (
        <>
          {!_.isEmpty(data?.list) || !_.isEmpty(histogramData?.data) ? (
            <LogsViewer
              // state context
              fieldConfig={currentFieldConfig}
              indexData={indexData}
              range={queryValues?.range}
              // props
              id_key='__n9e_id_n9e__'
              raw_key='__n9e_raw_n9e__'
              showExistsAction
              timeField={queryValues?.date_field}
              histogramLoading={histogramLoading}
              histogram={histogramData?.data || []}
              histogramHash={histogramData?.hash}
              loading={loading}
              logs={data?.list || []}
              highlights={data?.highlights || []}
              logsHash={data?.hash}
              fields={data?.fields || []}
              showTopNSettings
              options={options}
              organizeFields={organizeFields}
              setOrganizeFields={setOrganizeFields}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, organizeFields);
              }}
              renderHistogramAddonAfterRender={(toggleNode) => {
                if (data) {
                  return (
                    <Space>
                      {rangeRef.current && (
                        <>
                          {moment(rangeRef.current?.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment(rangeRef.current?.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                        </>
                      )}
                      <Popover
                        trigger='click'
                        content={
                          <Space>
                            <InputNumber
                              value={interval?.value}
                              min={1}
                              onBlur={(e) => {
                                const val = _.toNumber(e.target.value);
                                if (val > 0) {
                                  intervalFixedRef.current = true;
                                  const newInterval = {
                                    ...(interval || {}),
                                    value: val,
                                  } as Interval;
                                  setInterval(newInterval);
                                }
                              }}
                              onPressEnter={(e: any) => {
                                const val = _.toNumber(e.target.value);
                                if (val > 0) {
                                  intervalFixedRef.current = true;
                                  const newInterval = {
                                    ...(interval || {}),
                                    value: val,
                                  } as Interval;
                                  setInterval(newInterval);
                                }
                              }}
                            />
                            <Select
                              style={{ width: 80 }}
                              value={interval?.unit}
                              onChange={(val) => {
                                intervalFixedRef.current = true;
                                const newInterval = {
                                  ...(interval || {}),
                                  unit: val,
                                } as Interval;
                                setInterval(newInterval);
                              }}
                              options={[
                                {
                                  label: t('common:time.second'),
                                  value: 'second',
                                },
                                {
                                  label: t('common:time.minute'),
                                  value: 'min',
                                },
                                {
                                  label: t('common:time.hour'),
                                  value: 'hour',
                                },
                                {
                                  label: t('common:time.day'),
                                  value: 'day',
                                },
                              ]}
                            />
                          </Space>
                        }
                      >
                        <a>{t('query.interval_label')}</a>
                      </Popover>
                      {toggleNode}
                      {IS_PLUS && <DownloadModal marginLeft={0} queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
                    </Space>
                  );
                }
                return toggleNode;
              }}
              colWidths={data?.colWidths}
              tableColumnsWidthCacheKey={`${LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({
                datasourceValue,
                index: queryValues?.index,
                indexData: _.sortBy(indexData, 'field'),
              })}`}
              optionsExtraRender={
                <Space>
                  {loadTimeRef.current !== null && (
                    <Space size={4}>
                      <span>{t(`${logExplorerNS}:logs.duration`)} :</span>
                      <span>{loadTimeRef.current} ms</span>
                    </Space>
                  )}
                  <Pagination
                    size='small'
                    total={data?.total}
                    current={serviceParams.current}
                    pageSize={serviceParams.pageSize}
                    onChange={(current, pageSize) => {
                      fixedRangeRef.current = true;
                      setServiceParams((prev) => ({
                        ...prev,
                        current,
                        pageSize,
                      }));
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
                </Space>
              }
              onOptionsChange={updateOptions}
              onAddToQuery={handleValueFilter}
              onRangeChange={(range) => {
                const query = form.getFieldValue('query') || {};
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                form.setFieldsValue({
                  query: {
                    ...query,
                    range,
                  },
                });
                executeQuery();
              }}
              onLogRequestParamsChange={(params) => {
                // 这里只更新 serviceParams 从而只刷新日志数据，不刷新直方图
                // 点击直方图某个柱子时设置时间范围
                if (params.from && params.to) {
                  snapRangeRef.current = {
                    from: params.from,
                    to: params.to,
                  };
                  setServiceParams((prev) => ({
                    ...prev,
                    current: 1,
                    refreshFlag: _.uniqueId('refreshFlag_'), // 避免其他参数没变时不触发刷新
                  }));
                }
                // 点击表格时间列排序时设置顺序
                if (params.reverse !== undefined) {
                  setServiceParams((prev) => ({
                    ...prev,
                    current: 1,
                    reverse: params.reverse,
                  }));
                }
              }}
              timeFieldColumnFormat={(val) => {
                if (_.isString(val)) {
                  const parsedTime = moment(val);
                  if (parsedTime.isValid()) {
                    return parsedTime.format('YYYY-MM-DD HH:mm:ss');
                  }
                }
                return val as string;
              }}
              linesColumnFormat={(val) => {
                return serviceParams.pageSize * (serviceParams.current - 1) + val;
              }}
              adjustFieldValue={(formatedValue, highlightValue) => {
                // console.log(formatedValue, highlightValue);
                if (highlightValue) {
                  return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(formatedValue, highlightValue)) }} />;
                }
                return formatedValue;
              }}
            />
          ) : loading || histogramLoading ? (
            <div className='flex justify-center'>
              <Empty
                className='ant-empty-normal'
                image='/image/img_executing.svg'
                description={t(`${logExplorerNS}:loading`)}
                imageStyle={{
                  height: 80,
                }}
              />
            </div>
          ) : (
            <div className='flex justify-center'>
              <Empty
                className='ant-empty-normal'
                image='/image/img_empty.svg'
                description={t(`${logExplorerNS}:no_data`)}
                imageStyle={{
                  height: 80,
                }}
              />
            </div>
          )}
        </>
      ) : (
        <div className='flex justify-center'>
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
                        setData({
                          list: [],
                          total: 0,
                          hash: _.uniqueId('logs_'),
                          fields: [],
                          highlights: [],
                        });
                        setHistogramData({
                          data: [],
                          hash: _.uniqueId('histogram_'),
                        });
                        executeQuery();
                      }}
                    />
                  ),
                }}
              />
            }
            imageStyle={{
              height: 80,
            }}
          />
        </div>
      )}
    </>
  );
}
