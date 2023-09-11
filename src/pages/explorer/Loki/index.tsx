import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Empty, Spin, message, Space, Select, Typography, Result } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { useHistory, useLocation } from 'react-router-dom';
import { getLogsQuery } from './services';
import TimeRangePicker, { IRawTimeRange, isMathString, parseRange } from '@/components/TimeRangePicker';
import Timeseries from '@/pages/dashboard/Renderer/Renderer/Timeseries';
import { createPortal } from 'react-dom';
import LogQLInput from '@/components/LogQLInput';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import queryString from 'query-string';
import { LogSortItem, Row, getKeywords, parseResponse } from './util';
import { getSerieName } from '@/pages/dashboard/Renderer/datasource/utils';
import LogRow from './component/logRow';
import './style.less';
import { SelectSort } from './component/operator/SelectSort';
import { PrettifyJson } from './component/operator/PrettifyJson';
import { ShowTime } from './component/operator/ShowTime';
import { WrapLines } from './component/operator/WrapLines';
interface IProps {
  datasourceValue: number;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
}

const { Paragraph } = Typography;

const LOGS_LIMIT = [100, 300, 500, 700, 1000];

export default function index(props: IProps) {
  const { t } = useTranslation('explorer');
  const { datasourceValue, form, headerExtra } = props;
  const history = useHistory();
  const { search } = useLocation();
  const params = queryString.parse(search);
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [value, setValue] = useState<string | undefined>(_.isString(params.prom_ql) ? params.prom_ql : ''); // for logQLInput
  const [data, setData] = useState<Row[]>([]);
  const [typeIsStreams, setTypeIsStreams] = useState<boolean>(true); // table or graph chart
  const [series, setSeries] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);
  const [errorDetail, setShowErrorDetail] = useState<boolean>(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<keyof typeof LogSortItem>('NEWEST_FIRST');
  const [showTime, setShowTime] = useState<boolean>(true);
  const [prettifyJson, setPrettifyJson] = useState<boolean>(false);
  const [range, setRange] = useState<IRawTimeRange>({ start: 'now-1h', end: 'now' }); // for change time to fetch data

  let defaultTime: undefined | IRawTimeRange;
  if (typeof params.start === 'string' && typeof params.end === 'string') {
    defaultTime = {
      start: isMathString(params.start) ? params.start : moment.unix(_.toNumber(params.start)),
      end: isMathString(params.end) ? params.end : moment.unix(_.toNumber(params.end)),
    };
  }
  const timesRef =
    useRef<{
      start: number;
      end: number;
    }>();
  const logQLInputRef = useRef<any>(null);

  useEffect(() => {
    if (value != '') {
      fetchData();
    }
  }, [JSON.stringify(range), datasourceValue, limit]);

  // 每次输入LogQL 发送请求后变更匹配的关键字
  useEffect(() => {
    if (loading) {
      const keyworkds = getKeywords(value || '');
      setKeywords(keyworkds);
    }
  }, [loading]);

  useEffect(() => {
    if (loading) {
      setError('');
      setShowErrorDetail(false);
    }
  }, [loading]);

  useEffect(() => {
    if (sortOrder === 'OLDEST_FIRST') {
      setData(_.sortBy(data.flat(), (row) => row.time));
    } else {
      setData(_.sortBy(data.flat(), (row) => -row.time));
    }
  }, [sortOrder]);

  const createSeries = (result) => {
    return result.map((item) => {
      const name = getSerieName(item.metric);
      return {
        id: _.uniqueId('series_'),
        name: _.isEmpty(name) ? 'unknown' : name,
        metric: item.metric,
        data: item.values,
      };
    });
  };

  const fetchData = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const { start, end } = parseRange(values.query.range);
      timesRef.current = {
        start: moment(start).valueOf() * 1000 * 1000,
        end: moment(end).valueOf() * 1000 * 1000,
      };
      const queryParams = {
        query: value,
        limit: limit,
        ...timesRef.current,
      };
      if (_.startsWith(value, '{')) {
        const [query_result, volume_result] = await Promise.all([
          getLogsQuery(values.datasourceValue, queryParams),
          getLogsQuery(values.datasourceValue, {
            query: `sum by(level) (count_over_time(${value}[1m]))`,
            limit: limit,
            ...timesRef.current,
          }),
        ]);
        const { result } = query_result;
        setTypeIsStreams(true);
        setData(parseResponse(result).dataRows);
        setSeries(createSeries(volume_result?.result || []));
        setLoading(false);
      } else {
        const [query_result] = await Promise.all([getLogsQuery(values.datasourceValue, queryParams)]);
        const { resultType, result } = query_result;
        switch (resultType) {
          case 'matrix':
            setTypeIsStreams(false);
            setData(createSeries(result));
            setLoading(false);
            break;
          default:
            message.error(query_result);
        }
      }
    } catch (err) {
      message.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='es-discover-container'>
      {headerExtra ? (
        createPortal(
          <Space>
            <InputGroupWithFormItem label={t('log.limit')}>
              <Form.Item name='limit' initialValue={100}>
                <Select
                  dropdownMatchSelectWidth={false}
                  onChange={(val) => {
                    setLimit(val);
                  }}
                >
                  {_.map(LOGS_LIMIT, (item) => (
                    <Select.Option key={item} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </InputGroupWithFormItem>
            <Form.Item name={['query', 'range']} initialValue={defaultTime ? defaultTime : { start: 'now-1h', end: 'now' }}>
              <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' onChange={setRange} />
            </Form.Item>
          </Space>,
          headerExtra,
        )
      ) : (
        <Form.Item name={['query', 'range']} initialValue={defaultTime ? defaultTime : { start: 'now-1h', end: 'now' }}>
          <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' onChange={setRange} />
        </Form.Item>
      )}
      <div className='log-expression-input'>
        <Input.Group>
          <span className='ant-input-affix-wrapper'>
            <LogQLInput ref={logQLInputRef} value={value} onChange={setValue} completeEnabled={true} datasourceValue={datasourceValue} />
          </span>
          <span
            className='ant-input-group-addon'
            style={{
              border: 0,
              padding: '0 0 0 10px',
              background: 'none',
            }}
          >
            <Button
              type='primary'
              onClick={() => {
                fetchData();
              }}
            >
              {t('query_btn')}
            </Button>
          </span>
        </Input.Group>
      </div>
      <Spin spinning={loading}>
        {!_.isEmpty(data) ? (
          <>
            {typeIsStreams ? (
              <div className='loki-discover-main'>
                {series.length > 0 ? (
                  <div className='loki-discover-chart'>
                    <div className='loki-discover-chart-content'>
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
                                displayMode: 'list',
                              },
                              tooltip: {
                                mode: 'all',
                              },
                            },
                          } as any
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Result
                      status='warning'
                      title='Failed to load log volume chat for this query.'
                      extra={
                        <Button
                          type='primary'
                          key='console'
                          onClick={() => {
                            setShowErrorDetail(true);
                          }}
                        >
                          Show Details
                        </Button>
                      }
                    >
                      {errorDetail ? <Paragraph>{error}</Paragraph> : null}
                    </Result>
                  </>
                )}
                <div className='log-query-operator'>
                  <Space size='large'>
                    <ShowTime onChange={(v) => setShowTime(v)} />
                    <WrapLines onChange={() => {}} />
                    <PrettifyJson onChange={(v) => setPrettifyJson(v)} />
                  </Space>
                  <SelectSort onChange={(v) => setSortOrder(v)} />
                </div>
                <div className='loki-discover-rows-container'>
                  {data.map((item: Row) => {
                    return (
                      <LogRow
                        datasourceValue={datasourceValue}
                        row={item}
                        keywords={keywords}
                        operator={{
                          showTime: showTime,
                          prettifyJson: prettifyJson,
                        }}
                        addQueryLabel={(k, v, operator) => {
                          const label = `${k}${operator}"${v}"`;
                          const regex = /{([^}]+)}/g;
                          setValue(value?.replace(regex, (match, p1) => `{${p1},${label}}`));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className='loki-discover-graph'>
                <Timeseries
                  inDashboard={false}
                  series={data}
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
            )}
          </>
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
  );
}
