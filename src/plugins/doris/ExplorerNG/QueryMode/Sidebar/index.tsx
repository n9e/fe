import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'antd';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';

import { getOrganizeFieldsFromLocalstorage } from '../../utils/organizeFieldsLocalstorage';
import { NAME_SPACE, DATE_TYPE_LIST } from '../../../constants';
import { getDorisIndex, Field } from '../../../services';
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
  onAdd: (queryValues?: { [index: string]: any }) => void;

  stackByField?: string;
  setStackByField: (field?: string) => void;
  defaultSearchField?: string;
  setDefaultSearchField: (field?: string) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const {
    disabled,
    datasourceValue,
    executeQuery,
    organizeFields,
    setOrganizeFields,
    onIndexDataChange,
    onAdd,

    stackByField,
    setStackByField,
    defaultSearchField,
    setDefaultSearchField,
  } = props;
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

  useEffect(() => {
    if (datasourceValue && database && table) {
      setOrganizeFields(
        getOrganizeFieldsFromLocalstorage({
          datasourceValue,
          mode: 'query',
          database,
          table,
        }),
        false,
      );
    }
  }, [datasourceValue, database, table]);

  return (
    <div className='min-h-0 flex-1 h-full flex flex-col'>
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
            onChange={executeQuery}
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
          stackByField={stackByField}
          setStackByField={setStackByField}
          defaultSearchField={defaultSearchField}
          setDefaultSearchField={setDefaultSearchField}
          onAdd={onAdd}
        />
      </div>
    </div>
  );
}
