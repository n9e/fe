import React from 'react';
import { Form, Input, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import HideButton from '@/pages/dashboard/Components/HideButton';
import LegendInput from '@/pages/dashboard/Components/LegendInput';
import { Panel } from '../Collapse';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function index({ fields, remove, field }) {
  const { t } = useTranslation('dashboard');
  const targets = Form.useWatch('targets');
  const target = targets?.[field.name] || {};
  const name = target?.refId || alphabet[field.name];

  return (
    <Panel
      header={name}
      key={field.key}
      extra={
        <Space>
          <Form.Item noStyle {...field} name={[field.name, 'hide']}>
            <HideButton />
          </Form.Item>
          {fields.length > 1 ? (
            <DeleteOutlined
              onClick={() => {
                remove(field.name);
              }}
            />
          ) : null}
        </Space>
      }
    >
      <Form.Item
        label='Expression'
        {...field}
        name={[field.name, 'expr']}
        rules={[
          {
            required: true,
          },
        ]}
        style={{ flex: 1 }}
      >
        <Input.TextArea autoSize placeholder={t('query.expression_placeholder')} />
      </Form.Item>
      <Form.Item
        label='Legend'
        {...field}
        name={[field.name, 'legend']}
        tooltip={{
          getPopupContainer: () => document.body,
          title: t('query.legendTip2', {
            interpolation: { skipOnVariables: true },
          }),
        }}
      >
        <LegendInput />
      </Form.Item>
    </Panel>
  );
}
