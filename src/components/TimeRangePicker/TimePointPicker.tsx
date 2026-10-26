import React, { useState } from 'react';
import { DatePicker, Tooltip } from 'antd';
import type { DatePickerProps } from 'antd';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { ClockCircleOutlined } from '@ant-design/icons';
import './style.less';

// Keep all page-specific precision, disabled dates and latest/history callbacks.
export default function TimePointPicker({
  timeDescription,
  tooltipContent,
  isLatest,
  ...props
}: DatePickerProps & { timeDescription?: React.ReactNode; tooltipContent?: React.ReactNode; isLatest?: boolean }) {
  const { t } = useTranslation('timePickerInteraction');
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const value = props.value;
  const format = typeof props.format === 'string' ? props.format : '';
  const timeFormat = format.includes('SSS') ? 'HH:mm:ss.SSS' : format && !format.includes('ss') ? 'HH:mm' : 'HH:mm:ss';
  return (
    <Tooltip
      visible={hover && !(props.open ?? open) && !!value?.isValid()}
      onVisibleChange={setHover}
      overlayClassName='fc-time-range-tooltip'
      overlayStyle={{ pointerEvents: 'none', maxWidth: 'min(400px, 100vw)' }}
      title={
        tooltipContent ?? (
          <div className='fc-time-range-summary'>
            <div className='fc-time-range-summary__heading'>
              <ClockCircleOutlined />
              <span>{t(isLatest === undefined ? 'instant' : isLatest ? 'latest' : 'history')}</span>
            </div>
            <div className='fc-time-range-summary__row'>
              <span>{value?.format('YYYY-MM-DD')}</span>
              <strong>{value?.format(timeFormat)}</strong>
            </div>
            <div className='fc-time-range-summary__zone'>
              <span>{value?.tz() || (value?.isUTC() ? 'UTC' : moment.tz.guess())}</span>
              <strong>UTC{value?.format('Z')}</strong>
            </div>
            {timeDescription && <div className='fc-time-range-summary__extra'>{timeDescription}</div>}
          </div>
        )
      }
    >
      <DatePicker
        {...props}
        onOpenChange={(next) => {
          setOpen(next);
          setHover(false);
          props.onOpenChange?.(next);
        }}
      />
    </Tooltip>
  );
}
