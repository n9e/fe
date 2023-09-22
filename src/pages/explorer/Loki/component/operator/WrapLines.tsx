import React, { useState } from 'react';
import { Switch } from 'antd';

export function WrapLines(props: { onChange: (v: boolean) => void }) {
  const [value, setValue] = useState<boolean>(true);

  const handleChange = (v) => {
    setValue(v);
    props.onChange(v);
  };

  return (
    <>
      <span>Wrap Lines </span>
      <Switch defaultChecked checked={value} />
    </>
  );
}
