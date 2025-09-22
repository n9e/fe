import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import { useRequest, useGetState } from 'ahooks';
import { Empty, Space, Radio, Spin, Pagination } from 'antd';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum } from '@/utils/constant';
import flatten from '@/pages/explorer/Elasticsearch/flatten';
import FullscreenButton from '@/pages/explorer/components/FullscreenButton';
import normalizeLogStructures from '@/pages/explorer/utils/normalizeLogStructures';

import { getGlobalState } from '../../globalState';
import { getDorisLogsQuery, Field } from '../../services';
import { NAME_SPACE } from '../../constants';
import { getLocalstorageOptions, setLocalstorageOptions } from '../utils';
import OriginSettings from '../components/OriginSettings';
import RawList from '../components/RawList';
import RawTable from '../components/RawTable';

interface Props {
  fields: Field[];
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { fields } = props;
  const form = Form.useFormInstance();
  const refreshFlag = Form.useWatch('refreshFlag');
  const datasourceValue = Form.useWatch(['datasourceValue']);
  const queryValues = Form.useWatch(['query']);
  const [queryRefreshFlag, setQueryRefreshFlag] = useState<string>();
  const [options, setOptions] = useState(getLocalstorageOptions());
  const [serviceParams, setServiceParams, getServiceParams] = useGetState({
    current: 1,
    pageSize: 10,
    reverse: true,
  });
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
      refreshFlag: _.uniqueId('refreshFlag_'),
      query: {
        ...query,
        query: queryStr,
      },
    });
  };

  const service = () => {
    const queryValues = form.getFieldValue('query');
    if (datasourceValue && queryValues?.database && queryValues?.table && queryValues?.time_field) {
      const explorerParsedRange = getGlobalState('explorerParsedRange');
      const explorerSnapRange = getGlobalState('explorerSnapRange');
      const from = explorerSnapRange.start ?? moment(explorerParsedRange.start).unix();
      const to = explorerSnapRange.end ?? moment(explorerParsedRange.end).unix();
      return getDorisLogsQuery({
        cate: DatasourceCateEnum.doris,
        datasource_id: datasourceValue,
        query: [
          {
            database: queryValues.database,
            table: queryValues.table,
            time_field: queryValues.time_field,
            query: queryValues.query,
            from,
            to,
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
    return Promise.resolve({
      list: [],
      total: 0,
    });
  };

  const { data, loading } = useRequest<
    {
      list: { [index: string]: string }[];
      total: number;
    },
    any
  >(service, {
    refreshDeps: [queryRefreshFlag, JSON.stringify(serviceParams)],
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

  return (
    <>
      {!_.isEmpty(data?.list) ? (
        <div className='h-full min-h-0'>
          <div className='h-full mt-2 flex flex-col'>
            <FullscreenButton.Provider>
              <div className='flex-shrink-0 flex justify-between mb-2'>
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
                  <OriginSettings showDateField options={options} setOptions={updateOptions} fields={_.map(fields, 'field')} />
                  <FullscreenButton />
                  <Spin spinning={loading} size='small' />
                </Space>
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
              </div>
              <div className='n9e-antd-table-height-full'>
                {queryValues?.time_field && options.logMode === 'origin' && (
                  <RawList
                    time_field={queryValues.time_field}
                    data={data?.list ?? []}
                    options={options}
                    onValueFilter={handleValueFilter}
                    onReverseChange={(newReverse) => {
                      setServiceParams((prev) => ({
                        ...prev,
                        reverse: newReverse,
                      }));
                    }}
                  />
                )}
                {queryValues?.time_field && options.logMode === 'table' && (
                  <RawTable time_field={queryValues.time_field} data={data?.list ?? []} options={options} onValueFilter={handleValueFilter} />
                )}
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
