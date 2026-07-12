import React, { useEffect } from 'react';
import { Form, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum } from '@/utils/constant';
import Meta from '@/components/Meta';

import { isCKDateType, NAME_SPACE } from '../../constants';
import { getCKIndex } from '../../services';
import { HandleValueFilterParams, Field } from '../types';
import { getOrganizeFieldsFromLocalstorage } from '../utils/organizeFieldsLocalstorage';
import { pickCKTimeField } from '../utils/queryMode';
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
        fields = await getCKIndex({ cate: DatasourceCateEnum.ck, datasource_id: datasourceValue, database, table });
      } catch {
        // getCKIndex 失败时继续执行，fields 保持空数组
      }

      // CK 暂无表级默认配置，按稳定的字段元数据自动选择时间字段。
      const timeField = form.getFieldValue('query')?.time_field;
      const fieldExists = _.some(fields, (item) => item.field === timeField);
      const needsTimeField = !timeField || !fieldExists;

      const patch: Record<string, string> = {};

      if (needsTimeField) {
        const nextTimeField = pickCKTimeField(fields);
        if (nextTimeField) {
          patch.time_field = nextTimeField.field;
        }
      }

      if (Object.keys(patch).length > 0) {
        form.setFieldsValue({ query: patch });
      }

      onIndexDataChange(fields);
      return fields;
    },
    {
      refreshDeps: [datasourceValue, database, table],
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
                    query_builder_filter: undefined,
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
                    query_builder_filter: undefined,
                  },
                });
              }}
            />
          </Form.Item>
          <Form.Item name={['query', 'time_field']} rules={[{ required: syntax === 'query', message: t('query.time_field_msg') }]}>
            <DateFieldSelect
              dateFields={_.filter(indexData, (item) => {
                return isCKDateType(item.type, item.normalized_type);
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
