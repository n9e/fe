import React, { useState } from 'react';
import { PickerPanel } from 'rc-picker';
import momentGenerateConfig from 'rc-picker/es/generate/moment';
import zh_CN from 'rc-picker/lib/locale/zh_CN';
import zh_TW from 'rc-picker/lib/locale/zh_TW';
import en_US from 'rc-picker/lib/locale/en_US';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { IRawTimeRange } from './types';
import { parseRange } from './utils';

// Calendar edits a draft only. The parent owns the single Apply action.
export default function RangeCalendar({
  range,
  initialBound = 'start',
  limitHour,
  onChange,
  onSelecting,
}: {
  range?: IRawTimeRange;
  initialBound?: 'start' | 'end';
  limitHour?: number;
  onChange: (range: IRawTimeRange) => void;
  onSelecting: (selecting: boolean) => void;
}) {
  const { t, i18n } = useTranslation('timePickerInteraction');
  const parsed = range ? parseRange(range) : undefined;
  const [anchor, setAnchor] = useState<Moment>();
  const [hover, setHover] = useState<Moment>();
  const [month, setMonth] = useState(() => (parsed?.[initialBound]?.isValid() ? parsed[initialBound]!.clone() : moment()));
  const first = anchor || parsed?.start;
  const last = anchor ? hover || anchor : parsed?.end;
  const start = first && last && first.isAfter(last, 'day') ? last : first;
  const end = first && last && first.isAfter(last, 'day') ? first : last;
  const isDateDisabled = (day: Moment, now = moment()) => {
    const earliest = limitHour && Number.isFinite(limitHour) && limitHour > 0 ? now.clone().subtract(limitHour, 'hours') : undefined;
    return day.isAfter(now, 'day') || !!earliest?.isAfter(day.clone().endOf('day'));
  };
  const locale = i18n.language === 'zh_CN' ? zh_CN : i18n.language === 'zh_HK' ? zh_TW : en_US;

  return (
    <div className='fc-time-range-calendar' role='dialog' aria-label={t('calendarLabel')}>
      <PickerPanel<Moment>
        prefixCls='ant-picker'
        generateConfig={momentGenerateConfig}
        locale={locale}
        pickerValue={month}
        onPickerValueChange={setMonth}
        value={undefined}
        disabledDate={(day) => isDateDisabled(day)}
        onSelect={(day) => {
          const now = moment();
          if (isDateDisabled(day, now)) return;
          if (!anchor || isDateDisabled(anchor, now)) {
            onSelecting(true);
            setAnchor(day.clone());
            setHover(day.clone());
            return;
          }
          const earlier = day.isBefore(anchor, 'day') ? day : anchor;
          const later = day.isBefore(anchor, 'day') ? anchor : day;
          const earliest = limitHour && Number.isFinite(limitHour) && limitHour > 0 ? now.clone().subtract(limitHour, 'hours') : undefined;
          const start = earlier.clone().startOf('day');
          const end = later.clone().endOf('day');
          const seconds = Math.floor((limitHour || 0) * 3600);
          const [unit, divisor]: [string, number] = seconds % 3600 === 0 ? ['h', 3600] : seconds % 60 === 0 ? ['m', 60] : ['s', 1];
          // Keep clipped edges relative: the rolling boundary must not expire while editing the draft.
          onChange({
            start: earliest && start.isBefore(earliest) ? `now-${seconds / divisor}${unit}` : start,
            end: end.isAfter(now) ? 'now' : end,
          });
          onSelecting(false);
          setAnchor(undefined);
          setHover(undefined);
        }}
        dateRender={(day) => (
          <div
            className={classNames('ant-picker-cell-inner', {
              'fc-time-range-calendar__edge': day.isSame(start, 'day') || day.isSame(end, 'day'),
              'fc-time-range-calendar__inside': start && end && day.isBetween(start, end, 'day', '[]'),
            })}
            onMouseEnter={() => anchor && !isDateDisabled(day) && setHover(day.clone())}
          >
            {day.date()}
          </div>
        )}
      />
    </div>
  );
}
