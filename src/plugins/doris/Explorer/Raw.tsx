import React, { useState, useEffect } from 'react';
import { Spin, Empty, Pagination, Space, Radio, Form } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form/Form';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { parseRange } from '@/components/TimeRangePicker';
import { PRIMARY_COLOR } from '@/utils/constant';
import { generateCount, generateSQL, generateHistogram } from '../services';
import { logQuery, dsQuery } from '../services';
import { ITreeSelect } from '../types';
import RawList, { getFields, OriginSettings } from './RawList';
import RawTable from './RawTable';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import './style.less';

interface IProps {
  form: FormInstance;
  refreshFlag?: number;
  setRefreshFlag: (flag: string) => void;
  treeSelect: ITreeSelect;
  mode: 'raw' | 'metric';
  subMode: string;
  setLoading: (b: boolean) => void;
  loading: boolean;
}

function Raw(props: IProps) {
  const { t } = useTranslation('db_aliyunSLS');
  const { form, refreshFlag, setRefreshFlag, treeSelect, mode, subMode, setLoading, loading } = props;
  const dateField = Form.useWatch(['query', 'time_field'], form);
  const [options, setOptions] = useState({
    logMode: 'origin',
    lineBreak: 'true',
    jsonDisplaType: 'tree',
    jsonExpandLevel: 1,
    organizeFields: [],
  });
  const query = Form.useWatch(['query'], form);
  const [logs, setLogs] = useState<{ [index: string]: string | number }[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [histogram, setHistogram] = useState<
    {
      metric: string;
      data: [number, number][];
    }[]
  >([]);
  const [paginationOptions, setPaginationOptions] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [snapRange, setSnapRange] = useState<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });
  const [logRequestParams, setLogRequestParams] = useState<any>({});

  useEffect(() => {
    if (!(mode === 'raw' && subMode === 'condition')) return;
    if (!treeSelect.db) return;
    if (refreshFlag) {
      const values = form.getFieldsValue();
      const query = values.query;
      const range = parseRange(query?.range || { start: 'now-1h', end: 'now' });
      setSnapRange({
        from: undefined,
        to: undefined,
      });
      setPaginationOptions({
        ...paginationOptions,
        current: 1,
      });
      const sqlCount = generateCount({
        table: treeSelect.table,
        time_field: query.time_field,
        from: moment(range.start).unix(),
        to: moment(range.end).unix(),
        condition: query.condition,
      });

      setLogRequestParams({
        table: treeSelect.table,
        time_field: query.time_field,
        from: moment(range.start).unix(),
        to: moment(range.end).unix(),
        condition: query.condition,
      });

      const histogramSql = generateHistogram({
        table: treeSelect.table,
        time_field: query.time_field,
        from: moment(range.start).unix(),
        to: moment(range.end).unix(),
        condition: query.condition,
      });
      setLoading(true);
      logQuery({ cate: values.datasourceCate, datasource_id: values.datasourceValue, query: [{ database: treeSelect.db, sql: sqlCount, keys: query.keys }] }).then((res) => {
        setPaginationOptions({
          ...paginationOptions,
          total: res?.list?.length ? res.list[0].cnt : 0,
        });
      });
      logQuery({ cate: values.datasourceCate, datasource_id: values.datasourceValue, query: [{ database: treeSelect.db, sql: histogramSql, keys: query.keys }] })
        .then((res) => {
          setHistogram(
            res?.list?.length > 0
              ? [
                  {
                    metric: '',
                    data: res.list.map((item) => [item.__ts__, item.cnt]),
                  },
                ]
              : [],
          );
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [refreshFlag]);

  useEffect(() => {
    const values = form.getFieldsValue();
    const query = values.query;
    const range = parseRange(mode === 'raw' && subMode === 'condition' ? query.range : { start: 'now-1h', end: 'now' });
    const sql =
      mode === 'raw' && subMode === 'condition'
        ? generateSQL({
            table: treeSelect.table,
            time_field: query.time_field,
            from: moment(range.start).format('YYYY-MM-DD HH:mm:ss'),
            to: moment(range.end).format('YYYY-MM-DD HH:mm:ss'),
            condition: query.condition,
            limit: paginationOptions.pageSize,
            offset: paginationOptions.pageSize * (paginationOptions.current - 1),
          })
        : query.sql;
    const func = mode === 'metric' ? dsQuery : logQuery;
    if (!treeSelect.db) return;
    setLoading(true);
    func({ cate: values.datasourceCate, datasource_id: values.datasourceValue, query: [{ database: treeSelect.db, sql: sql, keys: query.keys }] })
      .then((res) => {
        mode === 'metric'
          ? setSeries(
              res?.map((item) => {
                return {
                  metric: item.metric,
                  name: getSerieName(item.metric),
                  data: item.values,
                };
              }) || [],
            )
          : setLogs(res?.list || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [refreshFlag, paginationOptions.current, paginationOptions.pageSize]);

  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
  };

  return (
    <Spin spinning={loading}>
      {mode === 'raw' && (
        <>
          {!_.isEmpty(logs) ? (
            <div className='sls-discover-content'>
              <div className='sls-discover-main' style={{ paddingTop: 16 }}>
                {!_.isEmpty(histogram) && mode === 'raw' && subMode === 'condition' && (
                  <div className='sls-discover-chart'>
                    <div className='sls-discover-chart-content'>
                      <Timeseries
                        series={histogram}
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
                        onClick={(event, datetime, value, points) => {
                          const start = _.get(points, '[0][0]');
                          const allPoints = _.get(histogram, '[0].data');
                          if (start && allPoints) {
                            const step = _.get(allPoints, '[2][0]') - _.get(allPoints, '[1][0]');
                            const end = start + step;
                            setSnapRange({
                              from: start,
                              to: end,
                            });
                            setPaginationOptions({
                              ...paginationOptions,
                              current: 1,
                            });
                            setLogRequestParams({
                              ...logRequestParams,
                              from: start,
                              to: end,
                              offset: 0,
                            });
                          }
                        }}
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
                          setRefreshFlag(_.uniqueId('refreshFlag_'));
                        }}
                        colors={[PRIMARY_COLOR]}
                      />
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 10px 10px' }}>
                  <Space>
                    <Radio.Group
                      size='small'
                      optionType='button'
                      buttonStyle='solid'
                      options={[
                        {
                          label: t('logs.settings.mode.origin'),
                          value: 'origin',
                        },
                        {
                          label: t('logs.settings.mode.table'),
                          value: 'table',
                        },
                      ]}
                      value={options.logMode}
                      onChange={(e) => {
                        updateOptions({
                          logMode: e.target.value,
                        });
                      }}
                    />

                    <OriginSettings options={options} setOptions={updateOptions} fields={getFields(logs, dateField)} />
                  </Space>
                  <Space>
                    {snapRange.from && snapRange.to && (
                      <>
                        {moment.unix(snapRange.from).format('MM-DD HH:mm:ss')} ~ {moment.unix(snapRange.to).format('MM-DD HH:mm:ss')}
                      </>
                    )}
                    {subMode === 'condition' && (
                      <Pagination
                        size='small'
                        {...paginationOptions}
                        onChange={(current, pageSize) => {
                          setPaginationOptions({
                            ...paginationOptions,
                            current,
                            pageSize,
                          });
                          setLogRequestParams({
                            ...logRequestParams,
                            offset: pageSize * (current - 1),
                            lines: pageSize,
                          });
                        }}
                        showTotal={(total) => {
                          return t('common:table.total', { total });
                        }}
                      />
                    )}
                  </Space>
                </div>
                {options.logMode === 'origin' && (
                  <RawList data={logs} options={options} paginationOptions={paginationOptions} dateField={dateField} timeField={mode === 'raw' && subMode === 'condition'} />
                )}
                {options.logMode === 'table' && (
                  <RawTable data={logs} selectedFields={options.organizeFields} scroll={{ x: 'max-content', y: 'calc(100% - 36px)' }} dateField={dateField} timeField={false} />
                )}
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
        </>
      )}
      {mode === 'metric' && (
        <>
          {!_.isEmpty(series) ? (
            <div style={{ height: 500 }}>
              <Timeseries
                series={series}
                values={
                  {
                    custom: {
                      drawStyle: 'lines',
                      lineInterpolation: 'smooth',
                    },
                    options: {
                      legend: {
                        displayMode: 'table',
                      },
                      tooltip: {
                        mode: 'all',
                      },
                    },
                  } as any
                }
              />
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
        </>
      )}
    </Spin>
  );
}

export default Raw;
