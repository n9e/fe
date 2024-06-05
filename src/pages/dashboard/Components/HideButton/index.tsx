import React from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

interface Props {
  value?: boolean;
  onChange?: (value?: boolean) => void;
}

export default function index(props: Props) {
  const { value, onChange } = props;

  if (value === true) {
    return (
      <EyeInvisibleOutlined
        onClick={() => {
          onChange && onChange(false);
        }}
      />
    );
  }
  return (
    <EyeOutlined
      onClick={() => {
        onChange && onChange(true);
      }}
    />
  );
}
