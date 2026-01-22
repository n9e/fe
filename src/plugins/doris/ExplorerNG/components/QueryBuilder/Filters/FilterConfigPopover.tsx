import React, { useContext, useMemo, useState } from 'react';
import { Popover, Row, Col, Form, Select, Alert } from 'antd';
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

import FilterConfigValue from './FilterConfigValue';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  indexData: Field[];
  fieldSampleParams: FieldSampleParams;
  children: React.ReactNode;

  data?: FilterConfig;
  onChange?: (data: FilterConfig) => void;
  onAdd?: (data: FilterConfig) => void;
}

export default function ConfigPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { ignoreNextOutsideClick } = useContext(CommonStateContext);
  const { eleRef, indexData, fieldSampleParams, children, data, onChange, onAdd } = props;

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
      return getFiledSample({
        ...fieldSampleParams,
        field,
      });
    },
    {
      refreshDeps: [fieldSampleParams, field, visible],
      ready: !!visible && !!field && !!fieldSampleParams.database && !!fieldSampleParams.table,
    },
  );

  return (
    <Popover
      getPopupContainer={() => {
        return eleRef?.current!;
      }}
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        ignoreNextOutsideClick?.();
        setVisible(v);
        // popover 关闭时，获取表单数据并传递给父组件
        if (v === false) {
          form.validateFields().then((values) => {
            // 如果是 LIKE 操作符，处理 value 值，添加 % 通配符
            if (_.includes(LIKE_OPERATORS, values.operator) && values.value && !_.startsWith(values.value, '%') && !_.endsWith(values.value, '%')) {
              values.value = `%${values.value}%`;
            }
            if (data) {
              onChange?.(values as FilterConfig);
            } else {
              form.resetFields(); // 新增筛选器时，重置表单
              onAdd?.(values as FilterConfig);
            }
          });
        } else if (v === true) {
          // popover 打开时，初始化表单数据
          if (data) {
            form.setFieldsValue({
              field: data?.field,
              operator: data?.operator,
              value: data?.value,
            });
          }
        }
      }}
      content={
        <div className='w-[400px]'>
          <Form form={form} layout='vertical'>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item
                  name='field'
                  rules={[
                    {
                      required: true,
                      message: t('builder.filters.field_placeholder'),
                    },
                  ]}
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
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
                  name='operator'
                  rules={[
                    {
                      required: true,
                      message: t('builder.filters.operator_placeholder'),
                    },
                  ]}
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
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
              <FilterConfigValue eleRef={eleRef} operator={operator} fieldSample={fieldSample} />
            </Row>
          </Form>
        </div>
      }
    >
      <div>{children}</div>
    </Popover>
  );
}
