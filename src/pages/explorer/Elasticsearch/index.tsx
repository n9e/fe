import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import _ from 'lodash';
import moment from 'moment';
import queryString, { ParsedQuery } from 'query-string';
import { useTranslation } from 'react-i18next';
import { Table, Empty, Spin, InputNumber, Select, Radio, Space, Checkbox, Tag, Form } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { DownOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import { getLogsQuery } from './services';
import { parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import metricQuery from './metricQuery';
import { getColumnsFromFields, Field, dslBuilder, Filter, getFieldLabel } from './utils';
import FieldsSidebar from './FieldsSidebar';
import QueryBuilder from './QueryBuilder';
import QueryBuilderWithIndexPatterns from './QueryBuilderWithIndexPatterns';
import LogView from './LogView';
import './style.less';

interface IProps {
  headerExtra: HTMLDivElement | null;
  datasourceValue?: number;
  form: FormInstance;
  isOpenSearch?: boolean;
}

const LOGS_LIMIT = 500;
const TIME_FORMAT = 'YYYY.MM.DD HH:mm:ss';
enum IMode {
  indexPatterns = 'index-patterns',
  indices = 'indices',
}

const ModeRadio = ({ mode, setMode, allowHideSystemIndices, setAllowHideSystemIndices }) => {
  const { t } = useTranslation('explorer');
  return (
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
  );
};

/**
 * 从 URL query 中获取 filter
 * 存在 query_string 时直接作为 filter 值
 * 否则排查掉 data_source_name, data_source_id, index_name, timestamp 之后的参数合并为 filter
 * 合并后的 filter 为 AND 关系
 */

const getFilterByQuery = (query: ParsedQuery<string>) => {
  if (query?.query_string) {
    return query?.query_string;
  } else {
    const filtersArr: string[] = [];
    const validParmas = _.omit(query, ['data_source_name', 'data_source_id', 'index_name', 'timestamp']);
    _.forEach(validParmas, (value, key) => {
      if (value) {
        filtersArr.push(`${key}:"${value}"`);
      }
    });
    return _.join(filtersArr, ' AND ');
  }
};

const getDefaultMode = (query, isOpenSearch) => {
  if (isOpenSearch) return IMode.indices;
  if (query?.data_source_id && query?.index_name) {
    return IMode.indices;
  }
  return (localStorage.getItem('explorer_es_mode') as IMode) || IMode.indices;
};

export default function index(props: IProps) {
  const { t } = useTranslation('explorer');
  const { headerExtra, datasourceValue, form, isOpenSearch = false } = props;
  const query = queryString.parse(useLocation().search);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [series, setSeries] = useState<any[]>([]);
  const [displayTimes, setDisplayTimes] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFields, setSelectedFields] = useState<Field[]>([]);
  const [interval, setInterval] = useState(1);
  const [intervalUnit, setIntervalUnit] = useState<'second' | 'min' | 'hour'>('min');
  const [chartVisible, setChartVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [filters, setFilters] = useState<Filter[]>();
  const fieldConfig = Form.useWatch('fieldConfig', form);
  const sortOrder = useRef('desc');
  const timesRef =
    useRef<{
      start: number;
      end: number;
    }>();
  const [mode, setMode] = useState<IMode>(getDefaultMode(query, isOpenSearch));
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

      getLogsQuery(
        values.datasourceValue,
        dslBuilder({
          index: values.query.index,
          ...timesRef.current,
          date_field: values.query.date_field,
          filters,
          query_string: values.query.filter,
          limit: LOGS_LIMIT,
          order: sortOrder.current,
          orderField: values.query.date_field,
          _source: true,
        }),
      )
        .then((res) => {
          const newData = _.map(res.list, (item) => {
            return {
              id: _.uniqueId(),
              fields: item.fields,
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
        });
      fetchSeries(values);
    });
  };
  const handlerModeChange = (mode, isOpenSearch) => {
    if (!isOpenSearch) {
      localStorage.setItem('explorer_es_mode', mode);
    }
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
    // 如果URL携带数据源值和索引值，则直接查询
    if (query?.data_source_id && query?.index_name) {
      form.setFieldsValue({
        query: {
          index: query.index_name,
          filter: getFilterByQuery(query),
          date_field: query.timestamp || '@timestamp',
        },
      });
      fetchData();
    }
  }, []);

  useEffect(() => {
    fetchSeries(form.getFieldsValue());
  }, [interval, intervalUnit]);

  useEffect(() => {
    if (_.isArray(filters)) {
      fetchData();
    }
  }, [JSON.stringify(filters)]);

  return (
    <div className='es-discover-container'>
      {!isOpenSearch && (
        <>
          {headerExtra ? (
            createPortal(
              <ModeRadio
                mode={mode}
                setMode={(val) => {
                  handlerModeChange(val, isOpenSearch);
                }}
                allowHideSystemIndices={allowHideSystemIndices}
                setAllowHideSystemIndices={setAllowHideSystemIndices}
              />,
              headerExtra,
            )
          ) : (
            <ModeRadio
              mode={mode}
              setMode={(val) => {
                handlerModeChange(val, isOpenSearch);
              }}
              allowHideSystemIndices={allowHideSystemIndices}
              setAllowHideSystemIndices={setAllowHideSystemIndices}
            />
          )}
        </>
      )}

      {mode === IMode.indices && <QueryBuilder onExecute={fetchData} datasourceValue={datasourceValue} setFields={setFields} allowHideSystemIndices={allowHideSystemIndices} />}
      {mode === IMode.indexPatterns && (
        <QueryBuilderWithIndexPatterns onExecute={fetchData} datasourceValue={datasourceValue} form={form} setFields={setFields} onIndexChange={handlerIndexChange} />
      )}
      <div style={{ height: 'calc(100% - 50px)', display: 'flex', flexDirection: 'column' }}>
        {!_.isEmpty(filters) && (
          <div className='es-discover-filters'>
            {_.map(filters, (filter) => {
              return (
                <Tag
                  closable
                  color={filter.operator === 'is not' ? 'red' : undefined}
                  onClose={(e) => {
                    e.preventDefault();
                    setFilters(_.filter(filters, (item) => item.key !== filter.key));
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
                  params={{ form, timesRef, datasourceValue, order: sortOrder.current, limit: LOGS_LIMIT }}
                  filters={filters}
                  onValueFilter={({ key, value, operator }) => {
                    if (!_.find(filters, { key })) {
                      setFilters([...(filters || []), { key, value, operator }]);
                    } else {
                      setFilters(
                        _.map(filters, (item) => {
                          if (item.key === key) {
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
                    height: chartVisible ? 190 : 40,
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
                    </div>
                  </div>
                  {chartVisible && (
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
                      />
                    </div>
                  )}
                </div>
                <Table
                  size='small'
                  className='es-discover-logs-table'
                  tableLayout='fixed'
                  rowKey='id'
                  columns={getColumnsFromFields(selectedFields, form.getFieldValue(['query', 'date_field']), form.getFieldValue(['fieldConfig']), filters)}
                  dataSource={data}
                  expandable={{
                    expandedRowRender: (record) => {
                      return <LogView value={record.json} fieldConfig={form.getFieldValue(['fieldConfig'])} fields={fields} />;
                    },
                    expandIcon: ({ expanded, onExpand, record }) =>
                      expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />,
                  }}
                  scroll={{ x: _.isEmpty(selectedFields) ? undefined : 'max-content', y: 'calc(100% - 36px)' }}
                  pagination={false}
                  onChange={(pagination, filters, sorter: any, extra) => {
                    if (sorter.columnKey === 'time') {
                      sortOrder.current = sorter.order === 'ascend' ? 'asc' : 'desc';
                      fetchData();
                    }
                  }}
                />
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
              }}
            >
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
