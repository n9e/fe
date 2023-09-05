import React, { useState } from 'react';
import { Switch } from 'antd';

export function PrettifyJson(props: { onChange: (v: boolean) => void }) {
  const [value, setValue] = useState<boolean>(false);

  const handleChange = (v) => {
    setValue(v);
    props.onChange(v);
  };

  return (
    <>
      <span>Prettify JSON </span>
      <Switch defaultChecked checked={value} onChange={handleChange} />
    </>
  );
}
