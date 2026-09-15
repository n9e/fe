import React from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import type { DataSourceSelectOption as Option } from './types';

interface DataSourceSelectOptionProps<T> {
  option: Option<T>;
  icon?: React.ReactNode;
  typeLabel?: React.ReactNode;
  compact?: boolean;
}

export default function DataSourceSelectOption<T>(props: DataSourceSelectOptionProps<T>) {
  const { option, icon, typeLabel, compact = false } = props;
  const { t } = useTranslation('dataSourceSelectionSelect');
  const name = option.source?.name ?? `ID: ${String(option.value)}`;
  const status = option.deleted ? t('deletedSource') : option.source && option.disabled ? t('disabledSource') : '';
  const tooltip = option.deleted
    ? t('deletedHint', { id: option.value })
    : option.disabled && option.source
    ? `${name} · ${option.source.disabledReason || t('disabledHint')}`
    : name;

  return (
    <Tooltip title={tooltip} overlayClassName='data-source-selection-select-tooltip-box'>
      <span
        className={classNames('data-source-selection-select-option-box', {
          'is-disabled': option.disabled,
          'is-deleted': option.deleted,
          'is-compact': compact,
        })}
      >
        {icon ? <span className='data-source-selection-select-icon'>{icon}</span> : null}
        <span className='data-source-selection-select-name-wrapper'>
          <span className='data-source-selection-select-name'>{name}</span>
          {!compact && option.source?.extra != null ? <span className='data-source-selection-select-extra'>{option.source.extra}</span> : null}
        </span>
        {!compact && typeLabel ? (
          <span className='data-source-selection-select-meta'>
            <span className='data-source-selection-select-type'>{typeLabel}</span>
          </span>
        ) : null}
        {status ? <span className='data-source-selection-select-status'>{status}</span> : null}
      </span>
    </Tooltip>
  );
}
