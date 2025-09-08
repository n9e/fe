import React, { useState, useEffect, useRef, useContext } from 'react';
import { Spin, Empty, Space, Radio, Form } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { parseRange } from '@/components/TimeRangePicker';
import flatten from '@/pages/explorer/Elasticsearch/flatten';
import FullscreenButton from '@/pages/explorer/components/FullscreenButton';

import { NAME_SPACE } from '../../constants';
import { logQuery } from '../../services';
import RawList, { OriginSettings } from './RawList';
import RawTable from './RawTable';
import { getFieldsFromSQLData, setLocalstorageOptions } from '../utils';
import { CommonStateContext } from '@/App';

// @ts-ignore
import DownloadModal from 'plus:/components/LogDownload/DownloadModal';

interface IProps {
  options: any;
  refreshFlag?: string;
  setRefreshFlag: (flag?: string) => void;
  setExecuteLoading: (loading: boolean) => void;
}

function Raw(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { refreshFlag, setRefreshFlag, setExecuteLoading } = props;
  const { isPlus } = useContext(CommonStateContext);
  const form = Form.useFormInstance();
  const rangeRef = useRef<any>();
  const [logs, setLogs] = useState<{ [index: string]: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(props.options);
  const [logRequestParams, setLogRequestParams] = useState<any>({});
  const [fields, setFields] = useState<string[]>([]);
  const contextRef = useRef<string>();
  const updateOptions = (newOptions) => {
    const mergedOptions = {
      ...options,
      ...newOptions,
    };
    setOptions(mergedOptions);
    setLocalstorageOptions(mergedOptions);
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
      queryStr += `${queryStr === '' ? '' : ' '}NOT ${params.key}:"${params.value}"`;
    }
    form.setFieldsValue({
      query: {
        ...query,
        query: queryStr,
      },
    });
    setRefreshFlag(_.uniqueId('refreshFlag_'));
  };

  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);

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
          setRefreshFlag(undefined);
        });
    } else {
      setLogs([]);
      setLoading(false);
      setExecuteLoading(false);
      setRefreshFlag(undefined);
    }
  }, [JSON.stringify(logRequestParams)]);

  useEffect(() => {
    if (refreshFlag) {
      const values = form.getFieldsValue();
      const query = values.query;
      const range = parseRange(query.range);
      rangeRef.current = range;
      setLogRequestParams({
        from: moment(range.start).unix(),
        to: moment(range.end).unix(),
        sql: _.trim(_.split(query.query, '|')?.[0]),
        refreshFlag,
      });
      contextRef.current = undefined;
    }
  }, [refreshFlag]);

  return (
    <>
      {!_.isEmpty(logs) ? (
        <div className='explorer-content min-h-0'>
          <div
            className='explorer-main rounded'
            style={{
              paddingTop: 10,
              border: '1px solid var(--fc-border-color2)',
            }}
          >
            <FullscreenButton.Provider>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px 10px 10px' }}>
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
                  <OriginSettings
                    options={options}
                    setOptions={updateOptions}
                    fields={fields}
                    onReverseChange={(val) => {
                      contextRef.current = undefined;
                      setLogRequestParams({
                        ...logRequestParams,
                        is_desc: val === 'true',
                      });
                    }}
                  />
                  <FullscreenButton />
                  <Spin spinning={loading} size='small' />
                </Space>
                <Space>{isPlus && <DownloadModal queryData={{ ...form.getFieldsValue(), total, logs }} />}</Space>
              </div>
              <div className='n9e-antd-table-height-full'>
                {options.logMode === 'origin' && (
                  <RawList
                    data={logs}
                    options={options}
                    onReverseChange={(val) => {
                      contextRef.current = undefined;
                      setLogRequestParams({
                        ...logRequestParams,
                        is_desc: val === 'true',
                      });
                    }}
                    onValueFilter={handleValueFilter}
                  />
                )}
                {options.logMode === 'table' && <RawTable data={logs} options={options} scroll={{ x: 'max-content', y: 'calc(100% - 40px)' }} onValueFilter={handleValueFilter} />}
              </div>
            </FullscreenButton.Provider>
          </div>
        </div>
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
    </>
  );
}

export default React.memo(Raw, (prevProps, nextProps) => {
  const omitPaths = ['form', 'setRefreshFlag'];
  return _.isEqual(_.omit(prevProps, omitPaths), _.omit(nextProps, omitPaths));
});
