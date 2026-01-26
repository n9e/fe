import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { Select } from 'antd';

import { Field } from '../../services';

interface Props {
  dateFields: Field[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

export default function DateFieldSelect(props: Props) {
  const { dateFields, value, onChange, disabled, className, dropdownClassName } = props;

  return (
    <Select
      size='small'
      className={classNames('min-w-[100px]', className)}
      dropdownClassName={dropdownClassName}
      showSearch
      optionFilterProp='label'
      options={_.map(dateFields, (item) => {
        return { label: item.field, value: item.field };
      })}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
