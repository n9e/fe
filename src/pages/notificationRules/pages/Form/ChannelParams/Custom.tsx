import React from 'react';
import { Form, Input } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';

interface Props {
  field: FormListFieldData;
  customParams: {
    key: string;
    cname: string;
  }[];
}

export default function Custom(props: Props) {
  const { field, customParams } = props;

  return (
    <div>
      {_.map(customParams, (item) => {
        return (
          <div key={item.key}>
            <Form.Item {...field} label={item.cname} name={[field.name, 'params', item.key]} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>
        );
      })}
    </div>
  );
}
