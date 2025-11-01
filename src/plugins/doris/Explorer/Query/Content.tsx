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

import { parseRange } from '@/components/TimeRangePicker';
import LogsViewer from '@/pages/explorer/components/LogsViewer';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

import { getDorisLogsQuery, Field, getDorisHistogram } from '../../services';
import { NAME_SPACE, QUERY_LOGS_OPTIONS_CACHE_KEY } from '../../constants';
import { getLocalstorageOptions, setLocalstorageOptions, filteredFields } from '../utils';
import FieldsSidebar from './FieldsSidebar';

interface Props {
  indexData: Field[];
  indexDataLoading: boolean;
  executeQuery: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { indexData, indexDataLoading, executeQuery } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  const rangeRef = useRef<any>();
  const [collapsed, setCollapsed] = useState(true);
  const [queryRefreshFlag, setQueryRefreshFlag] = useState<string>();
  const [options, setOptions] = useState(getLocalstorageOptions(QUERY_LOGS_OPTIONS_CACHE_KEY));
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: 10,
    reverse: true,
  });
  const [snapRange, setSnapRange] = useState<{
    from?: number;
    to?: number;
  }>({
    from: undefined,
    to: undefined,
  });
  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(QUERY_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
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
      rangeRef.current = range;
      return getDorisLogsQuery({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.time_field,
            query: queryValues.query,
            from: moment(range.start).unix(),
            to: moment(range.end).unix(),
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
          return {
            list: newLogs,
            total: res.total,
          };
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
    refreshDeps: [queryRefreshFlag, JSON.stringify(serviceParams)],
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
          },
        ],
      })
        .then((res) => {
          return _.map(res, (item) => {
            return {
              id: _.uniqueId('series_'),
              refId: '',
              name: '',
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
    refreshDeps: [refreshFlag],
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
        setQueryRefreshFlag(_.uniqueId('queryRefreshFlag_'));
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

  return !_.isEmpty(data?.list) ? (
    <div className='flex h-full min-h-0 gap-[16px]'>
      <div
        className='h-full'
        style={{
          display: collapsed ? 'block' : 'none',
        }}
      >
        <FieldsSidebar organizeFields={options.organizeFields} data={indexData} loading={indexDataLoading} onValueFilter={handleValueFilter} setOptions={updateOptions} />
      </div>
      <div className='min-h-0 min-w-0 w-full n9e-border-antd flex flex-col relative'>
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
          histogramExtraRender={
            data && (
              <Space>
                {snapRange.from && snapRange.to ? (
                  <>
                    {moment.unix(snapRange.from).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment.unix(snapRange.to).format('YYYY-MM-DD HH:mm:ss.SSS')}
                  </>
                ) : (
                  <>
                    {moment(rangeRef.current?.start).format('YYYY-MM-DD HH:mm:ss.SSS')} ~ {moment(rangeRef.current?.end).format('YYYY-MM-DD HH:mm:ss.SSS')}
                  </>
                )}
                {IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
              </Space>
            )
          }
          optionsExtraRender={
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
          }
          onOptionsChange={updateOptions}
          onAddToQuery={handleValueFilter}
          onRangeChange={(range) => {
            const query = form.getFieldValue('query') || {};
            form.setFieldsValue({
              query: {
                ...query,
                range,
              },
            });
            setQueryRefreshFlag(_.uniqueId('refreshFlag_'));
          }}
          onLogRequestParamsChange={(params) => {
            if (params.from && params.to) {
              setSnapRange({
                from: params.from,
                to: params.to,
              });
            }
            setQueryRefreshFlag(_.uniqueId('queryRefreshFlag_'));
          }}
          // state context
          fieldConfig={currentFieldConfig}
          indexData={indexData}
          range={queryValues?.range}
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
