import moment from 'moment';

import { getDefaultStepByStartAndEnd } from '@/pages/dashboard/VariableConfig/constant';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

export function interpolateString(options: { query: string; range?: IRawTimeRange; step?: number }) {
  const { query, range, step } = options;
  if (range) {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    const interval = step ? step : getDefaultStepByStartAndEnd(start, end);

    return query
      .replace(/\$__interval/g, `${interval}s`)
      .replace(/\$__rate_interval/g, `${interval * 4}s`)
      .replace(/\$__range/g, `${end - start}s`);
  }
  if (step) {
    return query.replace(/\$__interval/g, `${step}s`).replace(/\$__rate_interval/g, `${step * 4}s`);
  }
  return query;
}
