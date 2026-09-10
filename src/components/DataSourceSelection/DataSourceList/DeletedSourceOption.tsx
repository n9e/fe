import React from 'react';
import type { DataSourcePickerValue } from '../types';

interface DeletedSourceOptionProps {
  value: DataSourcePickerValue;
  fallbackIcon?: React.ReactNode;
  deletedLabel: string;
}

export default function DeletedSourceOption(props: DeletedSourceOptionProps) {
  const { value, fallbackIcon, deletedLabel } = props;

  return (
    <span className='data-source-picker-source-trigger'>
      <button type='button' role='radio' aria-checked aria-disabled disabled className='data-source-picker-source selected disabled deleted'>
        <span className='data-source-picker-icon data-source-picker-source-icon'>{fallbackIcon}</span>
        <span className='data-source-picker-source-name'>{`ID: ${String(value)}`}</span>
        <span className='data-source-picker-source-status deleted'>{deletedLabel}</span>
      </button>
    </span>
  );
}
