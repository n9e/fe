/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Popover, Input, Space, Tooltip } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined, CloseCircleOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import RangeCalendar from './RangeCalendar';
import TimeRangeSummary from './TimeRangeSummary';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { InternalTimeZones } from '@/utils/datetime/types';
import { getTimeZoneInfo } from '@/utils/datetime/timezones';

import { isValid, describeTimeRange, valueAsString, isMathString, parseRange, getRangeError } from './utils';
import { IRawTimeRange, ITimeRangePickerProps } from './types';
import { rangeOptions } from './config';
import TimeZonePicker from './TimeZonePicker';
import './style.less';

const absolutehistoryCacheKey = 'flashcat-timeRangePicker-absolute-history';
const getAbsoluteHistoryCache = () => {
  const cache = localStorage.getItem(absolutehistoryCacheKey);
  if (cache) {
    try {
      const list = _.unionWith(JSON.parse(cache), _.isEqual);
      return list;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
  return [];
};
const setAbsoluteHistoryCache = (range) => {
  const absoluteHistoryCache = getAbsoluteHistoryCache();
  const rangeClone = _.cloneDeep(range);
  rangeClone.start = valueAsString(rangeClone.start, 'YYYY-MM-DD HH:mm:ss.SSS');
  rangeClone.end = valueAsString(rangeClone.end, 'YYYY-MM-DD HH:mm:ss.SSS');
  const newAbsoluteHistoryCache = _.unionWith([rangeClone, ...absoluteHistoryCache], _.isEqual).slice(0, 4);
  try {
    const cacheStr = JSON.stringify(newAbsoluteHistoryCache);
    localStorage.setItem(absolutehistoryCacheKey, cacheStr);
  } catch (e) {
    console.log(e);
  }
};
export default function index(props: ITimeRangePickerProps) {
  const { t, i18n } = useTranslation('timeRangePicker');
  const { t: interactionT } = useTranslation('timePickerInteraction');
  const absoluteHistoryCache = getAbsoluteHistoryCache();
  const {
    value,
    onChange = () => {},
    dateFormat = 'YYYY-MM-DD HH:mm',
    placeholder = t('placeholder'),
    allowClear = false,
    onClear = () => {},
    extraFooter,
    limitHour,
    disabled,
    ajustTimeOptions,
    showTimezone = false,
    timezone = InternalTimeZones.localBrowserTime,
    onTimezoneChange,
    showSecond,
    showMillisecond,
    onVisibleChange,
  } = props;
  const resolvedSnapshot = useMemo(() => (value ? parseRange(props.resolvedRange || value) : undefined), [JSON.stringify(value), JSON.stringify(props.resolvedRange)]);
  const [visible, setVisible] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [calendarRevision, setCalendarRevision] = useState(0);
  const [calendarBound, setCalendarBound] = useState<'start' | 'end'>();
  const [range, setRange] = useState<IRawTimeRange>();
  const label = value ? describeTimeRange(value, dateFormat) : props.emptyLabel || '';
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [rangeStatus, setRangeStatus] = useState<{
    start?: string;
    end?: string;
  }>({
    start: undefined,
    end: undefined,
  });

  const closeCalendar = () => {
    setCalendarBound(undefined);
    setSelecting(false);
  };

  const changeVisible = (next: boolean) => {
    if (disabled && next) return;
    if (next) {
      setRange(
        value
          ? { ..._.cloneDeep(value), start: isMathString(value.start) ? value.start : moment(value.start), end: isMathString(value.end) ? value.end : moment(value.end) }
          : undefined,
      );
      setRangeStatus({});
      setSelecting(false);
      setSearchValue('');
    }
    closeCalendar();
    setTooltipVisible(false);
    setVisible(next);
    onVisibleChange?.(next);
  };

  useEffect(() => {
    if (!visible) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (calendarBound) closeCalendar();
      else changeVisible(false);
    };
    document.addEventListener('keydown', closeOnEscape, true);
    return () => document.removeEventListener('keydown', closeOnEscape, true);
  }, [visible, calendarBound]);

  const hasLookbackLimit = !!limitHour && Number.isFinite(limitHour) && limitHour > 0;

  let remainingSeconds = Math.round((hasLookbackLimit ? limitHour! : 0) * 3600);
  const limitDuration = (
    [
      ['limitDays', 86400],
      ['limitHours', 3600],
      ['limitMinutes', 60],
      ['limitSeconds', 1],
    ] as const
  )
    .map(([key, seconds]) => {
      const count = Math.floor(remainingSeconds / seconds);
      remainingSeconds %= seconds;
      return count ? interactionT(key, { value: count }) : '';
    })
    .filter(Boolean)
    .join(' ');
  const limitHint = interactionT('rangeLimit', { duration: limitDuration });

  const inputFormat = showMillisecond ? 'YYYY-MM-DD HH:mm:ss.SSS' : showSecond ? 'YYYY-MM-DD HH:mm:ss' : dateFormat;
  const rangeError = getRangeError(range, limitHour);
  const errorHint = (error: ReturnType<typeof getRangeError>) =>
    error === 'lookback' ? limitHint : error === 'future' ? interactionT('futureTime') : error === 'reversed' ? t('start_gt_end_tip') : undefined;
  const hint = errorHint(rangeError) || (hasLookbackLimit ? limitHint : undefined);

  // Revalidate on click as an absolute range can expire while the editor remains open.
  const applyRange = (next: IRawTimeRange | undefined, cacheFormat?: string) => {
    setRange(next ? { ...next } : undefined);
    if (!next || getRangeError(next, limitHour)) return;
    onChange({
      start: isMathString(next.start) ? next.start : moment(next.start),
      end: isMathString(next.end) ? next.end : moment(next.end),
    });
    if (cacheFormat) setAbsoluteHistoryCache(next);
    changeVisible(false);
  };

  return (
    <>
      <Popover
        overlayClassName='flashcat-timeRangePicker-container'
        content={
          <>
            <div className='flashcat-timeRangePicker'>
              <div className='fc-time-editor-columns'>
                <div className='fc-time-editor-main'>
                  <div className='flashcat-timeRangePicker-left'>
                    {(['start', 'end'] as const).map((bound) => (
                      <label className='fc-time-editor-field' key={bound}>
                        <span className='fc-time-editor-label'>{t(bound)}</span>
                        <Popover
                          trigger='click'
                          placement='leftTop'
                          overlayClassName='fc-time-range-calendar-popover'
                          getPopupContainer={(trigger) => trigger.closest('.flashcat-timeRangePicker-container') as HTMLElement}
                          visible={visible && calendarBound === bound}
                          destroyTooltipOnHide
                          onVisibleChange={(next) => {
                            if (next) {
                              setSelecting(false);
                              setCalendarBound(bound);
                            } else if (calendarBound === bound) {
                              closeCalendar();
                            }
                          }}
                          content={() =>
                            calendarBound === bound && (
                              <>
                                <RangeCalendar
                                  key={`${bound}-${calendarRevision}`}
                                  range={range}
                                  initialBound={bound}
                                  onSelecting={setSelecting}
                                  limitHour={limitHour}
                                  onChange={(next) => {
                                    setRange(next);
                                    setRangeStatus({});
                                    closeCalendar();
                                  }}
                                />
                                <div className='fc-time-editor-hint'>{interactionT('calendarHint')}</div>
                              </>
                            )
                          }
                        >
                          <Input
                            aria-label={t(bound)}
                            aria-expanded={calendarBound === bound}
                            aria-haspopup='dialog'
                            suffix={<CalendarOutlined />}
                            value={range ? valueAsString(range[bound], inputFormat) : ''}
                            placeholder={inputFormat}
                            status={rangeStatus[bound] === 'invalid' ? 'error' : undefined}
                            onKeyDown={(event) => {
                              if (event.key === 'ArrowDown') {
                                event.preventDefault();
                                setCalendarBound(bound);
                              }
                            }}
                            onChange={(event) => {
                              const input = event.target.value;
                              closeCalendar();
                              setCalendarRevision((current) => current + 1);
                              setRangeStatus((current) => ({ ...current, [bound]: isValid(input) ? undefined : 'invalid' }));
                              setRange((current) => ({ ...current, [bound]: input } as IRawTimeRange));
                            }}
                          />
                        </Popover>
                      </label>
                    ))}
                    <div>
                      <Space>
                        <Button type='primary' onClick={() => applyRange(range, inputFormat)} disabled={!!rangeError || selecting} title={errorHint(rangeError)}>
                          {interactionT('apply')}
                        </Button>
                        {hint && <span role={rangeError && rangeError !== 'invalid' ? 'alert' : undefined}>{hint}</span>}
                      </Space>
                    </div>
                    <div className='flashcat-timeRangePicker-absolute-history'>
                      <div className='fc-time-history-heading'>
                        <span>{interactionT('recentRanges')}</span>
                      </div>
                      <ul>
                        {_.map(
                          _.filter(absoluteHistoryCache, (item) => {
                            return item?.start && item?.end && isValid(item.start) && isValid(item.end);
                          }),
                          (range, idx) => {
                            const newValue = {
                              start: isMathString(range.start) ? range.start : moment(range.start),
                              end: isMathString(range.end) ? range.end : moment(range.end),
                            };
                            const resolved = parseRange(newValue);
                            const historyError = getRangeError(newValue, limitHour);
                            const seconds = resolved.start?.isValid() && resolved.end?.isValid() ? Math.max(0, Math.round(resolved.end.diff(resolved.start, 'seconds', true))) : 0;
                            const minutes = Math.round(seconds / 60);
                            const hours = Math.round(seconds / 3600);
                            const duration: [string, number] =
                              hours >= 24
                                ? ['durationDays', Math.round(seconds / 86400)]
                                : minutes >= 60
                                ? ['durationHours', hours]
                                : seconds >= 60
                                ? ['durationMinutes', minutes]
                                : ['durationSeconds', seconds];
                            return (
                              <li key={range.start + range.end + idx}>
                                <button
                                  type='button'
                                  className='fc-time-history-item'
                                  disabled={!!historyError}
                                  title={errorHint(historyError) || describeTimeRange(range, inputFormat)}
                                  aria-label={`${interactionT('recentRanges')}: ${describeTimeRange(range, inputFormat)}`}
                                  onClick={() => applyRange(newValue)}
                                >
                                  <span className='fc-time-history-item__value'>
                                    {isMathString(range.start) || isMathString(range.end) ? (
                                      describeTimeRange(range, inputFormat)
                                    ) : (
                                      <>
                                        <span className='fc-time-history-item__duration'>{interactionT(duration[0], { value: duration[1] })} ～ </span>
                                        <span>{valueAsString(newValue.end, inputFormat)}</span>
                                      </>
                                    )}
                                  </span>
                                  <RightOutlined />
                                </button>
                              </li>
                            );
                          },
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className='fc-time-editor-presets'>
                  <div className='flashcat-timeRangePicker-ranges'>
                    <Input
                      placeholder={t('quickSearchPlaceholder')}
                      prefix={<SearchOutlined />}
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                      }}
                    />
                    <ul>
                      {_.map(
                        _.filter(ajustTimeOptions ? ajustTimeOptions(rangeOptions) : rangeOptions, (item) => {
                          const display = t(`rangeOptions.${item.display}`);
                          return display.toLowerCase().includes(searchValue.toLowerCase()) && !getRangeError(item, limitHour);
                        }),
                        (item) => {
                          return (
                            <li
                              key={item.display}
                              className={classNames({
                                active: item.start === range?.start && item.end === range?.end,
                              })}
                              onClick={() => {
                                const newValue = {
                                  start: item.start,
                                  end: item.end,
                                };
                                applyRange(newValue, dateFormat);
                              }}
                            >
                              {t(`rangeOptions.${item.display}`)}
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {(showTimezone || extraFooter) && (
              <div className='flashcat-timeRangePicker-footer'>
                {showTimezone ? <TimeZonePicker value={timezone} onChange={onTimezoneChange} /> : <span />}
                {extraFooter && extraFooter(changeVisible)}
              </div>
            )}
          </>
        }
        trigger='click'
        placement='bottomRight'
        visible={visible}
        onVisibleChange={changeVisible}
      >
        <Tooltip
          overlayClassName='fc-time-range-tooltip'
          title={
            <TimeRangeSummary
              value={value}
              resolvedRange={resolvedSnapshot as IRawTimeRange}
              timezone={timezone}
              showSecond={inputFormat.includes('ss')}
              showMillisecond={showMillisecond}
              extra={props.timeRangeTooltip}
            />
          }
          visible={!visible && tooltipVisible && !!value}
          onVisibleChange={setTooltipVisible}
          overlayStyle={{ pointerEvents: 'none', maxWidth: 'min(420px, 100vw)' }}
        >
          <Button
            type={props.noBorder ? 'text' : 'default'}
            style={props.style}
            className={classNames({
              'flashcat-timeRangePicker-target': true,
              'flashcat-timeRangePicker-target-allowClear': allowClear && !!value,
            })}
            onClick={() => {
              changeVisible(!visible);
            }}
            disabled={disabled}
          >
            {props.label || label || <span style={{ color: '#bfbfbf' }}>{placeholder}</span>}

            {timezone && timezone !== InternalTimeZones.localBrowserTime ? (
              <span
                className='pl-1'
                style={{
                  color: 'var(--fc-gold-6-color)',
                }}
              >
                {getTimeZoneInfo(timezone, Date.now())?.abbreviation}
              </span>
            ) : null}
            {!props.label && (
              <span className='flashcat-timeRangePicker-target-icon'>
                {visible ? <UpOutlined /> : <DownOutlined />}
                <CloseCircleOutlined
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation();
                    e.stopPropagation();
                    setRange(undefined);
                    onChange(undefined as any); // TODO：兼容所有已调用的地方
                    onClear();
                  }}
                />
              </span>
            )}
          </Button>
        </Tooltip>
      </Popover>
    </>
  );
}
