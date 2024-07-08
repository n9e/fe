import React from 'react';
import _ from 'lodash';
import { SelectProps, AutoComplete } from 'antd';
import { buildUnitOptions } from './utils';
import './locale';

interface Props {
  hideOptionLabel?: boolean;
  hideSIOption?: boolean;
  ajustUnitOptions?: (units: any) => any;
}

export default function index(props: SelectProps & Props) {
  const { hideOptionLabel, hideSIOption, ajustUnitOptions } = props;
  const resetProps = _.omit(props, ['showOptionLabel', 'hideSIOption', 'ajustUnitOptions']);
  return (
    <AutoComplete
      filterOption={(inputValue, option) => {
        return _.includes(_.lowerCase(option?.cleanLabel), _.lowerCase(inputValue));
      }}
      {...resetProps}
      options={buildUnitOptions(hideOptionLabel, hideSIOption, ajustUnitOptions)}
    />
  );
}
