import React, { useMemo } from 'react';
import moment from 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from './types';
import { parseRange, describeTimeRange } from './utils';
import { ClockCircleOutlined } from '@ant-design/icons';

export default function TimeRangeSummary({
  value,
  resolvedRange,
  timezone,
  showMillisecond,
  showSecond = true,
  extra,
}: {
  value?: IRawTimeRange;
  resolvedRange?: IRawTimeRange;
  timezone?: string;
  showMillisecond?: boolean;
  showSecond?: boolean;
  extra?: React.ReactNode;
}) {
  const { t } = useTranslation('timePickerInteraction');
  // Resolve when the value/refresh changes, never when the pointer enters the trigger.
  const snapshot = useMemo(() => (value ? parseRange(resolvedRange || value) : undefined), [JSON.stringify(value), JSON.stringify(resolvedRange)]);
  if (!snapshot?.start?.isValid() || !snapshot?.end?.isValid()) return null;
  const zone = timezone && timezone !== 'browser' ? (timezone === 'utc' ? 'UTC' : timezone) : moment.tz.guess();
  const timeFormat = showMillisecond ? 'HH:mm:ss.SSS' : showSecond ? 'HH:mm:ss' : 'HH:mm';
  const times = [snapshot.start.clone().tz(zone), snapshot.end.clone().tz(zone)];
  return (
    <div className='fc-time-range-summary'>
      <div className='fc-time-range-summary__heading'>
        <ClockCircleOutlined />
        <span>{value ? describeTimeRange(value, `YYYY-MM-DD ${timeFormat}`) : ''}</span>
      </div>
      {times.map((time, index) => (
        <div className='fc-time-range-summary__row' key={index}>
          <span className='fc-time-range-summary__label'>{t(index === 0 ? 'from' : 'to')}</span>
          <span>
            {time.format('YYYY-MM-DD')} <strong>{time.format(timeFormat)}</strong>
          </span>
        </div>
      ))}
      <div className='fc-time-range-summary__zone'>
        <span>{zone}</span>
        <strong>UTC{times[0].format('Z')}</strong>
        {times[0].utcOffset() !== times[1].utcOffset() && <strong>→ UTC{times[1].format('Z')}</strong>}
      </div>
      {extra && <div className='fc-time-range-summary__extra'>{extra}</div>}
    </div>
  );
}
