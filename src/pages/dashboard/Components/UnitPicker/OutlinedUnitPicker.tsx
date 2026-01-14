/**
 * 如只需要在 option 里显示单位名称，则设置 optionLabelProp='cleanLabel'
 */
import React from 'react';
import _ from 'lodash';
import { SelectProps } from 'antd';
import { useTranslation } from 'react-i18next';

import { OutlinedSelect } from '@/components/OutlinedSelect';

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
  const { t } = useTranslation('dashboard');
  const { hideOptionLabel, hideSIOption, ajustUnitOptions } = props;
  const resetProps = _.omit(props, ['showOptionLabel', 'hideSIOption', 'ajustUnitOptions']);

  return (
    <OutlinedSelect
      label={t('panel.standardOptions.unit')}
      showSearch
      optionFilterProp='cleanLabel'
      {...resetProps}
      options={buildUnitOptions(hideOptionLabel, hideSIOption, ajustUnitOptions)}
    />
  );
}
