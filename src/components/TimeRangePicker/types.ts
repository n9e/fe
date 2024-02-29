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
import { Moment } from 'moment';

export type TDurationUnit =
  | 'year'
  | 'years'
  | 'y'
  | 'month'
  | 'months'
  | 'M'
  | 'week'
  | 'weeks'
  | 'isoWeek'
  | 'w'
  | 'day'
  | 'days'
  | 'd'
  | 'hour'
  | 'hours'
  | 'h'
  | 'minute'
  | 'minutes'
  | 'm'
  | 'second'
  | 'seconds'
  | 's'
  | 'millisecond'
  | 'milliseconds'
  | 'ms'
  | 'quarter'
  | 'quarters'
  | 'Q';

export interface ITimeOption {
  start: string;
  end: string;
  display: string;
}

export interface IRawTimeRange {
  start: string | Moment;
  end: string | Moment;
  refreshFlag?: string; // 用于自动刷新场景
}

export interface ITimeRangePickerProps {
  style?: object;
  localKey?: string;
  value?: IRawTimeRange;
  dateFormat?: string;
  onChange?: (value: IRawTimeRange) => void;
  placeholder?: string;
  allowClear?: boolean;
  onClear?: () => void;
  label?: React.ReactElement;
  extraFooter?: (fn: Function) => React.ReactElement;
  disabled?: boolean;
  ajustTimeOptions?: (options: ITimeOption[]) => ITimeOption[];
}

export interface ITimeRangePickerWithRefreshProps extends ITimeRangePickerProps {
  refreshTooltip?: string;
  intervalSeconds?: number;
  onIntervalSecondsChange?: (value: number) => void;
}
