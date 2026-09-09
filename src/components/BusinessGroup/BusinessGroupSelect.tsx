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
      showSearch
      optionFilterProp='label'
      dropdownMatchSelectWidth={false}
      dropdownClassName='n9e-busi-group-select-dropdown'
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
