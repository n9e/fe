import React, { useState, useRef } from 'react';
import { Empty, Form, Space, Pagination } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { DatasourceCateEnum } from '@/utils/constant';
import { useRequest, useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import flatten from '@/pages/explorer/components/LogsViewer/utils/flatten';
import getFieldsFromTableData from '@/pages/explorer/components/LogsViewer/utils/getFieldsFromTableData';
import LogsViewer from '@/pages/explorer/components/LogsViewer';
import { useGlobalState } from '@/pages/explorer/globalState';

import { NAME_SPACE, SQL_LOGS_OPTIONS_CACHE_KEY } from '../../constants';
import { logQuery } from '../../services';
import { getLocalstorageOptions, setLocalstorageOptions, filteredFields } from '../utils';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface IProps {
  setExecuteLoading: (loading: boolean) => void;
}

function Raw(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const [tabKey] = useGlobalState('tabKey');
  const logsTableSelectors = `.explorer-container-${tabKey} .n9e-event-logs-table .ant-table-body`;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  const [options, setOptions] = useState(getLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY));
  const pageLoadMode = options.pageLoadMode || 'pagination';
  const [fields, setFields] = useState<string[]>([]);
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: 10,
  });
  const [logs, setLogs] = useState<any[]>([]);

  const updateOptions = (newOptions, reload?: boolean) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
    if (reload) {
      setServiceParams({
        current: 1,
        pageSize: 10,
      });
      const tableEleNodes = document.querySelectorAll(logsTableSelectors)[0];
      tableEleNodes?.scrollTo(0, 0);
    }
  };

  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (datasourceValue && queryValues.query) {
      const range = parseRange(queryValues.range);
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
          const newLogs = _.map(res.list, (item) => {
            return {
              ...(flatten(item) || {}),
              ___raw___: item,
              ___id___: _.uniqueId('log_id_'),
            };
          });

          const columnsKeys = getFieldsFromTableData(res.list || []);
          setFields(columnsKeys);

          setLogs(_.slice(newLogs, 0, serviceParams.pageSize)); // 首次只加载一页数据

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
              logs={logs}
              fields={fields}
              options={options}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, options.organizeFields);
              }}
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
                        const newLogs = _.slice(data?.list, (current - 1) * pageSize, current * pageSize) || [];
                        setLogs(
                          _.map(newLogs, (item) => {
                            return {
                              ...item,
                              ___id___: _.uniqueId('log_id_'),
                            };
                          }),
                        );
                      }}
                      showTotal={(total) => {
                        return t('common:table.total', { total });
                      }}
                    />
                    {IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
                  </Space>
                ) : (
                  t('common:table.total', { total: data?.total })
                )
              }
              onOptionsChange={updateOptions}
              showDateField={false}
              onScrollCapture={() => {
                const tableEleNodes = document.querySelectorAll(logsTableSelectors)[0];
                if (tableEleNodes?.scrollHeight - (Math.round(tableEleNodes?.scrollTop) + tableEleNodes?.clientHeight) <= 1) {
                  // 滚动到底后加载下一页
                  const currentServiceParams = getServiceParams();
                  if (pageLoadMode === 'infiniteScroll' && data && logs.length < data.total) {
                    setServiceParams((prev) => ({
                      ...prev,
                      current: currentServiceParams.current + 1,
                    }));
                    const appendLogs = _.slice(data.list, 0, (currentServiceParams.current + 1) * currentServiceParams.pageSize);
                    setLogs(
                      _.concat(
                        logs,
                        _.map(appendLogs, (item) => {
                          return {
                            ...item,
                            ___id___: _.uniqueId('log_id_'),
                          };
                        }),
                      ),
                    );
                  }
                }
              }}
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

export default React.memo(Raw, (prevProps, nextProps) => {
  const omitPaths = ['setExecuteLoadings'];
  return _.isEqual(_.omit(prevProps, omitPaths), _.omit(nextProps, omitPaths));
});
