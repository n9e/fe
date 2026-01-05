import React, { useState, useRef } from 'react';
import { Empty, Form, Space, Pagination } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { DatasourceCateEnum } from '@/utils/constant';
import { useRequest, useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import flatten from '@/pages/logExplorer/components/LogsViewer/utils/flatten';
import getFieldsFromTableData from '@/pages/logExplorer/components/LogsViewer/utils/getFieldsFromTableData';
import LogsViewer from '@/pages/logExplorer/components/LogsViewer';
import calcColWidthByData from '@/pages/logExplorer/components/LogsViewer/utils/calcColWidthByData';

import { NAME_SPACE, SQL_LOGS_OPTIONS_CACHE_KEY, SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY, DEFAULT_LOGS_PAGE_SIZE } from '../../../constants';
import { logQuery } from '../../../services';
import { getOptionsFromLocalstorage, setOptionsToLocalstorage } from '../../utils/optionsLocalstorage';
import filteredFields from '../../utils/filteredFields';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface IProps {
  tabKey: string;
  organizeFields: string[];
  setOrganizeFields: (value: string[]) => void;
  setExecuteLoading: (loading: boolean) => void;
}

export default function Raw(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);

  const { tabKey, organizeFields, setOrganizeFields, setExecuteLoading } = props;

  const logsAntdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const logsRgdTableSelector = `.explorer-container-${tabKey} .n9e-event-logs-table`;

  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  const [options, setOptions] = useState(getOptionsFromLocalstorage(SQL_LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
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
    setOptionsToLocalstorage(SQL_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      setServiceParams({
        current: 1,
        pageSize: DEFAULT_LOGS_PAGE_SIZE,
      });
      const antdTableEleNodes = document.querySelector(logsAntdTableSelector);
      const rgdTableEleNodes = document.querySelector(logsRgdTableSelector);
      if (antdTableEleNodes) {
        antdTableEleNodes?.scrollTo(0, 0);
      } else if (rgdTableEleNodes) {
        rgdTableEleNodes?.scrollTo(0, 0);
      }
      form.setFieldsValue({
        refreshFlag: _.uniqueId('refresh_'),
      });
    }
  };

  const loadTimeRef = useRef<number | null>(null);
  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (datasourceValue && queryValues.query) {
      setExecuteLoading(true);
      const range = parseRange(queryValues.range);
      const queryStart = Date.now();
      return logQuery({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            from: moment(range.start).unix(),
            to: moment(range.end).unix(),
            sql: _.trim(_.split(queryValues.query, '|')?.[0]),
          },
        ],
      })
        .then((res) => {
          loadTimeRef.current = Date.now() - queryStart;
          const newLogs = _.map(res.list, (item) => {
            return {
              ...(flatten(item) || {}),
              ___raw___: item,
              ___id___: _.uniqueId('log_id_'),
            };
          });

          const columnsKeys = getFieldsFromTableData(res.list || []);
          setFields(columnsKeys);

          setLogs({
            data: _.slice(newLogs, 0, serviceParams.pageSize),
            hash: _.uniqueId('logs_'),
          }); // 首次只加载一页数据

          return {
            list: newLogs,
            total: res.total,
            hash: _.uniqueId('logs_'),
            colWidths: calcColWidthByData(newLogs),
          };
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
      {!_.isEmpty(data?.list) ? (
        <div className='h-full min-h-0'>
          <div className='h-full min-h-0 border border-antd rounded-sm flex flex-col pt-2'>
            <LogsViewer
              timeField={queryValues?.time_field}
              hideHistogram
              loading={loading}
              logs={logs.data}
              logsHash={data?.hash + '_' + logs.hash}
              colWidths={data?.colWidths}
              fields={fields}
              options={options}
              organizeFields={organizeFields}
              setOrganizeFields={setOrganizeFields}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, organizeFields);
              }}
              optionsExtraRender={
                <Space>
                  {loadTimeRef.current !== null && (
                    <Space size={4}>
                      <span>{t('query.duration')} :</span>
                      <span>{loadTimeRef.current} ms</span>
                    </Space>
                  )}
                  {pageLoadMode === 'pagination' ? (
                    <Space>
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
                          const newLogs = _.slice(data?.list, (current - 1) * pageSize, current * pageSize) || [];
                          setLogs({
                            data: _.map(newLogs, (item) => {
                              return {
                                ...item,
                                ___id___: _.uniqueId('log_id_'),
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
                      {IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
                    </Space>
                  ) : (
                    <Space size={4}>
                      <span>{t('query.count')} :</span>
                      <span>{data?.total}</span>
                    </Space>
                  )}
                </Space>
              }
              onOptionsChange={updateOptions}
              showDateField={false}
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
                            ___id___: _.uniqueId('log_id_'),
                          };
                        }),
                      ),
                      hash: _.uniqueId('logs_'),
                    });
                  }
                }
              }}
              tableColumnsWidthCacheKey={`${SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY}${JSON.stringify({
                datasourceValue,
              })}`}
              showPageLoadMode
            />
          </div>
        </div>
      ) : (
        <div className='flex justify-center'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </>
  );
}
