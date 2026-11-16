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
import React, { useState, useEffect, useRef } from 'react';
import { Button, Popover, Input } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { PickerPanel } from 'rc-picker';
import momentGenerateConfig from 'rc-picker/es/generate/moment';
import zh_CN from 'rc-picker/lib/locale/zh_CN';
import zh_TW from 'rc-picker/lib/locale/zh_TW';
import en_US from 'rc-picker/lib/locale/en_US';
import moment, { Moment } from 'moment';
import { useTranslation } from 'react-i18next';
import { isValid, valueAsString, isMathString } from './utils';
import type { IRawTimeRange } from './types';
import 'rc-picker/assets/index.css';
import './locale';
import './style.less';

const localeMap = { zh_CN, zh_HK: zh_TW, en_US };

const AbsoluteTimePicker = ({
  type,
  limitHour,
  range,
  setRange,
  rangeStatus,
  setRangeStatus,
  dateFormat,
  showSecond = false,
  showMillisecond = false,
  bounds,
  disabled,
  confirmText,
  getPopupContainer,
}: {
  type: 'start' | 'end';
  limitHour?: number;
  range?: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  rangeStatus: {
    start?: string;
    end?: string;
  };
  setRangeStatus: (status: { start?: string; end?: string }) => void;
  dateFormat: string;
  showSecond?: boolean;
  showMillisecond?: boolean;
  bounds?: { start: number; end: number };
  disabled?: boolean;
  confirmText?: React.ReactNode;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
}) => {
  const { t, i18n } = useTranslation('timeRangePicker');
  const labelMap = {
    start: t('start'),
    end: t('end'),
  };
  const pickerLocale = localeMap[i18n.language] || en_US;
  const nowLabel = pickerLocale?.now || 'Now';
  const okLabel = confirmText ?? pickerLocale?.ok ?? 'OK';
  const val = bounds ? moment(range?.[type], dateFormat, true) : moment(range ? range[type] : undefined, true);
  const [visible, setVisible] = useState(false);
  const [tempValue, setTempValue] = useState<Moment | undefined>(val.isValid() ? val : undefined);
  const isFocusedRef = useRef(false);
  const [inputValue, setInputValue] = useState<string>(range ? valueAsString(range[type], dateFormat) : '');

  useEffect(() => {
    if (!isFocusedRef.current) {
      setInputValue(range ? valueAsString(range[type], dateFormat) : '');
    }
  }, [range, type, dateFormat]);

  useEffect(() => {
    if (visible) {
      setTempValue(val.isValid() ? val : undefined);
    }
  }, [visible, range, type]);

  const inputIsValid = (value: string) => (bounds ? moment(value, dateFormat, true).isValid() : isValid(value));
  const commitInputValue = (val: string) => {
    setRangeStatus({
      ...rangeStatus,
      [type]: !inputIsValid(val) ? 'invalid' : undefined,
    });
    if (inputIsValid(val)) {
      const newRange = {
        ...(range || {}),
        [type]: bounds ? moment(val, dateFormat, true) : isMathString(val) ? val : moment(val),
      };
      setRange(newRange as IRawTimeRange);
    } else {
      setRange({
        ...(range || {}),
        [type]: val,
      } as IRawTimeRange);
    }
  };

  const confirmPanelValue = () => {
    if (!tempValue || !tempValue.isValid()) {
      return;
    }
    const confirmedValue = showMillisecond ? tempValue.clone().milliseconds(0) : tempValue;
    const newRange = {
      ...(range || {}),
      [type]: confirmedValue,
    };
    if (!bounds && type === 'start' && !moment.isMoment(newRange.end)) {
      newRange.end = moment(newRange.start).endOf('day');
    }
    if (!bounds && type === 'end' && !moment.isMoment(newRange.start)) {
      newRange.start = moment(newRange.end).startOf('day');
    }
    setRangeStatus({
      ...rangeStatus,
      [type]: undefined,
    });
    setRange(newRange as IRawTimeRange);
    setVisible(false);
  };

  return (
    <div className='mb-2'>
      <span>{labelMap[type]}</span>
      <Input.Group compact style={{ marginTop: 4 }}>
        <Input
          aria-label={labelMap[type]}
          disabled={disabled}
          style={{ width: 'calc(100% - 32px)' }}
          className={rangeStatus[type] === 'invalid' ? 'ant-input-status-error' : ''}
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            if (bounds) commitInputValue(val);
            setRangeStatus({
              ...rangeStatus,
              [type]: !inputIsValid(val) ? 'invalid' : undefined,
            });
          }}
          onFocus={() => {
            isFocusedRef.current = true;
          }}
          onBlur={(e) => {
            isFocusedRef.current = false;
            commitInputValue(e.currentTarget.value);
          }}
          onPressEnter={(e) => {
            commitInputValue(e.currentTarget.value);
          }}
        />
        <Popover
          title={
            <div className='flex justify-between'>
              <div>{labelMap[type]}</div>
              <a
                onClick={() => {
                  setVisible(false);
                }}
              >
                {t('close')}
              </a>
            </div>
          }
          placement='rightTop'
          trigger='click'
          overlayClassName='flashcat-timeRangePicker-single-popover'
          getPopupContainer={getPopupContainer ?? (() => document.body)}
          content={
            <PickerPanel
              prefixCls='ant-picker'
              generateConfig={momentGenerateConfig}
              locale={pickerLocale}
              showNow={false}
              showTime={{
                defaultValue: type === 'start' ? moment().startOf('day') : moment().endOf('day'),
                showSecond: showMillisecond || showSecond,
              }}
              disabledTime={
                bounds
                  ? (current) => {
                      if (!current) return {};
                      return {
                        disabledHours: () =>
                          Array.from({ length: 24 }, (_, hour) => hour).filter(
                            (hour) => current.clone().hour(hour).endOf('hour').unix() < bounds.start || current.clone().hour(hour).startOf('hour').unix() > bounds.end,
                          ),
                        disabledMinutes: (hour) =>
                          Array.from({ length: 60 }, (_, minute) => minute).filter(
                            (minute) =>
                              current.clone().hour(hour).minute(minute).endOf('minute').unix() < bounds.start ||
                              current.clone().hour(hour).minute(minute).startOf('minute').unix() > bounds.end,
                          ),
                      };
                    }
                  : undefined
              }
              disabledDate={(current: Moment) => {
                if (bounds) return current.clone().endOf('day').unix() < bounds.start || current.clone().startOf('day').unix() > bounds.end;
                const exceedHourLimit = limitHour
                  ? moment().hour(0).minute(0).second(0).diff(current, 'hour') > limitHour || current.diff(moment().hour(0).minute(0).second(0), 'hour') > limitHour
                  : false;
                if (exceedHourLimit) {
                  return true;
                }
                return false;
              }}
              value={tempValue}
              onChange={(value) => {
                const next = bounds ? moment.unix(Math.max(bounds.start, Math.min(bounds.end, value.unix()))).second(0) : value;
                setTempValue(next);
                if (bounds) {
                  setRange({ ...range, [type]: next } as IRawTimeRange);
                  setRangeStatus({ ...rangeStatus, [type]: undefined });
                }
              }}
              renderExtraFooter={() => (
                <div className='flex items-center justify-between'>
                  <a
                    onClick={() => {
                      const next = bounds ? moment.unix(Math.max(bounds.start, Math.min(bounds.end, moment().unix()))).second(0) : moment();
                      setTempValue(next);
                      if (bounds) {
                        setRange({ ...range, [type]: next } as IRawTimeRange);
                        setRangeStatus({ ...rangeStatus, [type]: undefined });
                      }
                    }}
                  >
                    {nowLabel}
                  </a>
                  <Button type='primary' size='small' disabled={bounds ? !tempValue?.isValid() : undefined} onClick={confirmPanelValue}>
                    {okLabel}
                  </Button>
                </div>
              )}
            />
          }
          visible={visible}
          onVisibleChange={(v) => {
            if (v) {
              setTempValue(val.isValid() ? val : undefined);
            }
            if (!disabled) setVisible(v);
          }}
        >
          <Button disabled={disabled} danger={rangeStatus[type] === 'invalid'} icon={<CalendarOutlined />} />
        </Popover>
      </Input.Group>
      <div className='flashcat-timeRangePicker-single-status'>{rangeStatus[type] === 'invalid' ? t('invalid') : undefined}</div>
    </div>
  );
};

export default AbsoluteTimePicker;
