import React from 'react';
import _ from 'lodash';
import { Select, SelectProps } from 'antd';
import { buildUnitOptions } from './utils';
import CustomUnitPicker from './CustomUnitPicker';
import './locale';

export { CustomUnitPicker };

interface Props {
  hideOptionLabel?: boolean;
  hideSIOption?: boolean;
  ajustUnitOptions?: (units: any) => any;
}

export default function index(props: SelectProps & Props) {
  const { hideOptionLabel, hideSIOption, ajustUnitOptions } = props;
  const resetProps = _.omit(props, ['showOptionLabel', 'hideSIOption', 'ajustUnitOptions']);
  return <Select showSearch optionFilterProp='cleanLabel' {...resetProps} options={buildUnitOptions(hideOptionLabel, hideSIOption, ajustUnitOptions)} />;
}
