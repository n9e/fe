import React, { useMemo } from 'react';
import { Form, Space, Tooltip, Segmented, Select, InputNumber } from 'antd';
import { FormInstance } from 'antd/es/form';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import _ from 'lodash';

import { SIZE, DatasourceCateEnum } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { Field, FieldSampleParams } from '../../types';
import { NAME_SPACE } from '../../../constants';
import getMaxLabelWidth from '../QueryBuilder/utils/getMaxLabelWidth';
import CommonStateContext from './commonStateContext';
import { defaultBuilderValues, DorisBuilderValues } from '../../useQueryWorkspace';

import Filters from './Filters';
import Aggregates from './Aggregates';
import OrderBy from './OrderBy';

interface Props {
  explorerForm: FormInstance;
  form: FormInstance<DorisBuilderValues>;
  datasourceValue?: number;
  database?: string;
  table?: string;
  time_field?: string;
  indexData: Field[];
  onChange: () => void;
}

const inlineBuilderContext = { ignoreNextOutsideClick: () => {} };

export default function QueryBuilder(props: Props) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { explorerForm, form, datasourceValue, database, table, time_field, indexData, onChange } = props;
  const range = Form.useWatch(['query', 'range'], explorerForm);
  const filters = Form.useWatch(['filters'], form);
  const aggregates = Form.useWatch(['aggregates'], form);
  const group_by = Form.useWatch(['group_by'], form);

  const fieldSampleParams = useMemo(() => {
    if (!datasourceValue || !database || !table || !time_field || !range) return {} as FieldSampleParams;
    const parsedRange = parseRange(range);
    return {
      cate: DatasourceCateEnum.doris,
      datasource_id: datasourceValue,
      database,
      table,
      time_field,
      filters,
      from: moment(parsedRange.start).valueOf(),
      to: moment(parsedRange.end).valueOf(),
      limit: 100,
    };
  }, [datasourceValue, database, table, time_field, JSON.stringify(filters), JSON.stringify(range)]);

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

  return (
    <CommonStateContext.Provider value={inlineBuilderContext}>
      <Form form={form} component='div' layout='vertical' initialValues={defaultBuilderValues} onValuesChange={onChange}>
        <div className='w-full table border-separate border-spacing-y-2'>
          <div
            className='table-column'
            style={{
              width: maxLabelWidth,
            }}
          />
          <div className='table-column' />
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center whitespace-nowrap'>
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
              <div className='h-[24px] flex items-center whitespace-nowrap'>{t('builder.aggregates.label')}</div>
            </div>
            <div className='table-cell'>
              <Form.Item name='aggregates' noStyle>
                <Aggregates indexData={validIndexData} />
              </Form.Item>
            </div>
          </div>
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center whitespace-nowrap'>{t('builder.display_label')}</div>
            </div>
            <div className='table-cell'>
              <Space size={SIZE} wrap>
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
                      className='min-w-[140px] max-w-full [&_.ant-select-selection-item]:h-[14.8px] [&_.ant-select-selection-item]:my-0'
                      dropdownClassName='doris-query-builder-popup'
                      options={_.map(indexData, (item) => {
                        return { label: item.field, value: item.field };
                      })}
                      mode='multiple'
                      placeholder={t('builder.filters.field_placeholder')}
                      showSearch
                      optionFilterProp='label'
                      dropdownMatchSelectWidth={false}
                    />
                  </Form.Item>
                </InputGroupWithFormItem>
                <InputGroupWithFormItem size='small' label={t('builder.limit')}>
                  <Form.Item name='limit' noStyle>
                    <InputNumber size='small' className='w-[80px]' min={1} max={10000000} placeholder={t('log_explorer:query_workspace.unlimited')} />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Space>
            </div>
          </div>
          <div className='table-row mb-4'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center whitespace-nowrap'>{t('builder.order_by.label')}</div>
            </div>
            <div className='table-cell'>
              <Form.Item name='order_by' noStyle>
                <OrderBy indexData={validIndexData} aggregates={aggregates} group_by={group_by} />
              </Form.Item>
            </div>
          </div>
        </div>
      </Form>
    </CommonStateContext.Provider>
  );
}
