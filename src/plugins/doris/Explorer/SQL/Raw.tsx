import React, { useState, useEffect } from 'react';
import { Spin, Empty, Space, Radio, Form } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import flatten from '@/pages/explorer/Elasticsearch/flatten';
import FullscreenButton from '@/pages/explorer/components/FullscreenButton';

import { NAME_SPACE, SQL_LOGS_OPTIONS_CACHE_KEY } from '../../constants';
import { logQuery } from '../../services';
import { getLocalstorageOptions, getFieldsFromSQLData, setLocalstorageOptions } from '../utils';
import OriginSettings from '../components/OriginSettings';
import RawList from '../components/RawList';
import RawTable from '../components/RawTable';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface IProps {
  setExecuteLoading: (loading: boolean) => void;
}

function Raw(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { setExecuteLoading } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const [logs, setLogs] = useState<{ [index: string]: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(getLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY));
  const [logRequestParams, setLogRequestParams] = useState<any>({});
  const [fields, setFields] = useState<string[]>([]);
  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(SQL_LOGS_OPTIONS_CACHE_KEY, mergedOptions);
  };

  useEffect(() => {
    if (!_.isEmpty(logRequestParams) && logRequestParams.sql) {
      setLoading(true);
      setExecuteLoading(true);
      const values = form.getFieldsValue();
      const requestParams = {
        cate: values.datasourceCate,
        datasource_id: values.datasourceValue,
        query: [_.omit(logRequestParams, ['refreshFlag']) as any],
      };
      logQuery(requestParams)
        .then((res) => {
          const newLogs = _.map(res.list, (item) => {
            return {
              ...(flatten(item) || {}),
              ___raw___: item,
              ___id___: _.uniqueId('log_id_'),
            };
          });
          setLogs(newLogs);
          setTotal(res.total);
          const columnsKeys = getFieldsFromSQLData(res.list || []);
          setFields(columnsKeys);
        })
        .catch(() => {
          setLogs([]);
        })
        .finally(() => {
          setLoading(false);
          setExecuteLoading(false);
        });
    } else {
      setLogs([]);
      setLoading(false);
      setExecuteLoading(false);
    }
  }, [JSON.stringify(logRequestParams)]);

  useEffect(() => {
    if (refreshFlag) {
      form.validateFields().then((values) => {
        const query = values.query;
        const range = parseRange(query.range);
        setLogRequestParams({
          from: moment(range.start).unix(),
          to: moment(range.end).unix(),
          sql: _.trim(_.split(query.query, '|')?.[0]),
          refreshFlag,
        });
      });
    }
  }, [refreshFlag]);

  return (
    <>
      {!_.isEmpty(logs) ? (
        <div className='h-full min-h-0'>
          <div className='h-full min-h-0 n9e-border-antd rounded flex flex-col'>
            <FullscreenButton.Provider>
              <div className='flex-shrink-0 flex justify-between p-2'>
                <Space>
                  <Radio.Group
                    size='small'
                    optionType='button'
                    buttonStyle='solid'
                    options={[
                      {
                        label: t('logs.settings.mode.origin'),
                        value: 'origin',
                      },
                      {
                        label: t('logs.settings.mode.table'),
                        value: 'table',
                      },
                    ]}
                    value={options.logMode}
                    onChange={(e) => {
                      updateOptions({
                        logMode: e.target.value,
                      });
                    }}
                  />
                  <OriginSettings options={options} setOptions={updateOptions} fields={fields} />
                  <FullscreenButton />
                  <Spin spinning={loading} size='small' />
                </Space>
                <Space>{IS_PLUS && <DownloadModal queryData={{ ...form.getFieldsValue(), total, logs }} />}</Space>
              </div>
              <div className='n9e-antd-table-height-full'>
                {options.logMode === 'origin' && (
                  <RawList
                    data={logs}
                    options={options}
                    onReverseChange={(val) => {
                      setLogRequestParams({
                        ...logRequestParams,
                        is_desc: val,
                      });
                    }}
                  />
                )}
                {options.logMode === 'table' && <RawTable data={logs} options={options} />}
              </div>
            </FullscreenButton.Provider>
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
