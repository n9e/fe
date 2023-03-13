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
import { ITimeOption, TDurationUnit } from './types';

export const spans: { [key: string]: { display: string } } = {
  s: { display: 'second' },
  m: { display: 'minute' },
  h: { display: 'hour' },
  d: { display: 'day' },
  w: { display: 'week' },
  M: { display: 'month' },
  y: { display: 'year' },
};

export const rangeOptions: ITimeOption[] = [
  { start: 'now-1m', end: 'now', display: 'Last 1 minute' },
  { start: 'now-2m', end: 'now', display: 'Last 2 minutes' },
  { start: 'now-3m', end: 'now', display: 'Last 3 minutes' },
  { start: 'now-5m', end: 'now', display: 'Last 5 minutes' },
  { start: 'now-15m', end: 'now', display: 'Last 15 minutes' },
  { start: 'now-30m', end: 'now', display: 'Last 30 minutes' },
  { start: 'now-1h', end: 'now', display: 'Last 1 hour' },
  { start: 'now-3h', end: 'now', display: 'Last 3 hours' },
  { start: 'now-6h', end: 'now', display: 'Last 6 hours' },
  { start: 'now-12h', end: 'now', display: 'Last 12 hours' },
  { start: 'now-24h', end: 'now', display: 'Last 24 hours' },
  { start: 'now-2d', end: 'now', display: 'Last 2 days' },
  { start: 'now-7d', end: 'now', display: 'Last 7 days' },
  { start: 'now-30d', end: 'now', display: 'Last 30 days' },
  { start: 'now-90d', end: 'now', display: 'Last 90 days' },
  { start: 'now-1d/d', end: 'now-1d/d', display: 'Yesterday' },
  { start: 'now-2d/d', end: 'now-2d/d', display: 'Day before yesterday' },
  { start: 'now-7d/d', end: 'now-7d/d', display: 'This day last week' },
  { start: 'now-1w/w', end: 'now-1w/w', display: 'Previous week' },
  { start: 'now-1M/M', end: 'now-1M/M', display: 'Previous month' },
  { start: 'now/d', end: 'now/d', display: 'Today' },
  { start: 'now/d', end: 'now', display: 'Today so far' },
  { start: 'now/w', end: 'now/w', display: 'This week' },
  { start: 'now/w', end: 'now', display: 'This week so far' },
  { start: 'now/M', end: 'now/M', display: 'This month' },
  { start: 'now/M', end: 'now', display: 'This month so far' },
];

export const momentLocaleZhCN = {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
};

export const units: TDurationUnit[] = ['y', 'M', 'w', 'd', 'h', 'm', 's', 'Q'];
