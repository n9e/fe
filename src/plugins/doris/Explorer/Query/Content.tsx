import React, { useEffect, useState, useRef } from 'react';
import { Form } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { useRequest, useGetState } from 'ahooks';
import { Empty, Space, Pagination } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import flatten from '@/pages/explorer/components/LogsViewer/utils/flatten';
import normalizeLogStructures from '@/pages/explorer/utils/normalizeLogStructures';
import useFieldConfig from '@/pages/explorer/components/RenderValue/useFieldConfig';
import { useGlobalState } from '@/pages/explorer/globalState';

import { parseRange } from '@/components/TimeRangePicker';
import LogsViewer from '@/pages/explorer/components/LogsViewer';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

import { getDorisLogsQuery, Field, getDorisHistogram } from '../../services';
import { NAME_SPACE, QUERY_LOGS_OPTIONS_CACHE_KEY } from '../../constants';
import { getLocalstorageOptions, setLocalstorageOptions, filteredFields, getPinIndexFromLocalstorage } from '../utils';
import FieldsSidebar from './FieldsSidebar';

interface Props {
  rangeRef: React.MutableRefObject<
    | {
        from: number;
        to: number;
      }
    | undefined
  >;
  indexData: Field[];
  indexDataLoading: boolean;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [tabKey] = useGlobalState('tabKey');
  const logsTableSelectors = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const { rangeRef, indexData, indexDataLoading, executeQuery } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  // 点击直方图某个柱子时，设置的时间范围
  const snapRangeRef = useRef<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });
  const [pinIndex, setPinIndex] = useState<Field | undefined>(
    getPinIndexFromLocalstorage({
      datasourceValue,
      database: queryValues?.database,
      table: queryValues?.table,
    }),
  );
  const [collapsed, setCollapsed] = useState(true);

  const [options, setOptions] = useState(getLocalstorageOptions(QUERY_LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const appendRef = useRef<boolean>(false); // 是否是滚动加载更多日志
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: 10,
    reverse: true,
  });
  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(QUERY_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
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

  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (datasourceValue && queryValues?.database && queryValues?.table && queryValues?.time_field) {
      const range = parseRange(queryValues.range);
      let timeParams = {
        from: moment(range.start).unix(),
        to: moment(range.end).unix(),
      };
      if (snapRangeRef.current && snapRangeRef.current.from && snapRangeRef.current.to) {
        timeParams = snapRangeRef.current as { from: number; to: number };
      }
      rangeRef.current = timeParams;
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
          },
        ],
      })
        .then((res) => {
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
            };
          } else {
            if (pageLoadMode === 'infiniteScroll') {
              const tableEleNodes = document.querySelectorAll(logsTableSelectors)[0];
              tableEleNodes?.scrollTo(0, 0);
            }
            appendRef.current = false;
            return {
              list: newLogs,
              total: res.total,
            };
          }
        })
        .catch(() => {
          return {
            list: [],
            total: 0,
          };
        });
    }
    return Promise.resolve(undefined);
  };

  const { data, loading } = useRequest<
    | {
        list: { [index: string]: string }[];
        total: number;
      }
    | undefined,
    any
  >(service, {
    refreshDeps: [refreshFlag, JSON.stringify(serviceParams)],
  });

  const histogramService = () => {
    const queryValues = form.getFieldValue('query');
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
            group_by: pinIndex?.field,
          },
        ],
      })
        .then((res) => {
          return _.map(res, (item) => {
            return {
              id: _.uniqueId('series_'),
              ref: '',
              name: item.ref,
              metric: {},
              data: item.values,
            };
          });
        })
        .catch(() => {
          return [];
        });
    } else {
      return Promise.resolve(undefined);
    }
  };

  const { data: histogramData, loading: histogramLoading } = useRequest<any[] | undefined, any>(histogramService, {
    refreshDeps: [refreshFlag, pinIndex],
  });

  useEffect(() => {
    if (refreshFlag) {
      const currentServiceParams = getServiceParams();
      if (currentServiceParams.current !== 1) {
        setServiceParams((prev) => ({
          ...prev,
          current: 1,
        }));
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

  useEffect(() => {
    if (datasourceValue && queryValues?.database && queryValues?.table) {
      setPinIndex(
        getPinIndexFromLocalstorage({
          datasourceValue,
          database: queryValues.database,
          table: queryValues.table,
        }),
      );
    } else {
      setPinIndex(undefined);
    }
  }, [datasourceValue, queryValues?.database, queryValues?.table]);

  return !_.isEmpty(data?.list) ? (
    <div className='flex h-full min-h-0 gap-[16px]'>
      <div
        className='h-full'
        style={{
          display: collapsed ? 'block' : 'none',
        }}
      >
        <FieldsSidebar
          organizeFields={options.organizeFields}
          data={indexData}
          loading={indexDataLoading}
          onValueFilter={handleValueFilter}
          setOptions={updateOptions}
          pinIndex={pinIndex}
          setPinIndex={setPinIndex}
        />
      </div>
      <div className='min-h-0 min-w-0 w-full border border-antd rounded-sm flex flex-col relative'>
        <LogsViewer
          timeField={queryValues?.time_field}
          histogramLoading={histogramLoading}
          histogram={histogramData || []}
          loading={loading}
          logs={data?.list || []}
          fields={_.map(indexData, 'field')}
          options={options}
          filterFields={(fieldKeys) => {
            return filteredFields(fieldKeys, options.organizeFields);
          }}
          histogramAddonBeforeRender={<span>{pinIndex ? pinIndex.field : undefined}</span>}
          histogramAddonAfterRender={
            data && (
              <Space>
                {rangeRef.current && (
                  <>
                    {moment.unix(rangeRef.current?.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment.unix(rangeRef.current?.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                  </>
                )}
                {IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
              </Space>
            )
          }
          optionsExtraRender={
            pageLoadMode === 'pagination' ? (
              <Space size={0}>
                <Pagination
                  size='small'
                  total={data?.total}
                  current={serviceParams.current}
                  pageSize={serviceParams.pageSize}
                  onChange={(current, pageSize) => {
                    setServiceParams((prev) => ({
                      ...prev,
                      current,
                      pageSize,
                    }));
                  }}
                  showTotal={(total) => {
                    return t('common:table.total', { total });
                  }}
                />
              </Space>
            ) : (
              t('common:table.total', { total: data?.total })
            )
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
              refreshFlag: _.uniqueId('refreshFlag_'),
            });
          }}
          onLogRequestParamsChange={(params) => {
            if (params.from && params.to) {
              snapRangeRef.current = {
                from: params.from,
                to: params.to,
              };
              form.setFieldsValue({
                refreshFlag: _.uniqueId('refreshFlag_'),
              });
            }
            if (params.reverse !== undefined) {
              setServiceParams((prev) => ({
                ...prev,
                current: 1,
                reverse: params.reverse,
              }));
            }
          }}
          onScrollCapture={() => {
            const tableEleNodes = document.querySelectorAll(logsTableSelectors)[0];
            if (tableEleNodes?.scrollHeight - (Math.round(tableEleNodes?.scrollTop) + tableEleNodes?.clientHeight) === 0) {
              // 滚动到底后加载下一页
              const currentServiceParams = getServiceParams();
              if (pageLoadMode === 'infiniteScroll' && data && data.list.length < data.total) {
                appendRef.current = true;
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
          stacked={!!pinIndex} // only for histogram
        />
        <div
          className='h-[58px] w-[10px] cursor-pointer absolute top-1/2 left-[-14px] mt-[-29px] flex items-center justify-center rounded n9e-fill-color-4'
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        >
          {collapsed ? <LeftOutlined /> : <RightOutlined />}
        </div>
      </div>
    </div>
  ) : (
    <div className='flex justify-center'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
}
