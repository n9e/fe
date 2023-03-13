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
import { Button, Popover, Row, Col, Input } from 'antd';
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
import { isValid, describeTimeRange, valueAsString, isMathString } from './utils';
import { IRawTimeRange, ITimeRangePickerProps } from './types';
import { rangeOptions, momentLocaleZhCN } from './config';
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

export default function index(props: ITimeRangePickerProps) {
  const { t, i18n } = useTranslation('timeRangePicker');
  const absoluteHistoryCache = getAbsoluteHistoryCache();
  const { value, onChange = () => {}, dateFormat = 'YYYY-MM-DD HH:mm', placeholder = t('placeholder'), allowClear = false, onClear = () => {}, extraFooter } = props;
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
  const renderSinglePicker = (key: 'start' | 'end') => {
    const labelMap = {
      start: t('start'),
      end: t('end'),
    };
    const val = moment(range ? range[key] : undefined, true);
    return (
      <div className='mb10'>
        <span>{labelMap[key]}</span>
        <Input.Group compact style={{ marginTop: 4 }}>
          <Popover
            title={`${labelMap[key]}`}
            placement='leftTop'
            trigger='click'
            overlayClassName='flashcat-timeRangePicker-single-popover'
            getPopupContainer={() => document.body}
            content={
              <PickerPanel
                prefixCls='ant-picker'
                generateConfig={momentGenerateConfig}
                locale={localeMap[i18n.language] || en_US}
                showTime={{
                  defaultValue: key === 'start' ? moment().startOf('day') : moment().endOf('day'),
                  showSecond: false,
                }}
                disabledDate={(current: Moment) => {
                  if (key === 'start') {
                    return current && current.valueOf() > moment(range?.end, true).valueOf();
                  }
                  return current && current.valueOf() < moment(range?.start, true).valueOf();
                }}
                value={val.isValid() ? val : undefined}
                onChange={(value) => {
                  const newRange = {
                    ...(range || {}),
                    [key]: value,
                  };
                  if (key === 'start' && !moment.isMoment(newRange.end)) {
                    newRange.end = moment(newRange.start).endOf('day');
                  }
                  if (key === 'end' && !moment.isMoment(newRange.start)) {
                    newRange.start = moment(newRange.end).startOf('day');
                  }
                  setRange(newRange as IRawTimeRange);
                  setAbsoluteHistoryCache(newRange, dateFormat);
                }}
              />
            }
          >
            <Button danger={rangeStatus[key] === 'invalid'} icon={<CalendarOutlined />} />
          </Popover>
          <Input
            style={{ width: 'calc(100% - 32px)' }}
            className={rangeStatus[key] === 'invalid' ? 'ant-input-status-error' : ''}
            value={range ? valueAsString(range[key], dateFormat) : undefined}
            onChange={(e) => {
              const val = e.target.value;
              setRangeStatus({
                ...rangeStatus,
                [key]: !isValid(val) ? 'invalid' : undefined,
              });
              if (isValid(val)) {
                const newRange = {
                  ...(range || {}),
                  [key]: isMathString(val) ? val : moment(val),
                };
                setRange(newRange as IRawTimeRange);
              } else {
                setRange({
                  ...(range || {}),
                  [key]: val,
                } as IRawTimeRange);
              }
            }}
            onBlur={(e) => {
              const val = e.target.value;
              const otherKey = key === 'start' ? 'end' : 'start';
              // 必须是绝对时间才缓存
              if (range && !isMathString(val) && moment.isMoment(range[otherKey])) {
                setAbsoluteHistoryCache(
                  {
                    ...range,
                    [key]: val,
                  },
                  dateFormat,
                );
              }
            }}
          />
        </Input.Group>
        <div className='flashcat-timeRangePicker-single-status'>{rangeStatus[key] === 'invalid' ? t('invalid') : undefined}</div>
      </div>
    );
  };

  useEffect(() => {
    if (value) {
      setRange(value);
      setLabel(describeTimeRange(value, dateFormat));
    }
  }, [JSON.stringify(value), visible]);

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
                    {renderSinglePicker('start')}
                    {renderSinglePicker('end')}
                    <div className='flashcat-timeRangePicker-absolute-history'>
                      <span>{t('history')}</span>
                      <ul style={{ marginTop: 8 }}>
                        {_.map(absoluteHistoryCache, (range, idx) => {
                          return (
                            <li
                              key={range.start + range.end + idx}
                              onClick={() => {
                                const newValue = {
                                  start: isMathString(range.start) ? range.start : moment(range.start),
                                  end: isMathString(range.end) ? range.end : moment(range.end),
                                };
                                setRange(newValue);
                                onChange(newValue);
                                setAbsoluteHistoryCache(newValue, dateFormat);
                                setVisible(false);
                              }}
                            >
                              {describeTimeRange(range, dateFormat)}
                            </li>
                          );
                        })}
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
                        _.filter(rangeOptions, (item) => {
                          const display = t(`rangeOptions.${item.display}`);
                          return display.indexOf(searchValue) > -1;
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
            <div className='flashcat-timeRangePicker-footer'>
              <Button
                type='primary'
                onClick={() => {
                  if (rangeStatus.start !== 'invalid' && rangeStatus.end !== 'invalid') {
                    onChange(range as IRawTimeRange);
                    setVisible(false);
                  }
                }}
              >
                {t('ok')}
              </Button>
              {extraFooter && extraFooter(setVisible)}
            </div>
          </>
        }
        trigger='click'
        placement='bottomRight'
        visible={visible}
        onVisibleChange={(v) => {
          setVisible(v);
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
        >
          {props.label || label || placeholder}
          {!props.label && (
            <span className='flashcat-timeRangePicker-target-icon'>
              {visible ? <UpOutlined /> : <DownOutlined />}
              <CloseCircleOutlined
                onClick={(e) => {
                  e.nativeEvent.stopImmediatePropagation();
                  e.stopPropagation();
                  setRange(undefined);
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
