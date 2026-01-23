import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Select } from 'antd';

import { NAME_SPACE } from '../../constants';
import { Field } from '../../services';

interface Props {
  dateFields: Field[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  getPopupContainer?: () => HTMLElement;
}

export default function DateFieldSelect(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { dateFields, value, onChange, disabled, className, getPopupContainer } = props;

  return (
    <Select
      size='small'
      getPopupContainer={getPopupContainer}
      className={classNames('min-w-[100px]', className)}
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
