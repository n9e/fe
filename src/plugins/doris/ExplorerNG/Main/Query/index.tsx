import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Space, Tooltip, Pagination, Empty, Popover } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { useRequest, useGetState } from 'ahooks';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';
import flatten from '@/pages/logExplorer/components/LogsViewer/utils/flatten';
import normalizeLogStructures from '@/pages/logExplorer/utils/normalizeLogStructures';
import useFieldConfig from '@/pages/logExplorer/components/RenderValue/useFieldConfig';

import { NAME_SPACE, NG_QUERY_LOGS_OPTIONS_CACHE_KEY, DEFAULT_LOGS_PAGE_SIZE, QUERY_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY } from '../../../constants';
import { getDorisLogsQuery, getDorisHistogram } from '../../../services';
import { Field } from '../../types';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import filteredFields from '../../utils/filteredFields';
import { scrollToTop, getIsAtBottom } from '../../utils/tableElementMethods';
import { PinIcon, UnPinIcon } from '../../SideBarNav/FieldsSidebar/PinIcon';
import { HandleValueFilterParams } from '../../types';
import QueryBuilderFilters from './QueryBuilderFilters';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface Props {
  tableSelector: {
    antd: string;
    rgd: string;
  };
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

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');

  const {
    tableSelector,
    indexData,
    rangeRef,
    snapRangeRef,
    organizeFields,
    setOrganizeFields,
    handleValueFilter,
    setExecuteLoading,
    executeQuery,
    stackByField,
    setStackByField,
    defaultSearchField,
  } = props;

  const [options, setOptions] = useState(getOptionsFromLocalstorage(NG_QUERY_LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const appendRef = useRef<boolean>(false); // 是否是滚动加载更多日志
  const [serviceParams, setServiceParams, getServiceParams] = useGetState<{
    current: number;
    pageSize: number;
    reverse: boolean;
    refreshFlag: string | undefined;
  }>({
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
    setOptionsToLocalstorage(NG_QUERY_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
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
    if (refreshFlag && datasourceValue && queryValues?.database && queryValues?.table && queryValues?.time_field && queryValues.range) {
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
            query_builder_filter: queryValues.query_builder_filter,
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
              scrollToTop(tableSelector.antd, tableSelector.rgd);
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
    if (refreshFlag && datasourceValue && queryValues && queryValues.database && queryValues.table && queryValues.time_field && queryValues.range) {
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
            query_builder_filter: queryValues.query_builder_filter,
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
    setExecuteLoading(loading || histogramLoading);
  }, [loading, histogramLoading]);

  return (
    <>
      <QueryBuilderFilters indexData={indexData} snapRangeRef={snapRangeRef} executeQuery={executeQuery} />
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
                      {IS_PLUS && <DownloadModal marginLeft={0} queryData={{ ...form.getFieldsValue(), mode: 'query', total: data?.total }} />}
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
              onScrollCapture={() => {
                if (loading || pageLoadMode !== 'infiniteScroll') return;
                const isAtBottom = getIsAtBottom(tableSelector.antd, tableSelector.rgd);
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
              linesColumnFormat={(val) => {
                return serviceParams.pageSize * (serviceParams.current - 1) + val;
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
