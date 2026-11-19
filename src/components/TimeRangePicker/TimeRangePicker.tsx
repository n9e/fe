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
import React, { useState, useEffect } from 'react';
import { Button, Popover, Row, Col, Input, Space } from 'antd';
import { DownOutlined, UpOutlined, SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import 'rc-picker/assets/index.css';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { InternalTimeZones } from '@/utils/datetime/types';
import { getTimeZoneInfo } from '@/utils/datetime/timezones';

import { describeTimeRange, valueAsString, isMathString, parseRange } from './utils';
import { IRawTimeRange, ITimeRangePickerProps } from './types';
import { rangeOptions } from './config';
import TimeZonePicker from './TimeZonePicker';
import AbsoluteTimePicker from './AbsoluteTimePicker';
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
const setAbsoluteHistoryCache = (range, dateFormat) => {
  const absoluteHistoryCache = getAbsoluteHistoryCache();
  const rangeClone = _.cloneDeep(range);
  rangeClone.start = valueAsString(rangeClone.start, dateFormat);
  rangeClone.end = valueAsString(rangeClone.end, dateFormat);
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
  const [visible, setVisible] = useState(false);
  const [range, setRange] = useState<IRawTimeRange>();
  const [label, setLabel] = useState<string>('');
  const [searchValue, setSearchValue] = useState('');
  const [rangeStatus, setRangeStatus] = useState<{
    start?: string;
    end?: string;
  }>({
    start: undefined,
    end: undefined,
  });

  useEffect(() => {
    if (value) {
      setRange(value);
      setLabel(describeTimeRange(value, dateFormat));
    }
  }, [JSON.stringify(value), visible, i18n.language]);

  const exceedHourLimit = limitHour && range ? moment().diff(moment(parseRange(range).start), 'hour') > limitHour : false;

  const startLargeThenEnd =
    rangeStatus.start !== 'invalid' &&
    rangeStatus.end !== 'invalid' &&
    range &&
    range.start &&
    range.end &&
    parseRange(range as IRawTimeRange).start &&
    parseRange(range as IRawTimeRange).start!.isAfter(parseRange(range as IRawTimeRange).end);

  return (
    <>
      <Popover
        overlayClassName='flashcat-timeRangePicker-container'
        content={
          <>
            <div className='flashcat-timeRangePicker'>
              <Row>
                <Col span={showMillisecond ? 17 : 15}>
                  <div className='flashcat-timeRangePicker-left'>
                    <AbsoluteTimePicker
                      type='start'
                      limitHour={limitHour}
                      range={range}
                      setRange={setRange}
                      rangeStatus={rangeStatus}
                      setRangeStatus={setRangeStatus}
                      dateFormat={dateFormat}
                      showSecond={showSecond}
                      showMillisecond={showMillisecond}
                    />
                    <AbsoluteTimePicker
                      type='end'
                      limitHour={limitHour}
                      range={range}
                      setRange={setRange}
                      rangeStatus={rangeStatus}
                      setRangeStatus={setRangeStatus}
                      dateFormat={dateFormat}
                      showSecond={showSecond}
                      showMillisecond={showMillisecond}
                    />
                    <div>
                      <Space>
                        <Button
                          type='primary'
                          onClick={() => {
                            if (rangeStatus.start !== 'invalid' && rangeStatus.end !== 'invalid') {
                              onChange(range as IRawTimeRange);
                              setAbsoluteHistoryCache(range as IRawTimeRange, dateFormat);
                              setVisible(false);
                            }
                          }}
                          disabled={exceedHourLimit || !!startLargeThenEnd}
                          title={exceedHourLimit ? t('exceed_hour_limit_tip', { hours: limitHour }) : startLargeThenEnd ? t('start_gt_end_tip') : undefined}
                        >
                          {t('ok')}
                        </Button>
                        {limitHour && <span>{t('exceed_hour_limit_tip', { hours: limitHour })} </span>}
                      </Space>
                    </div>
                    <div className='flashcat-timeRangePicker-absolute-history'>
                      <span>{t('history')}</span>
                      <ul style={{ marginTop: 4 }}>
                        {_.map(
                          _.filter(absoluteHistoryCache, (item) => {
                            return item?.start && item?.end;
                          }),
                          (range, idx) => {
                            const newValue = {
                              start: isMathString(range.start) ? range.start : moment(range.start),
                              end: isMathString(range.end) ? range.end : moment(range.end),
                            };
                            const exceedHourLimit = limitHour ? moment().diff(moment(parseRange(newValue).start), 'hour') > limitHour : false;
                            return (
                              <li
                                key={range.start + range.end + idx}
                                style={{ color: exceedHourLimit ? 'lightgray' : undefined, cursor: exceedHourLimit ? 'not-allowed' : undefined }}
                                onClick={() => {
                                  if (exceedHourLimit) {
                                    return;
                                  }
                                  setRange(newValue);
                                  onChange(newValue);
                                  setVisible(false);
                                }}
                              >
                                {describeTimeRange(range, dateFormat)}
                              </li>
                            );
                          },
                        )}
                      </ul>
                    </div>
                  </div>
                </Col>
                <Col span={showMillisecond ? 7 : 9}>
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
                          const exceedHourLimit = limitHour
                            ? moment().diff(
                                moment(
                                  parseRange({
                                    start: item.start,
                                    end: item.end,
                                  }).start,
                                ),
                                'hour',
                              ) > limitHour
                            : false;
                          return display.indexOf(searchValue) > -1 && !exceedHourLimit;
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
                                setRange(newValue);
                                onChange(newValue);
                                setVisible(false);
                                setAbsoluteHistoryCache(newValue, dateFormat);
                              }}
                            >
                              {t(`rangeOptions.${item.display}`)}
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
            {(showTimezone || extraFooter) && (
              <div className='flashcat-timeRangePicker-footer'>
                {showTimezone ? <TimeZonePicker value={timezone} onChange={onTimezoneChange} /> : <span />}
                {extraFooter && extraFooter(setVisible)}
              </div>
            )}
          </>
        }
        trigger='click'
        placement='bottomRight'
        visible={visible}
        onVisibleChange={(v) => {
          !disabled && setVisible(v);
          onVisibleChange && onVisibleChange(v);
        }}
      >
        <Button
          type={props.noBorder ? 'text' : 'default'}
          style={props.style}
          className={classNames({
            'flashcat-timeRangePicker-target': true,
            'flashcat-timeRangePicker-target-allowClear': allowClear && label,
          })}
          onClick={() => {
            setVisible(!visible);
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
                  setLabel('');
                  onClear();
                }}
              />
            </span>
          )}
        </Button>
      </Popover>
    </>
  );
}
