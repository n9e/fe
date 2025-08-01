import React from 'react';
import { Button } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface Props {
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export default function EyeSwitch(props: Props) {
  const { value, onChange } = props;
  return (
    <Button
      icon={value ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      type='text'
      size='small'
      onClick={() => {
        onChange && onChange(!value);
      }}
    />
  );
}
