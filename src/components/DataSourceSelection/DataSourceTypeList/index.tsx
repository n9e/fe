import React, { useContext } from 'react';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import type { DataSourceTypeListProps } from '../types';

export default function DataSourceTypeList(props: DataSourceTypeListProps) {
  const { types, value, disabled: customDisabled, showLabel = true, className, typeFilter, onChange } = props;
  // 与当前 AntD 4.21 一致：组件或 Form / ConfigProvider 任一禁用时均不可选择。
  const contextDisabled = useContext(DisabledContext);
  const disabled = customDisabled || contextDisabled;
  const { t } = useTranslation('dataSourceSelection');
  const visibleTypes = typeFilter ? types.filter(typeFilter) : types;

  return (
    <div className={classNames('min-w-0 text-[var(--fc-text-2)]', className)}>
      {showLabel ? <div className='font-normal leading-[18px] text-[var(--fc-text-3)]'>{t('sourceType')}</div> : null}
      <div className={classNames('flex flex-wrap gap-2', { 'mt-2': showLabel })} role='radiogroup' aria-label={String(t('sourceType'))}>
        {visibleTypes.map((type) => (
          <button
            key={type.value}
            type='button'
            role='radio'
            aria-checked={type.value === value}
            disabled={disabled}
            className={classNames(
              'inline-flex h-9 max-w-[min(280px,100%)] cursor-pointer items-center gap-2 rounded-lg border border-[var(--fc-border-color)] bg-fc-100 px-2.5 py-1 text-[var(--fc-text-2)] transition-all enabled:hover:border-primary enabled:hover:bg-fc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:border-[var(--fc-antd-border-color)] disabled:text-[var(--fc-disabled-color)]',
              {
                'border-primary bg-fc-200 disabled:bg-[var(--fc-disabled-checked-bg)]': type.value === value,
                'disabled:bg-[var(--fc-disabled-bg)]': type.value !== value,
              },
            )}
            onClick={() => {
              if (!disabled && type.value !== value) onChange(type.value);
            }}
          >
            <span className='inline-flex h-5 w-5 flex-none items-center justify-center [&_img]:h-[18px] [&_img]:w-[18px] [&_img]:object-contain [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:object-contain'>
              {type.icon}
            </span>
            <span className='min-w-0 truncate whitespace-nowrap'>{type.label}</span>
            {type.value === value ? <CheckOutlined className={classNames('flex-none text-sm', disabled ? 'text-inherit' : 'text-primary')} /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
