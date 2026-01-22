import React, { useEffect, useMemo, useState } from 'react';
import { Form, Row, Col, Space, Tooltip, Segmented, Button, Select, InputNumber } from 'antd';
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
import DatabaseSelect from '../DatabaseSelect';
import TableSelect from '../TableSelect';
import DateFieldSelect from '../DateFieldSelect';

import Filters from './Filters';
import Aggregates from './Aggregates';
import OrderBy from './OrderBy';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  explorerForm: FormInstance;
  datasourceValue: number;
  visible: boolean;
  onExecute: (values) => void;
  onPreviewSQL: (values) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  const { eleRef, explorerForm, datasourceValue, visible, onExecute, onPreviewSQL } = props;

  const [form] = Form.useForm();
  const database = Form.useWatch(['database'], form);
  const table = Form.useWatch(['table'], form);
  const time_field = Form.useWatch(['time_field'], form);

  const [buildSqlFailed, setBuildSqlFailed] = useState(false);

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
      from: moment(parsedRange.start).unix(),
      to: moment(parsedRange.end).unix(),
      limit: 10,
    };
  }, [datasourceValue, database, table, time_field]);

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
    <Form form={form}>
      <Row gutter={SIZE} align='middle' className='mb-2'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.database_table.label')}</div>
        </Col>
        <Col flex='none'>
          <InputGroupWithFormItem label={t('query.database')} size='small'>
            <Form.Item name='database' noStyle>
              <DatabaseSelect
                getPopupContainer={() => {
                  return eleRef?.current!;
                }}
                className='w-[160px]'
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
        </Col>
        <Col flex='none'>
          <Form.Item name='table' noStyle>
            <InputGroupWithFormItem label={t('query.table')} size='small'>
              <TableSelect
                getPopupContainer={() => {
                  return eleRef?.current!;
                }}
                className='w-[160px]'
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
            </InputGroupWithFormItem>
          </Form.Item>
        </Col>
        <Col flex='none'>
          <InputGroupWithFormItem label={t('query.time_field')} size='small'>
            <Form.Item name='time_field' noStyle>
              <DateFieldSelect
                getPopupContainer={() => {
                  return eleRef?.current!;
                }}
                className='w-[160px]'
                dateFields={_.filter(indexData, (item) => {
                  return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
                })}
              />
            </Form.Item>
          </InputGroupWithFormItem>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-2'>
        <Col flex='none'>
          <div className='w-[50px]'>
            <Tooltip title={t('builder.filters.label_tip')}>
              <Space size={SIZE / 2}>
                <span>{t('builder.filters.label')}</span>
                <InfoCircleOutlined />
              </Space>
            </Tooltip>
          </div>
        </Col>
        <Col flex='auto'>
          <Form.Item name='filters' noStyle>
            <Filters eleRef={eleRef} size='small' indexData={validIndexData} fieldSampleParams={fieldSampleParams} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-2'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.aggregates.label')}</div>
        </Col>
        <Col flex='auto'>
          <Form.Item name='aggregates' noStyle>
            <Aggregates eleRef={eleRef} indexData={validIndexData} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-2'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.display_label')}</div>
        </Col>
        <Col flex='auto'>
          <Space size={SIZE}>
            <Form.Item name='mode' noStyle>
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
              <Form.Item name='limit' noStyle initialValue={100}>
                <InputNumber size='small' className='w-[80px]' min={1} />
              </Form.Item>
            </InputGroupWithFormItem>
          </Space>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-4'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.order_by.label')}</div>
        </Col>
        <Col flex='auto'>
          <Form.Item name='order_by' noStyle>
            <OrderBy eleRef={eleRef} indexData={validIndexData} />
          </Form.Item>
        </Col>
      </Row>
      <Space size={SIZE}>
        <Tooltip title={t('builder.btn_tip')}>
          <Button
            size='small'
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => {
              form.validateFields().then((values) => {
                const range = explorerForm.getFieldValue(['query', 'range']);
                if (!range) return;
                const parsedRange = parseRange(range);
                buildSql({
                  cate: DatasourceCateEnum.doris,
                  datasource_id: datasourceValue,
                  query: [
                    {
                      database: values.database,
                      table: values.table,
                      time_field: values.time_field,
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
                })
                  .then((res) => {
                    setBuildSqlFailed(false);
                    onExecute(res);
                  })
                  .catch(() => {
                    setBuildSqlFailed(true);
                  });
              });
            }}
          >
            {t('builder.excute')}
          </Button>
        </Tooltip>
        <Tooltip title={t('builder.btn_tip')}>
          <Button
            size='small'
            onClick={() => {
              form.validateFields().then((values) => {
                const range = explorerForm.getFieldValue(['query', 'range']);
                if (!range) return;
                const parsedRange = parseRange(range);
                buildSql({
                  cate: DatasourceCateEnum.doris,
                  datasource_id: datasourceValue,
                  query: [
                    {
                      database: values.database,
                      table: values.table,
                      time_field: values.time_field,
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
                })
                  .then((res) => {
                    setBuildSqlFailed(false);
                    onPreviewSQL(res);
                  })
                  .catch(() => {
                    setBuildSqlFailed(true);
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
