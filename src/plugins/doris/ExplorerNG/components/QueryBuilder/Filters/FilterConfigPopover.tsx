import React, { useContext, useMemo, useState } from 'react';
import { Popover, Row, Col, Form, Select, Alert, Checkbox, Button, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useRequest } from 'ahooks';

import { SIZE } from '@/utils/constant';

import { FilterConfig, Field, FieldSampleParams } from '../../../types';
import { NAME_SPACE } from '../../../../constants';
import { getFiledSample } from '../../../../services';

import { LIKE_OPERATORS } from '../constants';
import getDefaultOperatorByType from '../utils/getDefaultOperatorByType';
import getOperatorsByTypeIndex from '../utils/getOperatorsByTypeIndex';
import CommonStateContext from '../commonStateContext';
import { getEnabledFilters } from '../../../utils/filters';

import FilterConfigValue from './FilterConfigValue';

interface Props {
  indexData: Field[];
  fieldSampleParams: FieldSampleParams;
  children: React.ReactNode;

  data?: FilterConfig;
  // 当前筛选器在 filters 列表中的索引（用于级联：只使用前面的 filters 作为上下文）
  index?: number;
  onChange?: (data: FilterConfig) => void;
  onAdd?: (data: FilterConfig) => void;
}

export default function ConfigPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { ignoreNextOutsideClick } = useContext(CommonStateContext);
  const { indexData, fieldSampleParams, children, data, onChange, onAdd } = props;

  const [visible, setVisible] = useState<boolean>();

  const [form] = Form.useForm();
  const field = Form.useWatch('field', form);
  const operator = Form.useWatch('operator', form);

  const fieldData = useMemo(() => {
    return _.find(indexData, (item) => item.field === field);
  }, [indexData, field]);

  const operators = useMemo(() => {
    const filed = _.find(indexData, (item) => item.field === field);
    return getOperatorsByTypeIndex(filed) ?? [];
  }, [indexData, field]);

  const { data: fieldSample } = useRequest(
    () => {
      const sourceFilters = fieldSampleParams?.filters || [];
      let filtersToUse = sourceFilters;
      if (typeof props.index === 'number') {
        // 级联：只使用当前位置之前的 filters 作为上下文（exclude current and later ones）
        filtersToUse = _.slice(sourceFilters, 0, props.index);
      }

      return getFiledSample({
        ...fieldSampleParams,
        filters: getEnabledFilters(filtersToUse),
        field,
      });
    },
    {
      refreshDeps: [fieldSampleParams, field, visible],
      ready: !!visible && !!field && !!fieldSampleParams.database && !!fieldSampleParams.table,
    },
  );

  const close = () => {
    ignoreNextOutsideClick?.();
    setVisible(false);
    form.resetFields();
  };
  const confirm = (values: FilterConfig) => {
    if (LIKE_OPERATORS.includes(values.operator!) && typeof values.value === 'string' && values.value && !values.value.startsWith('%') && !values.value.endsWith('%')) {
      values.value = `%${values.value}%`;
    }
    close();
    if (data) onChange?.(values);
    else onAdd?.(values);
  };

  return (
    <Popover
      overlayClassName='doris-query-builder-popup'
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        if (!v) return close();
        ignoreNextOutsideClick?.();
        form.resetFields();
        form.setFieldsValue(data ? _.cloneDeep({ field: data.field, operator: data.operator, value: data.value, disabled: data.disabled || false }) : { disabled: false });
        setVisible(true);
      }}
      content={
        <div className='w-[400px]'>
          <Form form={form} layout='vertical' onFinish={confirm}>
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
                    dropdownClassName='doris-query-builder-popup'
                    placeholder={t('builder.filters.field_placeholder')}
                    options={_.map(indexData, (item) => {
                      return {
                        label: item.field,
                        value: item.field,
                      };
                    })}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                    onChange={(value) => {
                      const filed = _.find(indexData, (item) => item.field === value);

                      const fieldType = filed?.normalized_type;
                      const defaultOperator = getDefaultOperatorByType(fieldType);
                      form.setFieldsValue({
                        operator: defaultOperator,
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
                    dropdownClassName='doris-query-builder-popup'
                    options={_.map(operators, (operator) => ({
                      label: operator,
                      value: operator,
                    }))}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                    onChange={() => {
                      form.setFieldsValue({
                        value: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              {_.includes(LIKE_OPERATORS, operator) && fieldData?.index?.index_type !== 'NGRAM_BF' && (
                <Col span={24}>
                  <Alert type='info' showIcon message={t('builder.filters.tip_1')} className='mb-4' />
                </Col>
              )}
              <FilterConfigValue operator={operator} fieldSample={fieldSample} />
              <Col span={24}>
                <div className='flex items-center justify-between gap-4'>
                  <Form.Item name='disabled' valuePropName='checked' initialValue={false} className='mb-0'>
                    <Checkbox aria-label={t('builder.filters.disabled')}>
                      <span className='inline-flex items-center gap-1 align-middle'>
                        <span>{t('builder.filters.disabled')}</span>
                        <Tooltip title={t('log_explorer:filter_editor.disabled_tip')}>
                          <QuestionCircleOutlined
                            tabIndex={0}
                            aria-label={t('log_explorer:filter_editor.disabled_tip')}
                            className='text-hint cursor-help'
                            style={{ fontSize: 12 }}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                          />
                        </Tooltip>
                      </span>
                    </Checkbox>
                  </Form.Item>
                  <Space size={4}>
                    <Button type='text' size='small' onClick={close}>
                      {t('log_explorer:filter_editor.cancel')}
                    </Button>
                    <Button type='link' size='small' onClick={() => form.submit()}>
                      {t('log_explorer:filter_editor.confirm')}
                    </Button>
                  </Space>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      }
    >
      <div>{children}</div>
    </Popover>
  );
}
