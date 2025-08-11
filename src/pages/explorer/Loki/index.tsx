import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Form, Button, Empty, Spin, message, Space, Select, Typography, Result, Row as AntdRow, Col as AntdCol } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
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
import Share from '../components/Share';
import useFieldConfig from '@/pages/explorer/components/RenderValue/useFieldConfig';
import { DatasourceCateEnum } from '@/utils/constant';
// @ts-ignore
import DrilldownBtn from 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn';
import { CommonStateContext } from '@/App';
interface IProps {
  datasourceValue: number;
  headerExtra: HTMLDivElement | null;
  form: FormInstance;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}

const { Paragraph } = Typography;

const LOGS_LIMIT = [100, 300, 500, 700, 1000];
const GRAPH_VISIBLE_CACHE_KEY = 'loki_graph_visible_cachekey';

export default function index(props: IProps) {
  const { t } = useTranslation('explorer');
  const { datasourceValue, form, headerExtra, defaultFormValuesControl } = props;
  const { isPlus } = useContext(CommonStateContext);
  const { search } = useLocation();
  const params = queryString.parse(search);
  const [loading, setLoading] = useState(false);
  const queryValue = Form.useWatch(['query', 'query']);
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
  const [graphVisible, setGraphVisible] = useState<boolean>(localStorage.getItem(GRAPH_VISIBLE_CACHE_KEY) === 'false' ? false : true);

  let defaultTime: undefined | IRawTimeRange;
  if (typeof params.start === 'string' && typeof params.end === 'string') {
    defaultTime = {
      start: isMathString(params.start) ? params.start : moment.unix(_.toNumber(params.start)),
      end: isMathString(params.end) ? params.end : moment.unix(_.toNumber(params.end)),
    };
  }
  const timesRef = useRef<{
    start: number;
    end: number;
  }>();

  useEffect(() => {
    if (queryValue != '') {
      fetchData();
    }
  }, [JSON.stringify(range), datasourceValue, limit]);

  const fieldConfig = useFieldConfig(
    {
      cate: DatasourceCateEnum.loki,
      datasource_id: form.getFieldValue('datasourceValue'),
      query: queryValue,
    },
    loading,
  );

  // 每次输入LogQL 发送请求后变更匹配的关键字
  useEffect(() => {
    if (loading) {
      const keyworkds = getKeywords(queryValue || '');
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

  useEffect(() => {
    if (defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      form.setFieldsValue(defaultFormValuesControl.defaultFormValues);
      defaultFormValuesControl.setIsInited();
    }
  }, []);

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
        query: queryValue,
        limit: limit,
        ...timesRef.current,
      };
      if (defaultFormValuesControl?.setDefaultFormValues) {
        defaultFormValuesControl.setDefaultFormValues({
          datasourceCate: 'loki',
          datasourceValue,
          query: {
            query: queryValue,
          },
        });
      }
      if (_.startsWith(queryValue, '{')) {
        const [query_result, volume_result] = await Promise.all([
          getLogsQuery(values.datasourceValue, queryParams),
          getLogsQuery(values.datasourceValue, {
            query: `sum by(level) (count_over_time(${queryValue}[1m]))`,
            limit: limit,
            ...timesRef.current,
          }),
        ]);
        const { result } = query_result;
        setTypeIsStreams(true);
        setData(parseResponse(result).dataRows);
        setSeries(createSeries(volume_result?.result || []));
        setLoading(false);
      } else if (queryValue) {
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            </Space>
            <Space>
              {isPlus && <DrilldownBtn />}
              <Share />
            </Space>
          </div>,
          headerExtra,
        )
      ) : (
        <Form.Item name={['query', 'range']} initialValue={defaultTime ? defaultTime : { start: 'now-1h', end: 'now' }}>
          <TimeRangePicker dateFormat='YYYY-MM-DD HH:mm:ss' onChange={setRange} />
        </Form.Item>
      )}
      <div>
        <AntdRow gutter={8}>
          <AntdCol flex='auto'>
            <Form.Item name={['query', 'query']}>
              <LogQLInput completeEnabled={true} datasourceValue={datasourceValue} />
            </Form.Item>
          </AntdCol>
          <AntdCol flex='none'>
            <Button
              type='primary'
              onClick={() => {
                fetchData();
              }}
            >
              {t('query_btn')}
            </Button>
          </AntdCol>
        </AntdRow>
      </div>
      <Spin spinning={loading}>
        {!_.isEmpty(data) ? (
          <>
            {typeIsStreams ? (
              <div className='loki-discover-main'>
                {series.length > 0 ? (
                  <>
                    <div className='n9e-flex n9e-justify-between n9e-items-center'>
                      <div />
                      <Button
                        size='small'
                        type='text'
                        icon={graphVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={() => {
                          setGraphVisible(!graphVisible);
                          localStorage.setItem(GRAPH_VISIBLE_CACHE_KEY, !graphVisible ? 'true' : 'false');
                        }}
                      />
                    </div>
                    <div
                      className='loki-discover-chart'
                      style={{
                        display: graphVisible ? 'block' : 'none',
                        flexShrink: 0,
                      }}
                    >
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
                  </>
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
                        fieldConfig={fieldConfig}
                        datasourceValue={datasourceValue}
                        row={item}
                        keywords={keywords}
                        operator={{
                          showTime: showTime,
                          prettifyJson: prettifyJson,
                        }}
                        range={range}
                        addQueryLabel={(k, v, operator) => {
                          const label = `${k}${operator}"${v}"`;
                          const regex = /{([^}]+)}/g;
                          const newQueryValue = queryValue?.replace(regex, (match, p1) => `{${p1},${label}}`);
                          const valuesClone = _.cloneDeep(form.getFieldsValue());
                          _.set(valuesClone, ['query', 'query'], newQueryValue);
                          form.setFieldsValue(valuesClone);
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
