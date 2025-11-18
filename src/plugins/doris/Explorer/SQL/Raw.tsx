import React, { useState } from 'react';
import { Empty, Form } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { DatasourceCateEnum } from '@/utils/constant';
import { useRequest } from 'ahooks';

import { IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import flatten from '@/pages/explorer/components/LogsViewer/utils/flatten';
import getFieldsFromTableData from '@/pages/explorer/components/LogsViewer/utils/getFieldsFromTableData';
import LogsViewer from '@/pages/explorer/components/LogsViewer';

import { SQL_LOGS_OPTIONS_CACHE_KEY } from '../../constants';
import { logQuery } from '../../services';
import { getLocalstorageOptions, setLocalstorageOptions, filteredFields } from '../utils';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface IProps {
  setExecuteLoading: (loading: boolean) => void;
}

function Raw(props: IProps) {
  const { setExecuteLoading } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  const [options, setOptions] = useState(getLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY));
  const [fields, setFields] = useState<string[]>([]);

  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
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
              logs={data?.list || []}
              fields={fields}
              options={options}
              filterFields={(fieldKeys) => {
                return filteredFields(fieldKeys, options.organizeFields);
              }}
              optionsExtraRender={IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total: data?.total }} />}
              onOptionsChange={updateOptions}
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
