import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { useGetState } from 'ahooks';
import { Empty, Spin, InputNumber, Select, Radio, Space, Checkbox, Tag, Form, Alert, Pagination } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { CommonStateContext } from '@/App';
import { PRIMARY_COLOR } from '@/utils/constant';
import FullscreenButton from '@/pages/explorer/components/FullscreenButton';
import { setLocalQueryHistory } from '@/components/HistoricalRecords/ConditionHistoricalRecords';

import { getLogsQuery } from './services';
import metricQuery from './metricQuery';
import { Field, dslBuilder, Filter, getFieldLabel } from './utils';
import calcInterval from './utils/calcInterval';
import FieldsSidebar from './FieldsSidebar';
import QueryBuilder from './QueryBuilder';
import QueryBuilderWithIndexPatterns from './QueryBuilderWithIndexPatterns';
import Table from './Table';
import Share from '../components/Share';

import './style.less';

// @ts-ignore
import DrilldownBtn from 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn';
// @ts-ignore
import DownloadModal from 'plus:/datasource/elasticsearch/components/LogDownload/DownloadModal';
// @ts-ignore
import ExportModal from 'plus:/datasource/elasticsearch/components/LogDownload/ExportModal';

interface IProps {
  headerExtra: HTMLDivElement | null;
  datasourceValue?: number;
  form: FormInstance;
  isOpenSearch?: boolean;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}

interface Interval {
  value: number;
  unit: 'second' | 'min' | 'hour' | 'day';
}
enum IMode {
  indexPatterns = 'index-patterns',
  indices = 'indices',
}

const TIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
const MAX_RESULT_WINDOW = 10000; // ES 默认最大返回 10000 条数据，超过需要设置 index.max_result_window
export const CACHE_KEY_MAP = {
  indices: 'es-indices-query-history-records',
  'index-patterns': 'es-index-patterns-query-history-records',
};
export const SYNTAX_OPTIONS = [
  {
    label: 'Lucene',
    value: 'lucene',
  },
  {
    label: 'KQL',
    value: 'kuery',
  },
];

const HeaderExtra = ({ mode, setMode, allowHideSystemIndices, setAllowHideSystemIndices, datasourceValue }) => {
  const { t } = useTranslation('explorer');
  const { esIndexMode, isPlus } = useContext(CommonStateContext);
  // 如果固定了 indexPatterns 模式，不显示切换按钮
  if (esIndexMode === 'index-patterns' || esIndexMode === 'indices') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div />
        <Space>
          <Share />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Space>
        <Radio.Group
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
          }}
          buttonStyle='solid'
        >
          <Radio.Button value={IMode.indexPatterns}>{t('log.mode.indexPatterns')}</Radio.Button>
          <Radio.Button value={IMode.indices}>{t('log.mode.indices')}</Radio.Button>
        </Radio.Group>
        {mode === IMode.indices && (
          <Checkbox
            checked={allowHideSystemIndices}
            onChange={(e) => {
              setAllowHideSystemIndices(e.target.checked);
            }}
          >
            {t('es-index-patterns:allow_hide_system_indices')}
          </Checkbox>
        )}
      </Space>
      <Space>
        {isPlus && mode === IMode.indices && <DrilldownBtn />}
        {isPlus && <ExportModal datasourceValue={datasourceValue} />}
        <Share />
      </Space>
    </div>
  );
};

const getDefaultMode = (query, isOpenSearch, esIndexMode, value?) => {
  if (isOpenSearch) return IMode.indices;
  if (esIndexMode === 'index-patterns') {
    return IMode.indexPatterns;
  }
  if (query?.mode === 'Pattern') {
    return IMode.indexPatterns;
  }
  if (query?.data_source_id && query?.index_name) {
    return IMode.indices;
  }
  return value || IMode.indices;
};

export default function index(props: IProps) {
  const { t } = useTranslation('explorer');
  const { esIndexMode, isPlus } = useContext(CommonStateContext);
  const { headerExtra, datasourceValue, form, isOpenSearch = false, defaultFormValuesControl } = props;
  const query = queryString.parse(useLocation().search);
  const [loading, setLoading] = useState(false); // table
  const [timeseriesLoading, setTimeseriesLoading] = useState(false); // timeseries
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationOptions, setPaginationOptions, getPaginationOptions] = useGetState({
    current: 1,
    pageSize: 20,
  });
  const [series, setSeries] = useState<any[]>([]);
  const [displayTimes, setDisplayTimes] = useState('');
  const [fields, setFields, getFields] = useGetState<Field[]>([]);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [interval, setInterval] = useState<Interval>();
  const intervalFixedRef = useRef<boolean>(false);
  const [chartVisible, setChartVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [filters, setFilters, getFilters] = useGetState<Filter[]>();
  const [errorContent, setErrorContent] = useState();
  const fieldConfig = Form.useWatch('fieldConfig', form);
  const date_field = Form.useWatch(['query', 'date_field'], form);
  const sorterRef = useRef<any>([]);
  const timesRef = useRef<{
    start: number;
    end: number;
  }>();
  const [mode, setMode] = useState<IMode>(getDefaultMode(query, isOpenSearch, esIndexMode));
  const [allowHideSystemIndices, setAllowHideSystemIndices] = useState<boolean>(false);
  const requestId = useMemo(() => _.uniqueId('requestId_'), []);

  const fetchSeries = (
    values,
    curInterval = {
      value: 1,
      unit: 'min',
    } as Interval,
  ) => {
    if (timesRef.current) {
      const { start, end } = timesRef.current;
      setTimeseriesLoading(true);
      metricQuery({
        ...timesRef.current,
        datasourceValue: values.datasourceValue,
        query: values.query,
        interval: curInterval.value,
        intervalUnit: curInterval.unit,
        filters,
      })
        .then((res) => {
          setDisplayTimes(`${moment(start).format(TIME_FORMAT)} - ${moment(end).format(TIME_FORMAT)}`);
          setSeries(res || []);
        })
        .catch((e) => {
          console.error(e);
          setSeries([]);
        })
        .finally(() => {
          setTimeseriesLoading(false);
        });
    }
  };

  const fetchData = () => {
    form.validateFields().then((values) => {
      if (!values.query) return;
      const { start, end } = parseRange(values.query.range);
      timesRef.current = {
        start: moment(start).valueOf(),
        end: moment(end).valueOf(),
      };
      // 如果 interval 没有被手动修改过，则根据时间范围计算 interval
      if (!intervalFixedRef.current) {
        const newInterval = calcInterval(moment(start), moment(end));
        setInterval(newInterval);
        fetchSeries(values, newInterval);
      } else {
        fetchSeries(values, interval);
      }
      setLoading(true);
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: 'elasticsearch',
          datasourceValue,
          query: values.query,
        });
      }
      let requestBody;
      try {
        requestBody = dslBuilder({
          index: values.query.index,
          ...timesRef.current,
          date_field: values.query.date_field,
          filters,
          syntax: values.query.syntax,
          query_string: values.query.filter,
          kuery: values.query.filter,
          from: (paginationOptions.current - 1) * paginationOptions.pageSize,
          limit: paginationOptions.pageSize,
          sorter: _.isEmpty(sorterRef.current)
            ? [
                {
                  field: values.query.date_field,
                  order: 'desc',
                },
              ]
            : sorterRef.current,
          _source: true,
          shouldHighlight: true,
        });
      } catch (e: any) {
        setErrorContent(_.get(e, 'message', t('datasource:es.queryFailed')));
        setLoading(false);
      }
      if (!requestBody) return;
      getLogsQuery(values.datasourceValue, requestBody, requestId)
        .then((res) => {
          const newData = _.map(res.list, (item) => {
            return {
              id: _.uniqueId(),
              fields: item.fields,
              highlight: item.highlight,
              json: item._source,
            };
          });
          setData(newData);
          setTotal(res.total);
          setErrorContent(undefined);
          const tableEleNodes = document.querySelectorAll(`.es-discover-logs-table .ant-table-body`)[0];
          tableEleNodes?.scrollTo(0, 0);
        })
        .catch((e: any) => {
          console.error(e);
          if (e.name !== 'AbortError') {
            setErrorContent(_.get(e, 'message', t('datasource:es.queryFailed')));
            setData([]);
            setTotal(0);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const resetThenRefresh = () => {
    const paginationOptions = getPaginationOptions();
    if (paginationOptions.current !== 1) {
      setPaginationOptions({
        ...paginationOptions,
        current: 1,
      });
    } else {
      fetchData();
    }
  };

  // 设置历史记录方法
  const setHistory = () => {
    const queryValues = form.getFieldValue(['query']);
    if (queryValues.index && queryValues.date_field) {
      setLocalQueryHistory(`${CACHE_KEY_MAP[queryValues.mode]}-${datasourceValue}`, _.omit(queryValues, 'range'));
    }
  };

  useEffect(() => {
    if (_.isArray(filters)) {
      // 如果有过滤条件，则清空当前页码，重新查询
      resetThenRefresh();
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [paginationOptions.current, paginationOptions.pageSize]);

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue(defaultFormValuesControl.defaultFormValues);
      defaultFormValuesControl.setIsInited();
      setMode(getDefaultMode(query, isOpenSearch, esIndexMode, defaultFormValuesControl?.defaultFormValues?.query?.mode));
    }
  }, []);

  if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) return null;

  return (
    <div className='es-discover-container'>
      {!isOpenSearch ? (
        <>
          {headerExtra &&
            createPortal(
              <HeaderExtra
                mode={mode}
                setMode={(val) => {
                  const queryValues = form.getFieldValue('query');
                  form.setFieldsValue({
                    fieldConfig: undefined,
                    query: {
                      ...(queryValues || {}),
                      index: undefined,
                      indexPattern: undefined,
                      mode: val,
                    },
                  });
                  setMode(val);
                  setData([]);
                  setTotal(0);
                }}
                allowHideSystemIndices={allowHideSystemIndices}
                setAllowHideSystemIndices={setAllowHideSystemIndices}
                datasourceValue={datasourceValue}
              />,
              headerExtra,
            )}
        </>
      ) : (
        <>
          {headerExtra &&
            createPortal(
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div />
                <Space>
                  <Share />
                </Space>
              </div>,
              headerExtra,
            )}
        </>
      )}
      <Form.Item name={['query', 'mode']} hidden>
        <div />
      </Form.Item>
      {mode === IMode.indices && (
        <QueryBuilder
          loading={loading}
          key={datasourceValue}
          onExecute={resetThenRefresh}
          datasourceValue={datasourceValue}
          setFields={setFields}
          allowHideSystemIndices={allowHideSystemIndices}
          form={form}
          setHistory={setHistory}
          resetFilters={() => {
            setFilters([]);
          }}
        />
      )}
      {mode === IMode.indexPatterns && (
        <QueryBuilderWithIndexPatterns
          loading={loading}
          key={datasourceValue}
          onExecute={resetThenRefresh}
          datasourceValue={datasourceValue}
          form={form}
          setFields={setFields}
          onIndexChange={() => {
            setSelectedFields([]);
            resetThenRefresh();
          }}
          setHistory={setHistory}
          resetFilters={() => {
            setFilters([]);
          }}
        />
      )}
      <div style={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
        {!_.isEmpty(filters) && (
          <div className='es-discover-filters'>
            {_.map(filters, (filter) => {
              if (filter.operator === 'exists') {
                return (
                  <Tag
                    key={JSON.stringify(filter)}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      setFilters(_.filter(filters, (item) => item.key !== filter.key));
                    }}
                  >
                    {getFieldLabel(filter.key, fieldConfig)}: exists
                  </Tag>
                );
              }
              return (
                <Tag
                  key={JSON.stringify(filter)}
                  closable
                  color={filter.operator === 'is not' ? 'red' : undefined}
                  onClose={(e) => {
                    e.preventDefault();
                    setFilters(
                      _.filter(filters, (item) => {
                        if (item.key === filter.key && item.value === filter.value) return false;
                        return true;
                      }),
                    );
                  }}
                >
                  {filter.operator === 'is not' ? 'NOT ' : ''}
                  {getFieldLabel(filter.key, fieldConfig)}: {filter.value}
                </Tag>
              );
            })}
          </div>
        )}

        {!_.isEmpty(data) || !_.isEmpty(series) ? (
          <div className='es-discover-content'>
            {collapsed && (
              <FieldsSidebar
                fieldConfig={form.getFieldValue(['fieldConfig'])}
                fields={fields}
                setFields={setFields}
                value={selectedFields}
                onChange={setSelectedFields}
                params={{ from: (paginationOptions.current - 1) * paginationOptions.pageSize, timesRef, datasourceValue, limit: paginationOptions.pageSize }}
                filters={filters}
                onValueFilter={({ key, value, operator }) => {
                  // key + value 作为唯一标识，存在则更新，不存在则新增
                  if (!_.find(filters, { key, value })) {
                    setFilters([...(filters || []), { key, value, operator }]);
                  } else {
                    setFilters(
                      _.map(filters, (item) => {
                        if (item.key === key && item.value === value) {
                          return {
                            ...item,
                            value,
                            operator,
                          };
                        }
                        return item;
                      }),
                    );
                  }
                }}
              />
            )}
            <div
              className='es-discover-main'
              style={{
                width: collapsed ? 'calc(100% - 266px)' : '100%',
              }}
            >
              <div
                className='es-discover-chart'
                style={{
                  height: chartVisible && date_field ? 190 : 40,
                  borderBottom: '1px solid var(--fc-border-color)',
                }}
              >
                <div className='es-discover-chart-title'>
                  <Space size={4} className='ml-2'>
                    <strong>{total}</strong>
                    hits
                    <div style={{ width: 40, height: 32, lineHeight: '32px' }}>
                      <Spin spinning={timeseriesLoading} size='small' className='ml1' />
                    </div>
                  </Space>
                  {!_.isEmpty(series) && (
                    <>
                      <div className='es-discover-chart-title-content'>
                        {chartVisible && (
                          <>
                            <span>{displayTimes}</span>
                            <span style={{ marginLeft: 10 }}>
                              {t('log.interval')}:{' '}
                              <InputNumber
                                size='small'
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
                                    fetchSeries(form.getFieldsValue(), newInterval);
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
                                    fetchSeries(form.getFieldsValue(), newInterval);
                                  }
                                }}
                              />{' '}
                              <Select
                                size='small'
                                style={{ width: 80 }}
                                value={interval?.unit}
                                onChange={(val) => {
                                  intervalFixedRef.current = true;
                                  const newInterval = {
                                    ...(interval || {}),
                                    unit: val,
                                  } as Interval;
                                  setInterval(newInterval);
                                  fetchSeries(form.getFieldsValue(), newInterval);
                                }}
                              >
                                <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                                <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                                <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                                <Select.Option value='day'>{t('common:time.day')}</Select.Option>
                              </Select>
                            </span>
                          </>
                        )}
                      </div>

                      <div className='es-discover-chart-title-action'>
                        <a
                          onClick={() => {
                            setChartVisible(!chartVisible);
                          }}
                        >
                          {chartVisible ? t('log.hideChart') : t('log.showChart')}
                        </a>
                        {isPlus && <DownloadModal queryData={{ ...form.getFieldsValue(), mode, total: total }} />}
                      </div>
                    </>
                  )}
                </div>
                {chartVisible && !_.isEmpty(series) && (
                  <div className='es-discover-chart-content'>
                    <Timeseries
                      series={series}
                      values={
                        {
                          custom: {
                            drawStyle: 'bar',
                            lineInterpolation: 'smooth',
                          },
                          options: {
                            legend: {
                              displayMode: 'hidden',
                            },
                            tooltip: {
                              mode: 'all',
                            },
                          },
                        } as any
                      }
                      hideResetBtn
                      onZoomWithoutDefult={(times) => {
                        form.setFieldsValue({
                          query: {
                            ...query,
                            range: {
                              start: moment(times[0]),
                              end: moment(times[1]),
                            },
                          },
                        });
                        fetchData();
                      }}
                      colors={[PRIMARY_COLOR]}
                    />
                  </div>
                )}
              </div>
              <FullscreenButton.Provider>
                <div className='p1 n9e-flex n9e-justify-between n9e-items-center'>
                  <div>
                    <Space>
                      <FullscreenButton />
                      <Spin spinning={loading} size='small' />
                    </Space>
                  </div>
                  <Pagination
                    size='small'
                    {...paginationOptions}
                    total={total > MAX_RESULT_WINDOW ? MAX_RESULT_WINDOW : total}
                    onChange={(current, pageSize) => {
                      setPaginationOptions({
                        ...paginationOptions,
                        current,
                        pageSize,
                      });
                    }}
                    showTotal={(total) => {
                      return t('common:table.total', { total });
                    }}
                  />
                </div>
                <Table
                  data={data}
                  onChange={(pagination, filters, sorter: any, extra) => {
                    sorterRef.current = _.map(_.isArray(sorter) ? sorter : [sorter], (item) => {
                      return {
                        field: item.columnKey,
                        order: item.order === 'ascend' ? 'asc' : 'desc',
                      };
                    });
                    resetThenRefresh();
                  }}
                  getFields={getFields}
                  selectedFields={selectedFields}
                  onActionClick={({ key, value, operator }) => {
                    const currentFilters = getFilters();
                    if (operator === 'exists') {
                      // 如果是 exists 操作，则不需要 value
                      if (!_.find(currentFilters, { key, operator })) {
                        setFilters([...(currentFilters || []), { key, operator, value: '' }]);
                      }
                    } else {
                      if (value) {
                        // key + value 作为唯一标识，存在则更新，不存在则新增
                        if (!_.find(currentFilters, { key, value })) {
                          setFilters([...(currentFilters || []), { key, value, operator }]);
                        } else {
                          setFilters(
                            _.map(currentFilters, (item) => {
                              if (item.key === key && item.value === value) {
                                return {
                                  ...item,
                                  value,
                                  operator,
                                };
                              }
                              return item;
                            }),
                          );
                        }
                      }
                    }
                  }}
                />
              </FullscreenButton.Provider>
              <div
                className='es-discover-collapse'
                onClick={() => {
                  setCollapsed(!collapsed);
                }}
              >
                {collapsed ? <LeftOutlined /> : <RightOutlined />}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            {errorContent && <Alert style={{ marginBottom: 16 }} message={errorContent} type='error' />}
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </div>
    </div>
  );
}
