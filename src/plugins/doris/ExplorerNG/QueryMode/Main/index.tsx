import React, { useContext, useRef, useState, useEffect } from 'react';
import { Form, Row, Col, Button, Space, Tooltip, Pagination, Empty, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { useRequest, useGetState } from 'ahooks';

import { CommonStateContext } from '@/App';
import { DatasourceCateEnum, IS_PLUS, SIZE } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import DocumentDrawer from '@/components/DocumentDrawer';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';
import flatten from '@/pages/logExplorer/components/LogsViewer/utils/flatten';
import normalizeLogStructures from '@/pages/logExplorer/utils/normalizeLogStructures';
import useFieldConfig from '@/pages/logExplorer/components/RenderValue/useFieldConfig';

import { NAME_SPACE, QUERY_LOGS_OPTIONS_CACHE_KEY, DEFAULT_LOGS_PAGE_SIZE, QUERY_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY } from '../../../constants';
import { getDorisLogsQuery, getDorisHistogram } from '../../../services';
import { Field } from '../../../types';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import filteredFields from '../../utils/filteredFields';
import QueryInput from '../../components/QueryInput';
import MainMoreOperations from '../../components/MainMoreOperations';
import { PinIcon, UnPinIcon } from '../Sidebar/FieldsSidebar/PinIcon';
import { DefaultSearchIcon, UnDefaultSearchIcon } from '../Sidebar/FieldsSidebar/DefaultSearchIcon';
import QueryInputAddonAfter from './QueryInputAddonAfter';
import SQLFormatButton from './SQLFormatButton';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface Props {
  tabKey: string;
  indexData: Field[];
  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  executeQuery: () => void;
  onAdd: (queryValues?: { [index: string]: any }) => void;

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { logsDefaultRange, darkMode } = useContext(CommonStateContext);

  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');

  const { tabKey, indexData, organizeFields, setOrganizeFields, executeQuery, onAdd, stackByField, setStackByField, defaultSearchField, setDefaultSearchField } = props;

  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const [options, setOptions] = useState(getOptionsFromLocalstorage(QUERY_LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const appendRef = useRef<boolean>(false); // 是否是滚动加载更多日志
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
    reverse: true,
    refreshFlag: undefined,
  });
  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(QUERY_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      setServiceParams({
        ...serviceParams,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
      });
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refreshFlag_'),
      });
    }
  };

  const handleValueFilter = (params) => {
    const values = form.getFieldsValue();
    const query = values.query;
    let queryStr = _.trim(_.split(query.query, '|')?.[0]);
    if (queryStr === '*') {
      queryStr = '';
    }
    if (params.operator === 'AND') {
      queryStr += `${queryStr === '' ? '' : ' AND'} ${params.key}:"${params.value}"`;
    }
    if (params.operator === 'NOT') {
      queryStr += `${queryStr === '' ? ' NOT' : ' AND NOT'} ${params.key}:"${params.value}"`;
    }
    form.setFieldsValue({
      query: {
        query: queryStr,
      },
    });
    executeQuery();
  };

  // 用于显示展示的时间范围
  const rangeRef = useRef<{
    from: number;
    to: number;
  }>();
  // 点击直方图某个柱子时，设置的时间范围
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });
  // 分页时的时间范围不变
  const fixedRangeRef = useRef<boolean>(false);
  const loadTimeRef = useRef<number | null>(null);

  const service = () => {
    const queryValues = form.getFieldValue('query'); // 实时获取最新的查询条件
    if (refreshFlag && datasourceValue && queryValues?.database && queryValues?.table && queryValues?.time_field) {
      const range = parseRange(queryValues.range);
      let timeParams =
        fixedRangeRef.current === false
          ? {
              from: moment(range.start).unix(),
              to: moment(range.end).unix(),
            }
          : rangeRef.current!;
      if (snapRangeRef.current && snapRangeRef.current.from && snapRangeRef.current.to) {
        timeParams = snapRangeRef.current as { from: number; to: number };
      }
      rangeRef.current = timeParams;
      const queryStart = Date.now();
      return getDorisLogsQuery({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.time_field,
            query: queryValues.query,
            from: timeParams.from,
            to: timeParams.to,
            lines: serviceParams.pageSize,
            offset: (serviceParams.current - 1) * serviceParams.pageSize,
            reverse: serviceParams.reverse,
            default_field: defaultSearchField,
          },
        ],
      })
        .then((res) => {
          if (fixedRangeRef.current === false) {
            loadTimeRef.current = Date.now() - queryStart;
          }
          const newLogs = _.map(res.list, (item) => {
            const normalizedItem = normalizeLogStructures(item);
            return {
              ...(flatten(normalizedItem) || {}),
              ___raw___: normalizedItem,
              ___id___: _.uniqueId('log_id_'),
            };
          });
          if (appendRef.current) {
            appendRef.current = false;
            return {
              list: _.concat(data?.list, newLogs),
              total: res.total,
              hash: _.uniqueId('logs_'),
              colWidths: calcColWidthByData(_.concat(data?.list, newLogs)),
            };
          } else {
            if (pageLoadMode === 'infiniteScroll') {
              const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
              const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
              if (antdTableEleNodes) {
                antdTableEleNodes?.scrollTo(0, 0);
              } else if (rgdTableEleNodes) {
                rgdTableEleNodes?.scrollTo(0, 0);
              }
            }
            appendRef.current = false;
            return {
              list: newLogs,
              total: res.total,
              hash: _.uniqueId('logs_'),
              colWidths: calcColWidthByData(newLogs),
            };
          }
        })
        .catch(() => {
          loadTimeRef.current = null;
          return {
            list: [],
            total: 0,
            hash: _.uniqueId('logs_'),
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
    });
  };

  const {
    data,
    loading,
    run: fetchLogs,
  } = useRequest<
    {
      list: { [index: string]: string }[];
      total: number;
      hash: string;
      colWidths?: { [key: string]: number };
    },
    any
  >(service, {
    refreshDeps: [JSON.stringify(serviceParams)],
  });

  const histogramService = () => {
    const queryValues = form.getFieldValue('query'); // 实时获取最新的查询条件
    if (refreshFlag && datasourceValue && queryValues && queryValues.database && queryValues.table && queryValues.time_field) {
      const range = parseRange(queryValues.range);
      return getDorisHistogram({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.time_field,
            from: moment(range.start).unix(),
            to: moment(range.end).unix(),
            query: queryValues.query,
            group_by: stackByField,
            default_field: defaultSearchField,
          },
        ],
      })
        .then((res) => {
          return {
            data: _.map(res, (item) => {
              return {
                id: _.uniqueId('series_'),
                ref: '',
                name: item.ref,
                metric: {},
                data: item.values,
              };
            }),
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

  const { data: histogramData, loading: histogramLoading } = useRequest<
    {
      data: any[];
      hash: string;
    },
    any
  >(histogramService, {
    refreshDeps: [refreshFlag, stackByField],
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
      cate: DatasourceCateEnum.doris,
      datasource_id: form.getFieldValue('datasourceValue'),
      resource: { doris_resource: { database: queryValues?.database, table: queryValues?.table } },
    },
    refreshFlag,
  );

  useEffect(() => {
    snapRangeRef.current = {
      from: undefined,
      to: undefined,
    };
  }, [JSON.stringify(queryValues?.range)]);

  return (
    <div className='flex flex-col h-full'>
      <Row gutter={SIZE} className='flex-shrink-0'>
        <Col flex='auto'>
          <InputGroupWithFormItem
            label={
              <Space>
                {t(`${logExplorerNS}:query`)}
                <InfoCircleOutlined
                  onClick={() => {
                    DocumentDrawer({
                      language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                      darkMode,
                      title: t('common:document_link'),
                      type: 'iframe',
                      documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-query-mode-in-doris-discover/',
                    });
                  }}
                />
              </Space>
            }
            addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
          >
            <div className='relative'>
              <Form.Item name={['query', 'query']}>
                <QueryInput
                  onChange={() => {
                    executeQuery();
                  }}
                  enableAddonBefore={defaultSearchField !== undefined}
                />
              </Form.Item>
              {defaultSearchField && (
                <Popover
                  content={
                    <Space>
                      <span>{t('query.default_search_by_tip')} :</span>
                      <span>{defaultSearchField}</span>
                      <Tooltip title={t('query.default_search_tip_2')}>
                        <Button
                          icon={<UnDefaultSearchIcon />}
                          size='small'
                          type='text'
                          onClick={() => {
                            setDefaultSearchField?.(undefined);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Button
                    className='absolute top-[4px] left-[4px] z-10'
                    size='small'
                    type='text'
                    icon={
                      <DefaultSearchIcon
                        className='text-[12px]'
                        style={{
                          color: 'var(--fc-primary-color)',
                        }}
                      />
                    }
                  />
                </Popover>
              )}
            </div>
          </InputGroupWithFormItem>
        </Col>
        <Col flex='none'>
          <SQLFormatButton
            rangeRef={rangeRef}
            defaultSearchField={defaultSearchField}
            onClick={(values) => {
              onAdd({
                mode: 'sql',
                ...values,
              });
            }}
          />
        </Col>
        <Col flex='none'>
          <Form.Item name={['query', 'range']} initialValue={logsDefaultRange}>
            <TimeRangePicker onChange={executeQuery} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Button type='primary' onClick={executeQuery} loading={loading || histogramLoading}>
            {t(`${logExplorerNS}:execute`)}
          </Button>
        </Col>
        <Col flex='none'>
          <MainMoreOperations />
        </Col>
      </Row>
      {refreshFlag ? (
        <>
          {!_.isEmpty(data?.list) || !_.isEmpty(histogramData?.data) ? (
            <LogsViewer
              timeField={queryValues?.time_field}
              histogramLoading={histogramLoading}
              histogram={histogramData?.data || []}
              histogramHash={histogramData?.hash}
              loading={loading}
              logs={data?.list || []}
              logsHash={data?.hash}
              fields={_.map(indexData, 'field')}
              options={options}
              organizeFields={organizeFields}
              setOrganizeFields={setOrganizeFields}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, organizeFields);
              }}
              histogramAddonBeforeRender={
                stackByField ? (
                  <Popover
                    content={
                      <Space>
                        <span>{t('query.stack_group_by_tip')} :</span>
                        <span>{stackByField}</span>
                        <Tooltip title={t('query.stack_tip_unpin')}>
                          <Button
                            icon={<UnPinIcon />}
                            size='small'
                            type='text'
                            onClick={() => {
                              setStackByField?.(undefined);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    }
                  >
                    <Button size='small' type='text'>
                      <Space>
                        {stackByField}
                        <PinIcon
                          className='text-[12px]'
                          style={{
                            color: 'var(--fc-primary-color)',
                          }}
                        />
                      </Space>
                    </Button>
                  </Popover>
                ) : undefined
              }
              renderHistogramAddonAfterRender={(toggleNode) => {
                if (data) {
                  return (
                    <Space>
                      {rangeRef.current && (
                        <>
                          {moment.unix(rangeRef.current?.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment.unix(rangeRef.current?.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                        </>
                      )}
                      {toggleNode}
                      {IS_PLUS && <DownloadModal marginLeft={0} queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
                    </Space>
                  );
                }
                return toggleNode;
              }}
              stacked={!!stackByField} // only for histogram
              colWidths={data?.colWidths}
              tableColumnsWidthCacheKey={`${QUERY_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({
                datasourceValue,
                database: queryValues?.database,
                table: queryValues?.table,
                indexData: _.sortBy(indexData, 'field'),
              })}`}
              optionsExtraRender={
                <Space>
                  {loadTimeRef.current !== null && (
                    <Space size={4}>
                      <span>{t('query.duration')} :</span>
                      <span>{loadTimeRef.current} ms</span>
                    </Space>
                  )}
                  {pageLoadMode === 'pagination' ? (
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
                            <span>{t('query.count')} :</span>
                            <span>{total}</span>
                          </Space>
                        );
                      }}
                    />
                  ) : (
                    <Space size={4}>
                      <span>{t('query.count')} :</span>
                      <span>{data?.total}</span>
                    </Space>
                  )}
                </Space>
              }
              showPageLoadMode
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
                  refreshFlag: _.uniqueId('refreshFlag_'),
                });
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
              onScrollCapture={() => {
                if (loading || pageLoadMode !== 'infiniteScroll') return;
                const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
                const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
                let isAtBottom = false;
                if (antdTableEleNodes) {
                  isAtBottom = antdTableEleNodes && antdTableEleNodes?.scrollHeight - (Math.round(antdTableEleNodes?.scrollTop) + antdTableEleNodes?.clientHeight) <= 1;
                } else if (rgdTableEleNodes) {
                  isAtBottom = rgdTableEleNodes && rgdTableEleNodes?.scrollHeight - (Math.round(rgdTableEleNodes?.scrollTop) + rgdTableEleNodes?.clientHeight) <= 1;
                }
                if (isAtBottom) {
                  // 滚动到底后加载下一页
                  const currentServiceParams = getServiceParams();
                  if (data && data.list.length < data.total) {
                    appendRef.current = true;
                    fixedRangeRef.current = true;
                    setServiceParams((prev) => ({
                      ...prev,
                      current: currentServiceParams.current + 1,
                    }));
                  }
                }
              }}
              // state context
              fieldConfig={currentFieldConfig}
              indexData={indexData}
              range={queryValues?.range}
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
                        form.setFieldsValue({
                          refreshFlag: _.uniqueId('refreshFlag_'),
                        });
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
    </div>
  );
}
