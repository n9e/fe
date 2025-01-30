import React, { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { useGetState } from 'ahooks';
import { Empty, Spin, InputNumber, Select, Radio, Space, Checkbox, Tag, Form, Alert } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { getLogsQuery } from './services';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { CommonStateContext } from '@/App';
import { PRIMARY_COLOR } from '@/utils/constant';
import metricQuery from './metricQuery';
import { Field, dslBuilder, Filter, getFieldLabel } from './utils';
import FieldsSidebar from './FieldsSidebar';
import QueryBuilder from './QueryBuilder';
import QueryBuilderWithIndexPatterns from './QueryBuilderWithIndexPatterns';
import Table from './Table';
import Share from '../components/Share';
import './style.less';
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

const LOGS_LIMIT = 500;
const TIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
enum IMode {
  indexPatterns = 'index-patterns',
  indices = 'indices',
}

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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [series, setSeries] = useState<any[]>([]);
  const [displayTimes, setDisplayTimes] = useState('');
  const [fields, setFields, getFields] = useGetState<Field[]>([]);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [interval, setInterval] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<'second' | 'min' | 'hour'>('min');
  const [chartVisible, setChartVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [filters, setFilters] = useState<Filter[]>();
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

  const fetchSeries = (values) => {
    if (timesRef.current) {
      const { start, end } = timesRef.current;
      metricQuery({
        ...timesRef.current,
        datasourceValue: values.datasourceValue,
        query: values.query,
        interval,
        intervalUnit,
        filters,
      }).then((res) => {
        setDisplayTimes(`${moment(start).format(TIME_FORMAT)} - ${moment(end).format(TIME_FORMAT)}`);
        setSeries(res || []);
      });
    }
  };
  const fetchData = () => {
    form.validateFields().then((values) => {
      const { start, end } = parseRange(values.query.range);
      timesRef.current = {
        start: moment(start).valueOf(),
        end: moment(end).valueOf(),
      };
      setLoading(true);
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: 'elasticsearch',
          datasourceValue,
          query: values.query,
        });
      }
      try {
        getLogsQuery(
          values.datasourceValue,
          dslBuilder({
            index: values.query.index,
            ...timesRef.current,
            date_field: values.query.date_field,
            filters,
            syntax: values.query.syntax,
            query_string: values.query.filter,
            kuery: values.query.filter,
            limit: LOGS_LIMIT,
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
          }),
        )
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
            const tableEleNodes = document.querySelectorAll(`.es-discover-logs-table .ant-table-body`)[0];
            tableEleNodes?.scrollTo(0, 0);
          })
          .finally(() => {
            setLoading(false);
            setErrorContent(undefined);
          });
        fetchSeries(values);
      } catch (e: any) {
        console.error(e);
        setErrorContent(_.get(e, 'message', t('datasource:es.queryFailed')));
        setLoading(false);
        setData([]);
        setTotal(0);
        setSeries([]);
      }
    });
  };
  const handlerModeChange = (mode) => {
    const queryValues = form.getFieldValue('query');
    form.setFieldsValue({
      fieldConfig: undefined,
      query: {
        ...(queryValues || {}),
        index: undefined,
        indexPattern: undefined,
      },
    });
    setMode(mode);
    setData([]);
  };
  const handlerIndexChange = () => {
    setSelectedFields([]);
    fetchData();
  };

  useEffect(() => {
    fetchSeries(form.getFieldsValue());
  }, [interval, intervalUnit]);

  useEffect(() => {
    if (_.isArray(filters)) {
      fetchData();
    }
  }, [JSON.stringify(filters)]);

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
                  handlerModeChange(val);
                  form.setFieldsValue({
                    query: {
                      mode: val,
                    },
                  });
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
          onExecute={fetchData}
          datasourceValue={datasourceValue}
          setFields={setFields}
          allowHideSystemIndices={allowHideSystemIndices}
          form={form}
        />
      )}
      {mode === IMode.indexPatterns && (
        <QueryBuilderWithIndexPatterns
          loading={loading}
          key={datasourceValue}
          onExecute={fetchData}
          datasourceValue={datasourceValue}
          form={form}
          setFields={setFields}
          onIndexChange={handlerIndexChange}
        />
      )}
      <div style={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
        {!_.isEmpty(filters) && (
          <div className='es-discover-filters'>
            {_.map(filters, (filter) => {
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
                  style={{
                    wordBreak: 'break-all',
                    whiteSpace: 'normal',
                  }}
                >
                  {getFieldLabel(filter.key, fieldConfig)} {filter.operator === 'is not' ? '!=' : '='} {filter.value}
                </Tag>
              );
            })}
          </div>
        )}
        <Spin spinning={loading}>
          {!_.isEmpty(data) ? (
            <div className='es-discover-content'>
              {collapsed && (
                <FieldsSidebar
                  fieldConfig={form.getFieldValue(['fieldConfig'])}
                  fields={fields}
                  setFields={setFields}
                  value={selectedFields}
                  onChange={setSelectedFields}
                  params={{ form, timesRef, datasourceValue, limit: LOGS_LIMIT }}
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
                  }}
                >
                  <div className='es-discover-chart-title'>
                    <div className='es-discover-chart-title-total'>
                      <strong
                        style={{
                          fontSize: 14,
                        }}
                      >
                        {total}
                      </strong>{' '}
                      hits
                    </div>
                    {date_field && (
                      <>
                        <div className='es-discover-chart-title-content'>
                          {chartVisible && (
                            <>
                              <span>{displayTimes}</span>
                              <span style={{ marginLeft: 10 }}>
                                {t('log.interval')}:{' '}
                                <InputNumber
                                  size='small'
                                  value={interval}
                                  min={1}
                                  onBlur={(e) => {
                                    const val = _.toNumber(e.target.value);
                                    if (val > 0) setInterval(val);
                                  }}
                                  onPressEnter={(e: any) => {
                                    const val = _.toNumber(e.target.value);
                                    if (val > 0) setInterval(val);
                                  }}
                                />{' '}
                                <Select size='small' style={{ width: 80 }} value={intervalUnit} onChange={(val) => setIntervalUnit(val)}>
                                  <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                                  <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                                  <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
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
                          {isPlus && <DownloadModal queryData={{ ...form.getFieldsValue(), mode, total }} />}
                        </div>
                      </>
                    )}
                  </div>
                  {chartVisible && date_field && (
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
                <Table data={data} fetchData={fetchData} sorterRef={sorterRef} form={form} getFields={getFields} selectedFields={selectedFields} />
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
        </Spin>
      </div>
    </div>
  );
}
