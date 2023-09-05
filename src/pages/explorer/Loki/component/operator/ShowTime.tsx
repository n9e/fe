import React, { useState } from 'react';
import { Switch } from 'antd';

export function ShowTime(props: { onChange: (v: boolean) => void }) {
  const [value, setValue] = useState<boolean>(true);

  const handleChange = (v) => {
    setValue(v);
    props.onChange(v);
  };

  return (
    <>
      <span>Show Time </span>
      <Switch defaultChecked checked={value} onChange={handleChange} />
    </>
  );
}
