import React from 'react';
import { Form, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Panel } from '../Collapse';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function index({ fields, remove, field }) {
  const targets = Form.useWatch('targets');
  const target = targets?.[field.name] || {};
  const name = target?.refId || alphabet[field.name];

  return (
    <Panel
      header={name}
      key={field.key}
      extra={
        <div>
          {fields.length > 1 ? (
            <DeleteOutlined
              style={{ marginLeft: 10 }}
              onClick={() => {
                remove(field.name);
              }}
            />
          ) : null}
        </div>
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
        <Input.TextArea autoSize />
      </Form.Item>
    </Panel>
  );
}
