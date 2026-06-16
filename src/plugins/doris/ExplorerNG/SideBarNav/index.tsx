import React, { useEffect } from 'react';
import { Form, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';
import Meta from '@/components/Meta';

import { NAME_SPACE, DATE_TYPE_LIST } from '../../constants';
import { getDorisIndex, getDorisTableConfig } from '../../services';
import { HandleValueFilterParams, Field } from '../types';
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
  handleValueFilter: HandleValueFilterParams;

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
  const syntax = Form.useWatch(['query', 'syntax']);
  // const navMode = Form.useWatch(['query', 'navMode']);
  const database = Form.useWatch(['query', 'database']);
  const table = Form.useWatch(['query', 'table']);

  const navMode = 'fields';

  const { data: indexData = [], loading: indexDataLoading } = useRequest<Field[], any>(
    async () => {
      if (!datasourceValue || !database || !table) return [];

      // 1. 先获取 index 字段
      let fields: Field[] = [];
      try {
        fields = await getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database, table });
      } catch {
        // getDorisIndex 失败时继续执行，fields 保持空数组
      }

      // 2. 再获取 table 配置
      let tableConfig: { histogram_stack_field?: string; default_time_field?: string } | undefined;
      try {
        tableConfig = await getDorisTableConfig({
          cate: DatasourceCateEnum.doris,
          datasource_id: datasourceValue,
          database,
          table,
        });
      } catch {
        // getDorisTableConfig 失败时继续执行，tableConfig 保持 undefined
      }

      // 3. 统一处理 time_field 和 stackByField
      const timeField = form.getFieldValue('query')?.time_field;
      const fieldExists = _.some(fields, (item) => item.field === timeField);
      const needsTimeField = !timeField || !fieldExists;

      const patch: Record<string, string> = {};

      if (needsTimeField) {
        if (tableConfig?.default_time_field) {
          // 优先使用接口返回的 default_time_field
          patch.time_field = tableConfig.default_time_field;
        } else {
          // 回退到第一个 date 类型字段
          const firstDateField = _.find(fields, (item) => _.includes(DATE_TYPE_LIST, item.type.toLowerCase()))?.field;
          if (firstDateField) {
            patch.time_field = firstDateField;
          }
        }
      }

      if (tableConfig?.histogram_stack_field) {
        const currentStackByField = form.getFieldValue(['query', 'stackByField']);
        if (!currentStackByField) {
          patch.stackByField = tableConfig.histogram_stack_field;
        }
      }

      if (Object.keys(patch).length > 0) {
        form.setFieldsValue({ query: patch });
      }

      onIndexDataChange(fields);
      return fields;
    },
    {
      refreshDeps: [table],
      onError: () => {
        onIndexDataChange([]);
      },
    },
  );

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
      <Form.Item name={['query', 'navMode']} initialValue='fields' hidden>
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
          <Form.Item name={['query', 'database']} rules={[{ required: syntax === 'query', message: t('query.database_msg') }]}>
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
          <Form.Item name={['query', 'table']} rules={[{ required: syntax === 'query', message: t('query.table_msg') }]}>
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
          <Form.Item name={['query', 'time_field']} rules={[{ required: syntax === 'query', message: t('query.time_field_msg') }]}>
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
    </>
  );
}
