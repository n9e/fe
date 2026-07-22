import React from 'react';
import { Form } from 'antd';

import './BuilderConfigRequiredItem.less';

interface Props {
  name: (string | number)[];
  message: string;
  field?: any;
}

export default function BuilderConfigRequiredItem(props: Props) {
  const { name, message, field } = props;

  return (
    <Form.Item
      {...field}
      name={name}
      rules={[
        {
          validator: (_, value) => {
            if (value?.database && value?.table && value?.time_field) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(message));
          },
        },
      ]}
      className='doris-builder-config-required-item'
      getValueProps={() => ({})}
    >
      <input type='hidden' />
    </Form.Item>
  );
}
