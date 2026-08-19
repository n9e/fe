import moment from 'moment';

import type { IRawTimeRange } from '@/components/TimeRangePicker';
import { parseRange } from '@/components/TimeRangePicker/utils';

const adjustStep = (step: number, minStep: number, range: number) => {
  // Prometheus 限制最大点数是 11000。
  const safeStep = range > 11000 ? Math.ceil(range / 11000) : range / 11000;
  return Math.max(step, minStep, safeStep);
};

/** 新版 query-batch 请求使用的步长计算，不依赖旧版数据源执行器。 */
export function getDashboardQueryStep(options: { time: IRawTimeRange; maxDataPoints?: number; panelWidth?: number; minStep?: number }) {
  const parsedRange = parseRange(options.time);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  const maxDataPoints = options.maxDataPoints ?? options.panelWidth ?? 240;
  const step = Math.max(Math.floor((end - start) / maxDataPoints), 1);
  return adjustStep(step, options.minStep ?? 15, end - start);
}
