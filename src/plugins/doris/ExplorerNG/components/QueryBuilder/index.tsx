import React, { useEffect, useMemo } from 'react';
import { Form, Row, Col, Space, Tooltip, Segmented, Button } from 'antd';
import { InfoCircleOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { SIZE, DatasourceCateEnum } from '@/utils/constant';
import { parseRange, IRawTimeRange } from '@/components/TimeRangePicker';
import { OutlinedSelect } from '@/components/OutlinedSelect';
import OutlinedInputNumber from '@/components/OutlinedInputNumber';

import { Field, FieldSampleParams } from '../../types';
import { NAME_SPACE, DATE_TYPE_LIST } from '../../../constants';
import { getDorisIndex } from '../../../services';
import DatabaseSelect from '../DatabaseSelect';
import TableSelect from '../TableSelect';
import DateFieldSelect from '../DateFieldSelect';

import Filters from './Filters';
import Aggregates from './Aggregates';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  datasourceValue: number;
  range: IRawTimeRange;
  visible: boolean;
  defaultValues: {
    database?: string;
    table?: string;
    time_field?: string;
  };
  onExecute: (values) => void;
  onPreviewSQL: (values) => void;
}

export default function index(props: Props) {
  const { t } = useTranslation(NAME_SPACE);

  const { eleRef, datasourceValue, range, visible, defaultValues, onExecute, onPreviewSQL } = props;

  const [form] = Form.useForm();
  const database = Form.useWatch(['database'], form);
  const table = Form.useWatch(['table'], form);
  const time_field = Form.useWatch(['time_field'], form);
  const fieldSampleParams = useMemo(() => {
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
  }, [datasourceValue, database, table, time_field, JSON.stringify(range)]);

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
      const database = form.getFieldValue('database');
      const table = form.getFieldValue('table');
      const time_field = form.getFieldValue('time_field');
      form.setFieldsValue({
        database: database || defaultValues.database || undefined,
        table: table || defaultValues.table || undefined,
        time_field: time_field || defaultValues.time_field || undefined,
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
          <Form.Item name='database' noStyle>
            <DatabaseSelect className='w-[160px]' datasourceValue={datasourceValue} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item name='table' noStyle>
            <TableSelect className='w-[160px]' datasourceValue={datasourceValue} database={database} />
          </Form.Item>
        </Col>
        <Col flex='none'>
          <Form.Item name='time_field' noStyle>
            <DateFieldSelect
              className='w-[160px]'
              dateFields={_.filter(indexData, (item) => {
                return _.includes(DATE_TYPE_LIST, item.type.toLowerCase());
              })}
            />
          </Form.Item>
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
            <Filters eleRef={eleRef} indexData={validIndexData} fieldSampleParams={fieldSampleParams} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-2'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.aggregates.label')}</div>
        </Col>
        <Col flex='auto'>
          <Form.Item name='aggregates' noStyle>
            <Aggregates indexData={validIndexData} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={SIZE} align='middle' className='mb-4'>
        <Col flex='none'>
          <div className='w-[50px]'>{t('builder.display_label')}</div>
        </Col>
        <Col flex='auto'>
          <Space size={SIZE}>
            <Form.Item name='mode' noStyle>
              <Segmented
                options={[
                  { label: t('builder.mode.table'), value: 'table' },
                  { label: t('builder.mode.timeseries'), value: 'timeseries' },
                ]}
              />
            </Form.Item>
            <Form.Item name='group_by' noStyle>
              <OutlinedSelect
                className='w-[160px]'
                label={t('builder.group_by')}
                options={_.map(indexData, (item) => {
                  return { label: item.field, value: item.field };
                })}
                mode='multiple'
                showSearch
                optionFilterProp='label'
                dropdownMatchSelectWidth={false}
              />
            </Form.Item>
            <Form.Item name={['order_by', 'field']} noStyle>
              <OutlinedSelect
                className='w-[160px]'
                label={t('builder.order_by.label')}
                options={_.map(indexData, (item) => {
                  return { label: item.field, value: item.field };
                })}
                showSearch
                optionFilterProp='label'
                dropdownMatchSelectWidth={false}
              />
            </Form.Item>
            <Form.Item name={['order_by', 'direction']} noStyle initialValue='desc'>
              <Segmented
                options={[
                  { label: t('builder.order_by.asc'), value: 'asc' },
                  { label: t('builder.order_by.desc'), value: 'desc' },
                ]}
              />
            </Form.Item>
            <Form.Item name='limit' noStyle initialValue={100}>
              <OutlinedInputNumber className='w-[80px]' label={t('builder.order_by.label')} min={1} />
            </Form.Item>
          </Space>
        </Col>
      </Row>
      <Space size={SIZE}>
        <Button
          icon={<CaretRightOutlined />}
          onClick={() => {
            form.validateFields().then((values) => {
              onExecute(values);
            });
          }}
        >
          {t('builder.excute')}
        </Button>
        <Button
          onClick={() => {
            form.validateFields().then((values) => {
              onExecute(values);
            });
          }}
        >
          {t('builder.preview_sql')}
        </Button>
      </Space>
    </Form>
  );
}
