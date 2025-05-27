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
import { DownOutlined, UpOutlined, CalendarOutlined, SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PickerPanel } from 'rc-picker';
import momentGenerateConfig from 'rc-picker/es/generate/moment';
import zh_CN from 'rc-picker/lib/locale/zh_CN';
import zh_TW from 'rc-picker/lib/locale/zh_TW';
import en_US from 'rc-picker/lib/locale/en_US';
import 'rc-picker/assets/index.css';
import classNames from 'classnames';
import moment, { Moment } from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { InternalTimeZones } from '@/utils/datetime/types';
import { getTimeZoneInfo } from '@/utils/datetime/timezones';

import { isValid, describeTimeRange, valueAsString, isMathString, parseRange } from './utils';
import { IRawTimeRange, ITimeRangePickerProps } from './types';
import { rangeOptions, momentLocaleZhCN } from './config';
import TimeZonePicker from './TimeZonePicker';
import './style.less';

moment.locale('zh-cn', momentLocaleZhCN);

const localeMap = {
  zh_CN: zh_CN,
  zh_HK: zh_TW,
  en_US: en_US,
};

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
const AbsoluteTimePicker = ({
  type,
  limitHour,
  range,
  setRange,
  rangeStatus,
  setRangeStatus,
  dateFormat,
}: {
  type: 'start' | 'end';
  limitHour?: number;
  range?: IRawTimeRange;
  setRange: any;
  rangeStatus: {
    start?: string;
    end?: string;
  };
  setRangeStatus: any;
  dateFormat: string;
}) => {
  const { t, i18n } = useTranslation('timeRangePicker');
  const labelMap = {
    start: t('start'),
    end: t('end'),
  };
  const val = moment(range ? range[type] : undefined, true);
  const [visible, setVisible] = useState(false);

  return (
    <div className='mb-2'>
      <span>{labelMap[type]}</span>
      <Input.Group compact style={{ marginTop: 4 }}>
        <Input
          style={{ width: 'calc(100% - 32px)' }}
          className={rangeStatus[type] === 'invalid' ? 'ant-input-status-error' : ''}
          value={range ? valueAsString(range[type], dateFormat) : undefined}
          onChange={(e) => {
            const val = e.target.value;
            setRangeStatus({
              ...rangeStatus,
              [type]: !isValid(val) ? 'invalid' : undefined,
            });
            if (isValid(val)) {
              const newRange = {
                ...(range || {}),
                [type]: isMathString(val) ? val : moment(val),
              };
              setRange(newRange as IRawTimeRange);
            } else {
              setRange({
                ...(range || {}),
                [type]: val,
              } as IRawTimeRange);
            }
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
          getPopupContainer={() => document.body}
          content={
            <PickerPanel
              prefixCls='ant-picker'
              generateConfig={momentGenerateConfig}
              locale={localeMap[i18n.language] || en_US}
              showTime={{
                defaultValue: type === 'start' ? moment().startOf('day') : moment().endOf('day'),
                showSecond: false,
              }}
              disabledDate={(current: Moment) => {
                const exceedHourLimit = limitHour
                  ? moment().hour(0).minute(0).second(0).diff(current, 'hour') > limitHour || current.diff(moment().hour(0).minute(0).second(0), 'hour') > limitHour
                  : false;
                if (exceedHourLimit) {
                  return true;
                }
                return false;
              }}
              value={val.isValid() ? val : undefined}
              onChange={(value) => {
                const newRange = {
                  ...(range || {}),
                  [type]: value,
                };
                if (type === 'start' && !moment.isMoment(newRange.end)) {
                  newRange.end = moment(newRange.start).endOf('day');
                }
                if (type === 'end' && !moment.isMoment(newRange.start)) {
                  newRange.start = moment(newRange.end).startOf('day');
                }
                setRange(newRange as IRawTimeRange);
              }}
            />
          }
          visible={visible}
          onVisibleChange={(v) => {
            setVisible(v);
          }}
        >
          <Button danger={rangeStatus[type] === 'invalid'} icon={<CalendarOutlined />} />
        </Popover>
      </Input.Group>
      <div className='flashcat-timeRangePicker-single-status'>{rangeStatus[type] === 'invalid' ? t('invalid') : undefined}</div>
    </div>
  );
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
                <Col span={15}>
                  <div className='flashcat-timeRangePicker-left'>
                    <AbsoluteTimePicker
                      type='start'
                      limitHour={limitHour}
                      range={range}
                      setRange={setRange}
                      rangeStatus={rangeStatus}
                      setRangeStatus={setRangeStatus}
                      dateFormat={dateFormat}
                    />
                    <AbsoluteTimePicker
                      type='end'
                      limitHour={limitHour}
                      range={range}
                      setRange={setRange}
                      rangeStatus={rangeStatus}
                      setRangeStatus={setRangeStatus}
                      dateFormat={dateFormat}
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
                <Col span={9}>
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
        }}
      >
        <Button
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
