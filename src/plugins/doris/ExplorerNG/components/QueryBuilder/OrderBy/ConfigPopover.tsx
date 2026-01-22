import React, { useState } from 'react';
import { Popover, Row, Col, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { OrderByConfig, Field } from '../../../types';
import { NAME_SPACE } from '../../../../constants';

interface Props {
  eleRef: React.RefObject<HTMLDivElement>;
  indexData: Field[];
  children: React.ReactNode;

  data?: OrderByConfig;
  onChange?: (data: OrderByConfig) => void;
  onAdd?: (data: OrderByConfig) => void;
}

export default function ConfigPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
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
        setVisible(v);
        // popover 关闭时，获取表单数据并传递给父组件
        if (v === false) {
          form.validateFields().then((values) => {
            if (data) {
              onChange?.(values as OrderByConfig);
            } else {
              form.resetFields(); // 新增筛选器时，重置表单
              onAdd?.(values as OrderByConfig);
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
              <Col span={16}>
                <Form.Item
                  name='field'
                  rules={[
                    {
                      required: true,
                      message: t('builder.order_by.field_placeholder'),
                    },
                  ]}
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
                    placeholder={t('builder.order_by.field_placeholder')}
                    options={_.map(indexData, (item) => {
                      return {
                        label: item.field,
                        value: item.field,
                      };
                    })}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name='direction'
                  rules={[
                    {
                      required: true,
                      message: t('builder.order_by.direction_placeholder'),
                    },
                  ]}
                  initialValue='desc'
                >
                  <Select
                    getPopupContainer={() => {
                      return eleRef?.current!;
                    }}
                    placeholder={t('builder.order_by.direction_placeholder')}
                    options={[
                      { label: t('builder.order_by.asc'), value: 'asc' },
                      { label: t('builder.order_by.desc'), value: 'desc' },
                    ]}
                    showSearch
                    optionFilterProp='label'
                    dropdownMatchSelectWidth={false}
                  />
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
