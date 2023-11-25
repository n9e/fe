import React, { useContext } from 'react';
import { Select } from 'antd';
import _ from 'lodash';

interface Props {
  data: {
    id: number;
    name: string;
  }[];
  value: number;
  onChange: (value: number) => void;
}

export default function BusinessGroupSelect(props: Props) {
  return (
    <Select
      options={_.map(props.data, (item) => {
        return {
          label: item.name,
          value: item.id,
        };
      })}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
