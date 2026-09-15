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
import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

export function JSONParse(str: string): unknown {
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error(e);
    }
  }
  return {};
}

export function getDefaultStepByTime(
  time: IRawTimeRange,
  options: {
    panelWidth?: number;
    maxDataPoints?: number;
  },
) {
  let maxDataPoints = options.maxDataPoints ?? options.panelWidth ?? 240;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  return Math.max(Math.floor((end - start) / maxDataPoints), 1);
}

// 旧 Grafana 导入转换逻辑已迁移至 ./grafanaImport（迁移到 schema 42 + 真 4.0.0 映射 + 报告）。

export { convertDashboardGrafanaToN9E, convertDashboardGrafanaToN9EWithReport, checkGrafanaDashboardVersion } from './grafanaImport';
