import React from 'react';
import { Select } from 'antd';
import _ from 'lodash';

import { Field } from '../../services';

interface Props {
  dateFields: Field[];
  value?: string;
  onChange?: (value: string) => void;
}

export default function DateFieldSelect(props: Props) {
  const { dateFields, value, onChange } = props;

  return (
    <Select
      className='min-w-[100px]'
      showSearch
      optionFilterProp='label'
      options={_.map(dateFields, (item) => {
        return { label: item.field, value: item.field };
      })}
      value={value}
      onChange={onChange}
    />
  );
}
