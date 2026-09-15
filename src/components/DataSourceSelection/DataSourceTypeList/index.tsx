import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import type { DataSourceTypeListProps } from '../types';

export default function DataSourceTypeList(props: DataSourceTypeListProps) {
  const { types, value, disabled = false, showLabel = true, className, typeFilter, onChange } = props;
  const { t } = useTranslation('dataSourceSelection');
  const visibleTypes = typeFilter ? types.filter(typeFilter) : types;

  return (
    <div className={classNames('min-w-0 text-[var(--fc-text-2)]', className)}>
      {showLabel ? <div className='text-xs font-normal leading-[18px] text-[var(--fc-text-3)]'>{t('sourceType')}</div> : null}
      <div className={classNames('flex flex-wrap gap-2', { 'mt-2': showLabel })} role='radiogroup' aria-label={String(t('sourceType'))}>
        {visibleTypes.map((type) => (
          <button
            key={type.value}
            type='button'
            role='radio'
            aria-checked={type.value === value}
            disabled={disabled}
            className={classNames(
              'inline-flex h-9 max-w-[min(280px,100%)] cursor-pointer items-center gap-2 rounded-lg border border-[var(--fc-border-color)] bg-fc-100 px-2.5 py-1 text-[var(--fc-text-2)] transition-all hover:border-primary hover:bg-fc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-[var(--fc-text-5)] disabled:opacity-60',
              {
                'border-primary bg-fc-200': type.value === value,
              },
            )}
            onClick={() => {
              if (!disabled && type.value !== value) onChange(type.value);
            }}
          >
            <span className='inline-flex h-5 w-5 flex-none items-center justify-center'>{type.icon}</span>
            <span className='min-w-0 truncate whitespace-nowrap'>{type.label}</span>
            {type.value === value ? <CheckOutlined className='flex-none text-sm text-primary' /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
