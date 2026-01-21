import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import { OutlinedSelect } from '@/components/OutlinedSelect';

import { NAME_SPACE } from '../../constants';
import { Field } from '../../services';

interface Props {
  dateFields: Field[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function DateFieldSelect(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { dateFields, value, onChange, disabled, className } = props;

  return (
    <OutlinedSelect
      label={t('query.time_field')}
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
