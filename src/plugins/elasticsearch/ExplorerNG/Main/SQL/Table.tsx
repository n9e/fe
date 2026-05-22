import React, { useState, useRef } from 'react';
import { Form, Space, Pagination, Empty } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useRequest, useGetState } from 'ahooks';
import { useTranslation, Trans } from 'react-i18next';

import { IS_PLUS, DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import flatten from '@/pages/logExplorer/components/LogsViewer/utils/flatten';
import getFieldsFromTableData from '@/pages/logExplorer/components/LogsViewer/utils/getFieldsFromTableData';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';

import { NAME_SPACE, NG_SQL_LOGS_OPTIONS_CACHE_KEY, NG_SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY, DEFAULT_LOGS_PAGE_SIZE } from '../../../constants';
import { esLogsQuery } from '../../../services';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import filteredFields from '../../utils/filteredFields';
import replaceTemplateVariables from '../../utils/replaceTemplateVariables';
import { scrollToTop, getIsAtBottom } from '../../utils/tableElementMethods';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';
import SqlVizTypeSwitch from './SqlVizTypeSwitch';

interface IProps {
  sqlVizType: string;
  tableSelector: {
    antd: string;
    rgd: string;
  };
  setExecuteLoading: (loading: boolean) => void;
  executeQuery: () => void;
}

export default function Table(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);

  const { sqlVizType, tableSelector, setExecuteLoading, executeQuery } = props;

  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);

  const [options, setOptions] = useState({
    ...getOptionsFromLocalstorage(NG_SQL_LOGS_OPTIONS_CACHE_KEY, {
      logMode: 'table',
    }),
    time: 'false' as 'true' | 'false',
  });
  const pageLoadMode = options.pageLoadMode || 'pagination';

  const [organizeFields, setOrganizeFields] = useState<string[] | undefined>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: DEFAULT_LOGS_PAGE_SIZE,
  });
  const [logs, setLogs] = useState<{
    data: any[];
    hash: string;
  }>({
    data: [],
    hash: '',
  });

  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setOptionsToLocalstorage(NG_SQL_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      setServiceParams({
        current: 1,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
      });
      scrollToTop(tableSelector.antd, tableSelector.rgd);
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refresh_'),
      });
    }
  };

  const loadTimeRef = useRef<number | null>(null);
  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (refreshFlag && datasourceValue && queryValues.sql) {
      setExecuteLoading(true);
      setServiceParams({ current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE });
      const range = parseRange(queryValues.range);
      const queryStart = Date.now();
      return esLogsQuery({
        cate: DatasourceCateEnum.elasticsearch,
        datasource_id: datasourceValue,
        query: [
          {
            index: queryValues.index || '',
            start: moment(range.start).unix(),
            end: moment(range.end).unix(),
            sql: replaceTemplateVariables(_.trim(queryValues.sql), queryValues.range),
          },
        ],
      })
        .then((res) => {
          loadTimeRef.current = Date.now() - queryStart;
          const newLogs = _.map(res.list, (item) => {
            return {
              ...(flatten(item) || {}),
              __n9e_raw_n9e__: item,
              __n9e_id_n9e__: _.uniqueId('log_id_'),
            };
          });

          const columnsKeys = getFieldsFromTableData(res.list || []);
          setFields(columnsKeys);

          setLogs({
            data: _.slice(newLogs, 0, DEFAULT_LOGS_PAGE_SIZE),
            hash: _.uniqueId('logs_'),
          });

          return {
            list: newLogs,
            total: res.total,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(newLogs),
          };
        })
        .catch((err) => {
          console.error('esLogsQuery failed:', err);
          loadTimeRef.current = null;
          setLogs({
            data: [],
            hash: _.uniqueId('logs_'),
          });
          return {
            list: [],
            total: 0,
            hash: _.uniqueId('logs_'),
          };
        })
        .finally(() => {
          setExecuteLoading(false);
        });
    }
    return Promise.resolve({
      list: [],
      total: 0,
      hash: _.uniqueId('logs_'),
    });
  };

  const { data, loading } = useRequest<
    {
      list: { [index: string]: string }[];
      total: number;
      colWidths?: { [key: string]: number };
      hash: string;
    },
    any
  >(service, {
    refreshDeps: [refreshFlag],
  });

  return (
    <>
      {refreshFlag ? (
        <>
          {!_.isEmpty(data?.list) ? (
            <LogsViewer
              id_key='__n9e_id_n9e__'
              raw_key='__n9e_raw_n9e__'
              timeField={queryValues?.time_field}
              hideHistogram
              hideTypeIcon
              loading={loading}
              logs={logs.data}
              logsHash={data?.hash + '_' + logs.hash}
              colWidths={data?.colWidths}
              getAddToQueryInfo={() => ({ isIndex: false, indexName: '' })}
              fields={fields}
              options={options}
              organizeFields={organizeFields}
              setOrganizeFields={setOrganizeFields}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, organizeFields ?? []);
              }}
              addonBefore={<SqlVizTypeSwitch sqlVizType={sqlVizType} />}
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
                      showQuickJumper
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
                        const newLogs = _.slice(data?.list, (current - 1) * pageSize, current * pageSize) || [];
                        setLogs({
                          data: _.map(newLogs, (item) => {
                            return {
                              ...item,
                              __n9e_id_n9e__: _.uniqueId('log_id_'),
                            };
                          }),
                          hash: _.uniqueId('logs_'),
                        });
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
                  {/* {IS_PLUS && <DownloadModal marginLeft={0} queryData={{ ...form.getFieldsValue(), mode: 'sql', total: data?.total }} />} */}
                </Space>
              }
              onOptionsChange={updateOptions}
              showDateField={false}
              onScrollCapture={() => {
                if (loading || pageLoadMode !== 'infiniteScroll') return;
                const isAtBottom = getIsAtBottom(tableSelector.antd, tableSelector.rgd);
                if (isAtBottom) {
                  const currentServiceParams = getServiceParams();
                  if (pageLoadMode === 'infiniteScroll' && data && logs.data.length < data.total) {
                    setServiceParams((prev) => ({
                      ...prev,
                      current: currentServiceParams.current + 1,
                    }));
                    const appendLogs = _.slice(
                      data.list,
                      currentServiceParams.current * currentServiceParams.pageSize,
                      (currentServiceParams.current + 1) * currentServiceParams.pageSize,
                    );
                    setLogs({
                      data: _.concat(
                        logs.data,
                        _.map(appendLogs, (item) => {
                          return {
                            ...item,
                            __n9e_id_n9e__: _.uniqueId('log_id_'),
                          };
                        }),
                      ),
                      hash: _.uniqueId('logs_'),
                    });
                  }
                }
              }}
              tableColumnsWidthCacheKey={`${NG_SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({
                datasourceValue,
              })}`}
              showPageLoadMode
              showLogMode={false}
              linesColumnFormat={(val) => {
                if (pageLoadMode === 'infiniteScroll') return val;
                return serviceParams.pageSize * (serviceParams.current - 1) + val;
              }}
            />
          ) : loading ? (
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
            <>
              <div className='flex justify-between pb-2'>
                <SqlVizTypeSwitch sqlVizType={sqlVizType} />
              </div>
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
            </>
          )}{' '}
        </>
      ) : (
        <>
          <div className='flex justify-between pb-2'>
            <SqlVizTypeSwitch sqlVizType={sqlVizType} />
          </div>
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
        </>
      )}
    </>
  );
}
