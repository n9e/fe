import React, { useState, useContext } from 'react';
import { Popover, Row, Col, Form, Select, InputNumber, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { AggregateConfig, Field } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

import { AGGREGATE_FUNCTION_TYPE_MAP } from '../constants';
import CommonStateContext from '../commonStateContext';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  indexData: Field[];
  children: React.ReactNode;

  data?: AggregateConfig;
  onChange?: (data: AggregateConfig) => void;
  onAdd?: (data: AggregateConfig) => void;
}

export default function ParamsPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { ignoreNextOutsideClick } = useContext(CommonStateContext);
  const { eleRef, indexData, children, data, onChange, onAdd } = props;

  const [visible, setVisible] = useState<boolean>();

  const [form] = Form.useForm();
  const func = Form.useWatch('func', form);

  return (
    <Popover
      getPopupContainer={() => {
        return eleRef?.current!;
      }}
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        ignoreNextOutsideClick();
        setVisible(v);
        // popover 关闭时，获取表单数据并传递给父组件
        if (v === false) {
          form.validateFields().then((values) => {
            if (data) {
              onChange?.(values as AggregateConfig);
            } else {
              form.resetFields(); // 新增筛选器时，重置表单
              onAdd?.(values as AggregateConfig);
            }
          });
        } else if (v === true) {
          // popover 打开时，初始化表单数据
          if (data) {
            form.setFieldsValue(data);
          }
        }
      }}
      content={
        <div className='w-[400px]'>
          <Form form={form} layout='vertical'>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item
                  label={t('builder.aggregates.func')}
                  name='func'
                  rules={[
                    {
                      required: true,
                      message: t('builder.aggregates.func_placeholder'),
                    },
                  ]}
                  initialValue='COUNT'
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
                    placeholder={t('builder.aggregates.func_placeholder')}
                    options={_.map(_.keys(AGGREGATE_FUNCTION_TYPE_MAP), (item) => {
                      return {
                        label: item + ' ' + t(`builder.aggregates.options.${item}`),
                        value: item,
                      };
                    })}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                    onChange={(val) => {
                      const validTypes = AGGREGATE_FUNCTION_TYPE_MAP[val as keyof typeof AGGREGATE_FUNCTION_TYPE_MAP];
                      const currentField = form.getFieldValue('field');
                      const fieldItem = _.find(indexData, { field: currentField });
                      if (!currentField || !fieldItem || !_.includes(validTypes, fieldItem.normalized_type)) {
                        form.setFieldsValue({
                          field: undefined,
                          alias: undefined,
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t('builder.aggregates.field')}
                  name='field'
                  rules={[
                    {
                      required: true,
                      message: t('builder.aggregates.field_placeholder'),
                    },
                  ]}
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
                    placeholder={t('builder.aggregates.field_placeholder')}
                    options={_.map(
                      _.concat(
                        func === 'COUNT' ? [{ field: '*' } as any] : [],
                        _.filter(indexData, (item) => {
                          if (func) {
                            const validTypes = AGGREGATE_FUNCTION_TYPE_MAP[func as keyof typeof AGGREGATE_FUNCTION_TYPE_MAP];
                            return _.includes(validTypes, item.normalized_type);
                          }
                          return true;
                        }),
                      ),
                      (item) => {
                        return {
                          label: item.field,
                          value: item.field,
                        };
                      },
                    )}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                    onChange={() => {
                      form.setFieldsValue({
                        alias: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              {func === 'PERCENTILE' && (
                <>
                  <Col span={12}>
                    <Form.Item
                      label={t('builder.aggregates.percentile')}
                      name='percentile'
                      rules={[
                        {
                          required: true,
                          message: t('builder.aggregates.percentile_placeholder'),
                        },
                      ]}
                      initialValue={95}
                    >
                      <InputNumber className='w-full' placeholder={t('builder.aggregates.percentile_placeholder')} min={1} max={100} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t('builder.aggregates.precision')}
                      name='precision'
                      rules={[
                        {
                          required: true,
                          message: t('builder.aggregates.precision_placeholder'),
                        },
                      ]}
                      initialValue={2}
                    >
                      <InputNumber className='w-full' placeholder={t('builder.aggregates.precision_placeholder')} min={1} />
                    </Form.Item>
                  </Col>
                </>
              )}
              {func === 'EXIST_RATIO' && (
                <Col span={24}>
                  <Form.Item
                    label={t('builder.aggregates.precision')}
                    name='precision'
                    rules={[
                      {
                        required: true,
                        message: t('builder.aggregates.precision_placeholder'),
                      },
                    ]}
                    initialValue={2}
                  >
                    <InputNumber className='w-full' placeholder={t('builder.aggregates.precision_placeholder')} min={1} />
                  </Form.Item>
                </Col>
              )}
              {func === 'TOPN' && (
                <Col span={24}>
                  <Form.Item
                    label={t('builder.aggregates.n')}
                    name='n'
                    rules={[
                      {
                        required: true,
                        message: t('builder.aggregates.n_placeholder'),
                      },
                    ]}
                    initialValue={5}
                  >
                    <InputNumber className='w-full' placeholder={t('builder.aggregates.n_placeholder')} min={1} />
                  </Form.Item>
                </Col>
              )}
              <Col span={24}>
                <Form.Item label={t('builder.aggregates.alias')} name='alias'>
                  <Input placeholder={t('builder.aggregates.alias_placeholder')} />
                </Form.Item>
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
