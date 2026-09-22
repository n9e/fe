import React, { useContext } from 'react';
import DisabledContext from 'antd/es/config-provider/DisabledContext';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import type { DataSourceTypeListProps } from '../types';

import './style.less';

export default function DataSourceTypeList(props: DataSourceTypeListProps) {
  const { types, value, disabled: customDisabled, className, typeFilter, onChange } = props;
  // 与当前 AntD 4.21 一致：组件或 Form / ConfigProvider 任一禁用时均不可选择。
  const contextDisabled = useContext(DisabledContext);
  const disabled = customDisabled || contextDisabled;
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
