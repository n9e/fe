import React from 'react';
import { Form, Input } from 'antd';
import Collapse, { Panel } from '../Components/Collapse';

export default function index() {
  return (
    <Panel
      header={
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            return getFieldValue([...prefixName, 'refId']) || alphabet[index];
          }}
        </Form.Item>
      }
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
