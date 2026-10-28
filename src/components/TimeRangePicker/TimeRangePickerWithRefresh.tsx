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
import React, { useContext } from 'react';
import { CommonStateContext } from '@/App';
import { Space } from 'antd';
import _ from 'lodash';

import { useGlobalVar } from '@/utils/useHook';

import AutoRefresh from './AutoRefresh';
import TimeRangePicker from './TimeRangePicker';
import { ITimeRangePickerWithRefreshProps } from './types';
import { valueAsString } from './utils';

export default function TimeRangePickerWithRefresh(props: ITimeRangePickerWithRefreshProps) {
  const { value, onChange, style, refreshTooltip, intervalTooltip, showRefreshButton = true, localKey, onRefresh } = props;
  const [globalVar] = useGlobalVar();
  const { rangePickerShowSecond } = useContext(CommonStateContext);
  const dateFormat =
    props.dateFormat || (props.showMillisecond ? 'YYYY-MM-DD HH:mm:ss.SSS' : props.showSecond ?? rangePickerShowSecond ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm');

  return (
    <Space style={style}>
      {showRefreshButton && (
        <AutoRefresh
          disabled={props.disabled}
          loading={props.loading}
          localKey={localKey && `${localKey}_refresh`}
          tooltip={refreshTooltip}
          intervalTooltip={intervalTooltip}
          onRefresh={() => {
            if (value && onChange) {
              onChange({
                ...value,
                refreshFlag: _.uniqueId('refreshFlag_'),
              });
            }
            return onRefresh?.();
          }}
          intervalSeconds={props.intervalSeconds}
          intervalOptions={props.intervalOptions}
          onIntervalSecondsChange={props.onIntervalSecondsChange}
        />
      )}
      <span style={{ display: 'inline-flex' }}>
        <TimeRangePicker
          showSecond={rangePickerShowSecond}
          dateFormat={dateFormat}
          limitHour={globalVar.RangePickerHour ? Number(globalVar.RangePickerHour) : undefined}
          {..._.omit(props, [
            'style',
            'refreshTooltip',
            'intervalTooltip',
            'loading',
            'showRefreshButton',
            'intervalSeconds',
            'intervalOptions',
            'onIntervalSecondsChange',
            'onRefresh',
          ])}
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
      </span>
    </Space>
  );
}
