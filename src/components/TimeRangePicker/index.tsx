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
/**
 * 时间选择器组件
 * 时间范围默认值：如果开启了本地缓存，需要调用 getDefaultValue(localKey: string, defaultValue: IRawTimeRange) 来获取真实的默认值
 */
import React from 'react';
import TimeRangePicker from './TimeRangePicker';
import { IRawTimeRange } from './types';
import TimeRangePickerWithRefresh from './TimeRangePickerWithRefresh';
import { parseRange, parse, valueAsString, isMathString, timeRangeUnix, describeTimeRange, isValid } from './utils';
import { ITimeRangePickerProps } from './types';
import { mapOptionToRelativeTimeRange, mapRelativeTimeRangeToOption } from './RelativeTimeRangePicker/utils';
import RelativeTimeRangePicker from './RelativeTimeRangePicker';
import AutoRefresh from './AutoRefresh';
import './locale';

export { AutoRefresh };

export default function index(props: ITimeRangePickerProps) {
  const { localKey, dateFormat = 'YYYY-MM-DD HH:mm', onChange } = props;

  return (
    <TimeRangePicker
      {...props}
      onChange={(val) => {
        if (localKey) {
          localStorage.setItem(
            localKey,
            val
              ? JSON.stringify({
                  start: valueAsString(val.start, dateFormat),
                  end: valueAsString(val.end, dateFormat),
                })
              : '',
          );
        }
        if (onChange) {
          onChange(val);
        }
      }}
    />
  );
}

export type { IRawTimeRange } from './types';
export function getDefaultValue(localKey: string, defaultValue: IRawTimeRange) {
  const localeValue = localStorage.getItem(localKey);
  if (localeValue) {
    try {
      return JSON.parse(localeValue);
    } catch (e) {
      return defaultValue;
    }
  }
  return defaultValue;
}
export {
  TimeRangePickerWithRefresh,
  RelativeTimeRangePicker,
  parseRange,
  parse,
  isMathString,
  timeRangeUnix,
  describeTimeRange,
  mapOptionToRelativeTimeRange,
  mapRelativeTimeRangeToOption,
  isValid,
};
