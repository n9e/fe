import React, { useRef, useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import { Tooltip } from 'antd';
import type { DataSourcePickerSource } from '../types';

interface DataSourceOptionProps<T> {
  source: DataSourcePickerSource<T>;
  selected: boolean;
  disabled: boolean;
  fallbackIcon?: React.ReactNode;
  disabledLabel: string;
  onSelect: (source: DataSourcePickerSource<T>) => void;
}

export default function DataSourceOption<T>(props: DataSourceOptionProps<T>) {
  const { source, selected, disabled, fallbackIcon, disabledLabel, onSelect } = props;
  const nameRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipContent = source.disabled ? `${source.name} · ${disabledLabel}` : source.name;

  const updateTooltipVisibility = (visible: boolean) => {
    const nameElement = nameRef.current;
    setShowTooltip(Boolean(visible && nameElement && nameElement.scrollWidth > nameElement.clientWidth));
  };

  return (
    <Tooltip
      title={tooltipContent}
      placement='top'
      trigger={['hover', 'focus']}
      mouseEnterDelay={0.15}
      mouseLeaveDelay={0}
      visible={showTooltip}
      onVisibleChange={updateTooltipVisibility}
      overlayClassName='data-source-list-tooltip-box'
    >
      <span className='data-source-picker-source-trigger'>
        <button
          type='button'
          role='radio'
          aria-checked={selected}
          aria-disabled={disabled || source.disabled}
          disabled={disabled || source.disabled}
          className={classNames('data-source-picker-source', {
            selected,
            disabled: source.disabled,
          })}
          onClick={() => onSelect(source)}
        >
          <span className='data-source-picker-icon data-source-picker-source-icon'>{source.icon ?? fallbackIcon}</span>
          <span ref={nameRef} className='data-source-picker-source-name'>
            {source.name}
          </span>
          {source.disabled ? <span className='data-source-picker-source-status'>{disabledLabel}</span> : null}
          {selected ? <CheckOutlined className='data-source-picker-source-check' /> : null}
        </button>
      </span>
    </Tooltip>
  );
}
