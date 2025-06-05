import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

interface Props {
  value?: string;
  onChange?: (value?: string) => void;
}

export default function LegendInput({ value, onChange }: Props) {
  const [curValue, setCurValue] = useState(value);

  useEffect(() => {
    if (curValue !== value) {
      setCurValue(value);
    }
  }, [value]);

  return (
    <Input
      value={curValue}
      onChange={(e) => {
        setCurValue(e.target.value);
      }}
      onBlur={() => {
        onChange && onChange(curValue);
      }}
      onPressEnter={() => {
        onChange && onChange(curValue);
      }}
    />
  );
}
