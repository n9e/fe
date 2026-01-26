import React, { useEffect, useMemo } from 'react';
import { Form, Space, Tooltip, Segmented, Button, Select, InputNumber } from 'antd';
import { FormInstance } from 'antd/es/form';
import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { SIZE, DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { Field, FieldSampleParams } from '../../types';
import { NAME_SPACE, DATE_TYPE_LIST } from '../../../constants';
import { getDorisIndex, buildSql } from '../../../services';
import getMaxLabelWidth from '../QueryBuilder/utils/getMaxLabelWidth';
import DatabaseSelect from '../DatabaseSelect';
import TableSelect from '../TableSelect';
import DateFieldSelect from '../DateFieldSelect';

import Filters from './Filters';
import Aggregates from './Aggregates';
import OrderBy from './OrderBy';

interface Props {
  explorerForm: FormInstance;
  datasourceValue: number;
  database?: string;
  table?: string;
  time_field?: string;
  sqlValue?: string;
  visible: boolean;
  onExecute: (values) => void;
  onPreviewSQL: (values) => void;
}

export default function index(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);

  const { explorerForm, datasourceValue, database, table, time_field, sqlValue, visible, onExecute, onPreviewSQL } = props;

  const [form] = Form.useForm();
  // const database = Form.useWatch(['database'], form);
  // const table = Form.useWatch(['table'], form);
  // const time_field = Form.useWatch(['time_field'], form);
  const filters = Form.useWatch(['filters'], form);
  const aggregates = Form.useWatch(['aggregates'], form);
  const group_by = Form.useWatch(['group_by'], form);

  const fieldSampleParams = useMemo(() => {
    const range = explorerForm.getFieldValue(['query', 'range']);
    if (!database || !table || !time_field || !range) return {} as FieldSampleParams;
    const parsedRange = parseRange(range);
    return {
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceValue,
      database,
      table,
      time_field,
      filters,
      from: moment(parsedRange.start).unix(),
      to: moment(parsedRange.end).unix(),
      limit: 10,
    };
  }, [datasourceValue, database, table, time_field, JSON.stringify(filters)]);

  const indexDataService = () => {
    if (datasourceValue && database && table) {
      return getDorisIndex({ cate: DatasourceCateEnum.doris, datasource_id: datasourceValue, database, table })
        .then((res) => {
          const timeField = form.getFieldValue('time_field');
          const fieldExists = _.some(res, (item) => item.field === timeField);
          if (!timeField || !fieldExists) {
            const firstDateField = _.find(res, (item) => {
              return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
            })?.field;
            if (firstDateField) {
              form.setFieldsValue({
                time_field: firstDateField,
              });
            }
          }
          return res;
        })
        .catch(() => {
          return [];
        });
    }
    return Promise.resolve(undefined);
  };

  const { data: indexData = [] } = useRequest<Field[] | undefined, any>(indexDataService, {
    refreshDeps: [datasourceValue, database, table],
  });

  const validIndexData = useMemo(() => {
    return _.filter(indexData, (item) => {
      return item.indexable === true;
    });
  }, [indexData]);

  const maxLabelWidth = useMemo(() => {
    return getMaxLabelWidth([
      t('builder.database_table.label'),
      t('builder.filters.label'),
      t('builder.aggregates.label'),
      t('builder.display_label'),
      t('builder.order_by.label'),
    ]);
  }, [i18n.language]);

  useEffect(() => {
    if (visible) {
      const explorerQueryValues = explorerForm.getFieldValue('query') || {};
      const database = form.getFieldValue('database');
      const table = form.getFieldValue('table');
      const time_field = form.getFieldValue('time_field');

      form.setFieldsValue({
        database: database || explorerQueryValues.database || undefined,
        table: table || explorerQueryValues.table || undefined,
        time_field: time_field || explorerQueryValues.time_field || undefined,
      });
    }
  }, [visible]);

  return (
    <Form form={form} layout='vertical'>
      <div className='w-full table border-separate border-spacing-y-2'>
        <div
          className='table-column'
          style={{
            width: maxLabelWidth,
          }}
        />
        <div className='table-column' />
        {/* <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.database_table.label')}</div>
          </div>
          <div className='table-cell'>
            <Space
              size={SIZE}
              wrap
              style={{
                maxWidth: 'calc(100% - 200px)',
              }}
            >
              <InputGroupWithFormItem label={t('builder.database_table.database')} size='small'>
                <Form.Item
                  className='mb-0'
                  name='database'
                  rules={[
                    {
                      required: true,
                      message: t('query.database_msg'),
                    },
                  ]}
                >
                  <DatabaseSelect
                    className='w-[160px]'
                    dropdownClassName='doris-query-builder-popup'
                    datasourceValue={datasourceValue}
                    onChange={() => {
                      form.setFieldsValue({
                        table: undefined,
                        time_field: undefined,
                        filters: undefined,
                        aggregates: undefined,
                        group_by: undefined,
                        order_by: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
              <InputGroupWithFormItem label={t('builder.database_table.table')} size='small'>
                <Form.Item
                  className='mb-0'
                  name='table'
                  rules={[
                    {
                      required: true,
                      message: t('query.table_msg'),
                    },
                  ]}
                >
                  <TableSelect
                    className='w-[160px]'
                    dropdownClassName='doris-query-builder-popup'
                    datasourceValue={datasourceValue}
                    database={database}
                    onChange={() => {
                      form.setFieldsValue({
                        time_field: undefined,
                        filters: undefined,
                        aggregates: undefined,
                        group_by: undefined,
                        order_by: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
              <InputGroupWithFormItem label={t('query.time_field')} size='small'>
                <Form.Item
                  className='mb-0'
                  name='time_field'
                  rules={[
                    {
                      required: true,
                      message: t('query.time_field_msg'),
                    },
                  ]}
                >
                  <DateFieldSelect
                    className='w-[160px]'
                    dropdownClassName='doris-query-builder-popup'
                    dateFields={_.filter(indexData, (item) => {
                      return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                    })}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Space>
          </div>
        </div> */}
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>
              <Tooltip title={t('builder.filters.label_tip')}>
                <Space size={SIZE / 2}>
                  <span>{t('builder.filters.label')}</span>
                  <InfoCircleOutlined />
                </Space>
              </Tooltip>
            </div>
          </div>
          <div className='table-cell'>
            <Form.Item name='filters' noStyle>
              <Filters size='small' indexData={validIndexData} fieldSampleParams={fieldSampleParams} />
            </Form.Item>
          </div>
        </div>
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.aggregates.label')}</div>
          </div>
          <div className='table-cell'>
            <Form.Item name='aggregates' noStyle>
              <Aggregates indexData={validIndexData} />
            </Form.Item>
          </div>
        </div>
        <div className='table-row'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.display_label')}</div>
          </div>
          <div className='table-cell'>
            <Space size={SIZE} wrap>
              <Form.Item name='mode' noStyle initialValue='table'>
                <Segmented
                  size='small'
                  options={[
                    { label: t('builder.mode.table'), value: 'table' },
                    { label: t('builder.mode.timeseries'), value: 'timeseries' },
                  ]}
                />
              </Form.Item>
              <InputGroupWithFormItem size='small' label={t('builder.group_by')}>
                <Form.Item name='group_by' noStyle>
                  <Select
                    size='small'
                    className='min-w-[160px]'
                    options={_.map(indexData, (item) => {
                      return { label: item.field, value: item.field };
                    })}
                    mode='multiple'
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
              <InputGroupWithFormItem size='small' label={t('builder.limit')}>
                <Form.Item name='limit' noStyle>
                  <InputNumber size='small' className='w-[80px]' min={1} max={10000000} />
                </Form.Item>
              </InputGroupWithFormItem>
            </Space>
          </div>
        </div>
        <div className='table-row mb-4'>
          <div className='table-cell align-top'>
            <div className='h-[24px] flex items-center'>{t('builder.order_by.label')}</div>
          </div>
          <div className='table-cell'>
            <Form.Item name='order_by' noStyle>
              <OrderBy indexData={validIndexData} aggregates={aggregates} group_by={group_by} />
            </Form.Item>
          </div>
        </div>
      </div>
      <Space size={SIZE} className='mt-2'>
        <Tooltip title={sqlValue ? t('builder.btn_tip') : undefined}>
          <Button
            size='small'
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => {
              form.validateFields().then((values) => {
                const range = explorerForm.getFieldValue(['query', 'range']);
                if (!range || !database || !table || !time_field) return;
                const parsedRange = parseRange(range);
                buildSql({
                  cate: DatasourceCateEnum.doris,
                  datasource_id: datasourceValue,
                  query: [
                    {
                      database,
                      table,
                      time_field,
                      from: moment(parsedRange.start).unix(),
                      to: moment(parsedRange.end).unix(),
                      filters: values.filters,
                      aggregates: values.aggregates,
                      group_by: values.group_by,
                      order_by: values.order_by,
                      mode: values.mode,
                      limit: values.limit,
                    },
                  ],
                }).then((res) => {
                  onExecute(res);
                });
              });
            }}
          >
            {t('builder.excute')}
          </Button>
        </Tooltip>
        <Tooltip title={sqlValue ? t('builder.btn_tip') : undefined}>
          <Button
            size='small'
            onClick={() => {
              form.validateFields().then((values) => {
                const range = explorerForm.getFieldValue(['query', 'range']);
                if (!range || !database || !table || !time_field) return;
                const parsedRange = parseRange(range);
                buildSql({
                  cate: DatasourceCateEnum.doris,
                  datasource_id: datasourceValue,
                  query: [
                    {
                      database,
                      table,
                      time_field,
                      from: moment(parsedRange.start).unix(),
                      to: moment(parsedRange.end).unix(),
                      filters: values.filters,
                      aggregates: values.aggregates,
                      group_by: values.group_by,
                      order_by: values.order_by,
                      mode: values.mode,
                      limit: values.limit,
                    },
                  ],
                }).then((res) => {
                  onPreviewSQL(res);
                });
              });
            }}
          >
            {t('builder.preview_sql')}
          </Button>
        </Tooltip>
      </Space>
    </Form>
  );
}
