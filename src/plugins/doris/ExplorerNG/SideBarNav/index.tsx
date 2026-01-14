import React, { useEffect } from 'react';
import { Form, Segmented, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';
import Meta from '@/components/Meta';

import { NAME_SPACE, DATE_TYPE_LIST } from '../../constants';
import { getDorisIndex, Field } from '../../services';
import { getOrganizeFieldsFromLocalstorage } from '../utils/organizeFieldsLocalstorage';
import DatabaseSelect from './DatabaseSelect';
import TableSelect from './TableSelect';
import DateFieldSelect from './DateFieldSelect';
import FieldsSidebar from './FieldsSidebar';

interface Props {
  disabled?: boolean;
  datasourceValue: number;
  executeQuery: () => void;
  organizeFields: string[];
  setOrganizeFields: (organizeFields: string[], setLocalstorage?: boolean) => void;
  onIndexDataChange: (data: Field[]) => void;
  handleValueFilter: (params: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    disabled,
    datasourceValue,
    executeQuery,
    organizeFields,
    setOrganizeFields,
    onIndexDataChange,
    handleValueFilter,

    stackByField,
    setStackByField,
    defaultSearchField,
    setDefaultSearchField,
  } = props;

  const form = Form.useFormInstance();
  const navMode = Form.useWatch(['query', 'navMode']);
  const database = Form.useWatch(['query', 'database']);
  const table = Form.useWatch(['query', 'table']);

  const indexDataService = () => {
    if (datasourceValue && database && table) {
      return getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database, table })
        .then((res) => {
          const timeField = form.getFieldValue('query')?.time_field;
          const fieldExists = _.some(res, (item) => item.field === timeField);
          if (!timeField || !fieldExists) {
            const firstDateField = _.find(res, (item) => {
              return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
            })?.field;
            if (firstDateField) {
              form.setFieldsValue({
                query: {
                  time_field: firstDateField,
                },
              });
              executeQuery();
            }
          }
          onIndexDataChange(res);
          return res;
        })
        .catch(() => {
          onIndexDataChange([]);
          return [];
        });
    }
    return Promise.resolve(undefined);
  };

  const { data: indexData = [], loading: indexDataLoading } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [datasourceValue, database, table],
  });

  useEffect(() => {
    if (datasourceValue && database && table) {
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          database,
          table,
        }),
        false,
      );
    }
  }, [datasourceValue, database, table]);

  return (
    <>
      <Form.Item name={['query', 'navMode']} initialValue='fields'>
        <Segmented
          block
          options={[
            {
              label: t('query.navMode.fields'),
              value: 'fields',
            },
            {
              label: t('query.navMode.schema'),
              value: 'schema',
            },
          ]}
          onChange={() => {
            form.setFields([
              {
                name: ['query', 'syntax'],
                value: 'sql',
              },
            ]);
          }}
        />
      </Form.Item>
      <div
        className='min-h-0 flex-1 h-full flex-col'
        style={{
          display: navMode === 'fields' ? 'flex' : 'none',
        }}
      >
        <div className='flex-shrink-0'>
          <Form.Item name={['query', 'database']} rules={[{ required: true, message: t('query.database_msg') }]}>
            <DatabaseSelect
              disabled={disabled}
              datasourceValue={datasourceValue}
              onChange={() => {
                form.setFieldsValue({
                  refreshFlag: undefined,
                  query: {
                    stackByField: undefined,
                    defaultSearchField: undefined,
                    table: undefined,
                    time_field: undefined,
                    query: undefined,
                  },
                });
              }}
            />
          </Form.Item>
          <Form.Item name={['query', 'table']} rules={[{ required: true, message: t('query.table_msg') }]}>
            <TableSelect
              datasourceValue={datasourceValue}
              database={database}
              onChange={() => {
                form.setFieldsValue({
                  refreshFlag: undefined,
                  query: {
                    stackByField: undefined,
                    defaultSearchField: undefined,
                    time_field: undefined,
                    query: undefined,
                  },
                });
              }}
            />
          </Form.Item>
          <Form.Item name={['query', 'time_field']} rules={[{ required: true, message: t('query.time_field_msg') }]}>
            <DateFieldSelect
              dateFields={_.filter(indexData, (item) => {
                return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
              })}
              onChange={() => {
                executeQuery();
              }}
            />
          </Form.Item>
        </div>
        <div className='min-h-0 flex-1 children:h-full'>
          <FieldsSidebar
            organizeFields={organizeFields}
            setOrganizeFields={setOrganizeFields}
            data={indexData}
            loading={indexDataLoading}
            onValueFilter={handleValueFilter}
            executeQuery={executeQuery}
            stackByField={stackByField}
            setStackByField={setStackByField}
            defaultSearchField={defaultSearchField}
            setDefaultSearchField={setDefaultSearchField}
          />
        </div>
      </div>

      <div
        className='min-h-0 flex-1 h-full flex-col'
        style={{
          display: navMode === 'schema' ? 'flex' : 'none',
        }}
      >
        <div className='min-h-0 flex-1 border border-fc-300 rounded-sm'>
          {datasourceValue && (
            <Meta
              datasourceCate={DatasourceCateEnum.doris}
              datasourceValue={datasourceValue}
              onTreeNodeClick={(nodeData) => {
                const query = form.getFieldValue(['query']);

                getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database: nodeData.database, table: nodeData.table })
                  .then((res) => {
                    let dateField = 'timestamp';
                    const firstDateField = _.find(res, (item) => {
                      return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                    })?.field;
                    if (firstDateField) {
                      dateField = firstDateField;
                    }
                    if (query.sqlVizType === 'table') {
                      _.set(query, 'sql', `select * from \`${nodeData.database}\`.\`${nodeData.table}\` WHERE $__timeFilter(\`${dateField}\`) limit 20;`);
                    } else if (query.sqlVizType === 'timeseries') {
                      _.set(
                        query,
                        'sql',
                        `SELECT count(*) as cnt, $__timeGroup(\`${dateField}\`, 1m) as time 
FROM \`${nodeData.database}\`.\`${nodeData.table}\`
WHERE $__timeFilter(\`${dateField}\`) 
GROUP BY time`,
                      );
                      _.set(query, 'keys.valueKey', ['cnt']);
                    }
                    form.setFieldsValue({
                      refreshFlag: undefined,
                      query,
                    });
                    executeQuery();
                  })
                  .catch(() => {
                    message.warning(t('query.get_index_fail'));
                    if (query.sqlVizType === 'table') {
                      _.set(query, 'sql', `select * from \`${nodeData.database}\`.\`${nodeData.table}\` WHERE $__timeFilter(\`timestamp\`) limit 20;`);
                    } else if (query.sqlVizType === 'timeseries') {
                      _.set(
                        query,
                        'sql',
                        `SELECT count(*) as cnt, $__timeGroup(\`timestamp\`, 1m) as time 
FROM \`${nodeData.database}\`.\`${nodeData.table}\`
WHERE $__timeFilter(\`timestamp\`) 
GROUP BY time`,
                      );
                      _.set(query, 'keys.valueKey', ['cnt']);
                    }
                    form.setFieldsValue({
                      refreshFlag: undefined,
                      query,
                    });
                    executeQuery();
                  });
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
