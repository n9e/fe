import React, { useMemo, useState } from 'react';
import { AutoComplete, Button, Checkbox, Col, Form, Popover, Row, Select, Space, Tooltip } from 'antd';
import { CloseOutlined, InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';

import { parseRange } from '@/components/TimeRangePicker';
import { SIZE } from '@/utils/constant';

import { NAME_SPACE } from '../../../constants';
import { getESVersion, getFieldTopTerms } from '../../../services';
import dslBuilder from '../../../utils/dslBuilder';
import { Field, Filter } from '../../types';
import { describeFilter, ESFilterBuilderOperator, toBuilderValues, toQueryFilter } from './utils';

const FIELD_SAMPLE_SIZE = 100;

interface Props {
  datasourceValue?: number;
  indexData: Field[];
  filters?: Filter[];
  onChange: (filters: Filter[]) => void;
  executeQuery: () => void;
}

interface ConfigPopoverProps extends Props {
  children: React.ReactNode;
  data?: Filter;
  index?: number;
}

function FilterDescribe(props: { filter: Filter; onRemove: (e: React.MouseEvent<HTMLElement>) => void }) {
  const { filter, onRemove } = props;

  return (
    <div
      className={`border border-antd rounded-sm hover:bg-fc-150 min-h-[24px] wrap-break-word whitespace-normal cursor-pointer flex items-center justify-between ${
        filter.disabled ? 'opacity-50 bg-fc-100' : ''
      }`}
    >
      <div
        className={`h-full px-[7px] flex items-center ${filter.disabled ? 'line-through text-hint' : filter.operator === 'NOT' ? '' : 'text-hint'}`}
        style={{
          borderRight: '1px solid var(--fc-antd-border-color)',
          color: !filter.disabled && filter.operator === 'NOT' ? 'var(--fc-fill-error)' : undefined,
        }}
      >
        {describeFilter(filter)}
      </div>
      <Button className='p-0 min-h-[22px] bg-fc-150 hover:bg-fc-200' size='small' icon={<CloseOutlined />} type='text' onClick={onRemove} />
    </div>
  );
}

function getFieldForTermsAgg(field?: Field) {
  if (!field) return '';
  if (field.type === 'text') {
    if (field.field.endsWith('.keyword')) return field.field;
    return `${field.field}.keyword`;
  }
  return field.field;
}

function ConfigPopover(props: ConfigPopoverProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { datasourceValue, indexData, filters, onChange, executeQuery, children, data, index } = props;

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const queryForm = Form.useFormInstance();
  const queryValues = Form.useWatch('query', queryForm);
  const field = Form.useWatch('field', form);
  const operator = Form.useWatch('operator', form) as ESFilterBuilderOperator | undefined;

  const fieldData = useMemo(() => _.find(indexData, (item) => item.field === field), [indexData, field]);

  const { data: fieldSample = [] } = useRequest(
    async () => {
      if (!datasourceValue || !field || !queryValues?.index || !queryValues?.date_field || !queryValues?.range) return [];

      const range = parseRange(queryValues.range);
      const topNumber = FIELD_SAMPLE_SIZE;
      const version = await getESVersion(datasourceValue);
      const aggField = getFieldForTermsAgg(fieldData);
      const aggName = `top${topNumber}_${String(aggField).replace(/[^A-Za-z0-9_]/g, '_')}`;
      const sourceFilters = filters || [];
      const filtersToUse = typeof index === 'number' ? _.slice(sourceFilters, 0, index) : sourceFilters;
      const topN = await getFieldTopTerms(
        datasourceValue,
        dslBuilder({
          start: moment(range.start).valueOf(),
          end: moment(range.end).valueOf(),
          version,
          index: queryValues.index,
          date_field: queryValues.date_field,
          filters: filtersToUse,
          syntax: queryValues.syntax,
          query_string: queryValues.query,
          kuery: queryValues.query,
          termsAgg: {
            field: aggField,
            size: topNumber,
            name: aggName,
          },
        }),
        {
          aggName,
          field: aggField,
          size: topNumber,
        },
      );
      return _.map(topN, (item) => _.toString(item.label));
    },
    {
      refreshDeps: [
        datasourceValue,
        field,
        queryValues?.index,
        queryValues?.date_field,
        queryValues?.range,
        queryValues?.query,
        queryValues?.syntax,
        JSON.stringify(filters),
        visible,
      ],
      ready: visible && operator !== 'exists' && !!datasourceValue && !!field && !!fieldData,
    },
  );

  const save = (afterSave?: () => void) => {
    form
      .validateFields()
      .then((values) => {
        const nextFilter = toQueryFilter(values);
        const nextFilters = data && typeof index === 'number' ? _.map(filters || [], (item, i) => (i === index ? nextFilter : item)) : [...(filters || []), nextFilter];
        onChange(nextFilters);
        form.resetFields();
        executeQuery();
      })
      .catch(() => {})
      .finally(() => {
        afterSave?.();
      });
  };

  const saveAndClose = () => {
    save(() => {
      setVisible(false);
    });
  };

  const handleVisibleChange = (nextVisible: boolean) => {
    if (nextVisible) {
      form.setFieldsValue(data ? toBuilderValues(data) : { operator: '=', disabled: false });
      setVisible(true);
      return;
    }

    saveAndClose();
  };

  return (
    <Popover
      trigger='click'
      placement='bottomLeft'
      visible={visible}
      onVisibleChange={handleVisibleChange}
      content={
        <div className='w-[400px]'>
          <Form form={form} layout='vertical'>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item
                  label={t('builder.filters.field')}
                  name='field'
                  rules={[
                    {
                      required: true,
                      message: t('builder.filters.field_placeholder'),
                    },
                  ]}
                >
                  <Select
                    placeholder={t('builder.filters.field_placeholder')}
                    options={_.map(indexData, (item) => ({
                      label: item.field,
                      value: item.field,
                    }))}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                    onChange={() => {
                      form.setFieldsValue({
                        value: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('builder.filters.operator')}
                  name='operator'
                  rules={[
                    {
                      required: true,
                      message: t('builder.filters.operator_placeholder'),
                    },
                  ]}
                >
                  <Select
                    options={[
                      { label: '=', value: '=' },
                      { label: '!=', value: '!=' },
                      { label: 'exists', value: 'exists' },
                    ]}
                    dropdownMatchSelectWidth={false}
                    getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                    onChange={() => {
                      form.setFieldsValue({
                        value: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              {operator !== 'exists' && (
                <Col span={24}>
                  <Form.Item
                    label={t('builder.filters.value')}
                    name='value'
                    rules={[
                      {
                        required: true,
                        message: t('builder.filters.value_placeholder'),
                      },
                    ]}
                  >
                    <AutoComplete
                      allowClear
                      placeholder={t('builder.filters.value_placeholder')}
                      options={_.map(fieldSample, (item) => ({
                        label: item,
                        value: item,
                      }))}
                      showSearch
                      optionFilterProp='label'
                      filterOption={(inputValue, option) => _.includes(_.toLower(String(option?.label ?? '')), _.toLower(inputValue))}
                      dropdownMatchSelectWidth={false}
                      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
                    />
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Form.Item name='disabled' valuePropName='checked' initialValue={false} className='mb-0'>
                  <Checkbox>禁用</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      }
    >
      <span>{children}</span>
    </Popover>
  );
}

export default function FiltersBuilder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { filters, onChange, executeQuery } = props;

  return (
    <div className='flex items-start gap-2 mb-2'>
      <Tooltip title={t('builder.filters.label_tip')}>
        <Space className='h-[24px] flex-shrink-0 text-hint cursor-help'>
          <span>{t('builder.filters.label')}</span>
          <InfoCircleOutlined />
        </Space>
      </Tooltip>
      <Space size={[SIZE / 2, SIZE / 2]} wrap>
        {_.map(filters, (filter, index) => {
          return (
            <ConfigPopover {...props} key={`${filter.key}-${filter.operator}-${filter.value}-${index}`} data={filter} index={index}>
              <FilterDescribe
                filter={filter}
                onRemove={(e) => {
                  e.stopPropagation();
                  onChange(_.filter(filters, (_, i) => i !== index));
                  executeQuery();
                }}
              />
            </ConfigPopover>
          );
        })}

        <ConfigPopover {...props} index={filters ? filters.length : 0}>
          <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
            {t('builder.filters.add')}
          </Button>
        </ConfigPopover>
      </Space>
    </div>
  );
}
