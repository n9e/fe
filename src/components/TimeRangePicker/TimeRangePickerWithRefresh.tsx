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
import React from 'react';
import { Space } from 'antd';
import _ from 'lodash';

import { useGlobalVar } from '@/utils/useHook';

import AutoRefresh from './AutoRefresh';
import TimeRangePicker from './TimeRangePicker';
import { ITimeRangePickerWithRefreshProps } from './types';
import { valueAsString } from './utils';

export default function TimeRangePickerWithRefresh(props: ITimeRangePickerWithRefreshProps) {
  const { value, onChange, style, refreshTooltip, dateFormat = 'YYYY-MM-DD HH:mm', localKey } = props;
  const [globalVar] = useGlobalVar();

  return (
    <Space style={style}>
      <AutoRefresh
        localKey={localKey && `${localKey}_refresh`}
        tooltip={refreshTooltip}
        onRefresh={() => {
          if (value && onChange) {
            onChange({
              ...value,
              refreshFlag: _.uniqueId('refreshFlag_ '),
            });
          }
        }}
        intervalSeconds={props.intervalSeconds}
        onIntervalSecondsChange={props.onIntervalSecondsChange}
      />
      <TimeRangePicker
        limitHour={globalVar.RangePickerHour ? Number(globalVar.RangePickerHour) : undefined}
        {..._.omit(props, ['style'])}
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
    </Space>
  );
}
