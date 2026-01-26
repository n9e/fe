import React, { useState, useContext } from 'react';
import { Popover, Row, Col, Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SIZE } from '@/utils/constant';

import { OrderByConfig, Field, AggregateConfig } from '../../../types';
import { NAME_SPACE } from '../../../../constants';
import CommonStateContext from '../commonStateContext';
import getOrderByList from '../utils/getOrderByList';

interface Props {
  indexData: Field[];
  aggregates: AggregateConfig[];
  group_by: string[];
  children: React.ReactNode;

  data?: OrderByConfig;
  onChange?: (data: OrderByConfig) => void;
  onAdd?: (data: OrderByConfig) => void;
}

export default function ConfigPopover(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { ignoreNextOutsideClick } = useContext(CommonStateContext);
  const { indexData, aggregates, group_by, children, data, onChange, onAdd } = props;

  const [visible, setVisible] = useState<boolean>();

  const [form] = Form.useForm();

  return (
    <Popover
      overlayClassName='doris-query-builder-popup'
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
                  label={t('builder.order_by.field')}
                  name='field'
                  rules={[
                    {
                      required: true,
                      message: t('builder.order_by.field_placeholder'),
                    },
                  ]}
                >
                  <Select
                    dropdownClassName='doris-query-builder-popup'
                    placeholder={t('builder.order_by.field_placeholder')}
                    options={_.map(getOrderByList(indexData, aggregates, group_by), (item) => {
                      return {
                        label: item,
                        value: item,
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
                  label={t('builder.order_by.direction')}
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
                    dropdownClassName='doris-query-builder-popup'
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
