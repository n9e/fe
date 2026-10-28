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
        disabledDate={(day) => !!limitHour && moment().startOf('day').diff(day, 'hour') > limitHour}
        onSelect={(day) => {
          if (!anchor) {
            onSelecting(true);
            setAnchor(day.clone());
            setHover(day.clone());
            return;
          }
          const earlier = day.isBefore(anchor, 'day') ? day : anchor;
          const later = day.isBefore(anchor, 'day') ? anchor : day;
          onChange({ start: earlier.clone().startOf('day'), end: later.clone().endOf('day') });
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
            onMouseEnter={() => anchor && setHover(day.clone())}
          >
            {day.date()}
          </div>
        )}
      />
    </div>
  );
}
