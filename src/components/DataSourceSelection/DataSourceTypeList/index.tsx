import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import type { DataSourceTypeListProps } from '../types';

import './style.less';

export default function DataSourceTypeList(props: DataSourceTypeListProps) {
  const { types, value, disabled = false, className, typeFilter, onChange } = props;
  const { t } = useTranslation('dataSourceSelection');
  const visibleTypes = typeFilter ? types.filter(typeFilter) : types;

  return (
    <div className={classNames('data-source-type-list-box', className)}>
      <div className='data-source-picker-label'>{t('sourceType')}</div>
      <div className='data-source-picker-type-list' role='radiogroup' aria-label={String(t('sourceType'))}>
        {visibleTypes.map((type) => (
          <button
            key={type.value}
            type='button'
            role='radio'
            aria-checked={type.value === value}
            disabled={disabled}
            className={classNames('data-source-picker-type', { selected: type.value === value })}
            onClick={() => {
              if (!disabled && type.value !== value) onChange(type.value);
            }}
          >
            <span className='data-source-picker-icon data-source-picker-type-icon'>{type.icon}</span>
            <span className='data-source-picker-type-name'>{type.label}</span>
            {type.value === value ? <CheckOutlined className='data-source-picker-type-check' /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
