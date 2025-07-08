import moment from 'moment';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

function adjustStep(step: number, minStep: number, range: number) {
  // Prometheus 限制最大点数是 11000
  let safeStep = range / 11000;
  if (safeStep > 1) {
    safeStep = Math.ceil(safeStep);
  }
  return Math.max(step, minStep, safeStep);
}

export function getRealStep(options: { minStep?: number; maxDataPoints?: number; fromUnix: number; toUnix: number }) {
  const { maxDataPoints = 240, minStep = 15, fromUnix, toUnix } = options;
  const range = toUnix - fromUnix;
  const step = Math.max(Math.floor(range / maxDataPoints), 1);
  return adjustStep(step, minStep, range);
}

export function interpolateString(options: { query: string; range?: IRawTimeRange; minStep?: number; maxDataPoints?: number }) {
  const { query, range, minStep = 15, maxDataPoints } = options;
  if (range) {
    const parsedRange = parseRange(range);
    const from = moment(parsedRange.start);
    const fromMs = from.valueOf();
    const fromUnix = moment(from).unix();
    const fromDateISO = from.toISOString();
    const to = moment(parsedRange.end);
    const toMs = to.valueOf();
    const toUnix = moment(to).unix();
    const toDateISO = to.toISOString();
    const interval = getRealStep({
      minStep,
      maxDataPoints,
      fromUnix,
      toUnix,
    });

    return query
      .replace(/\$__from/g, `${fromMs}`)
      .replace(/\$__from_date_seconds/g, `${fromUnix}`)
      .replace(/\$__from_date_iso/g, fromDateISO)
      .replace(/\$__from_date/g, `${fromDateISO}`)
      .replace(/\$__to/g, `${toMs}`)
      .replace(/\$__to_date_seconds/g, `${toUnix}`)
      .replace(/\$__to_date_iso/g, toDateISO)
      .replace(/\$__to_date/g, `${toDateISO}`)
      .replace(/\$__interval/g, `${interval}s`)
      .replace(/\$__interval_ms/g, `${interval * 1000}ms`)
      .replace(/\$__rate_interval/g, `${interval * 4}s`)
      .replace(/\$__range/g, `${toUnix - fromUnix}s`)
      .replace(/\$__range_s/g, `${toUnix - fromUnix}s`)
      .replace(/\$__range_ms/g, `${(toUnix - fromUnix) * 1000}ms`);
  }

  return query.replace(/\$__interval/g, `${minStep}s`).replace(/\$__rate_interval/g, `${minStep * 4}s`);
}

export function instantInterpolateString(options: { query: string; time?: moment.Moment }) {
  const { query, time } = options;
  const currentTime = time || moment();
  const currentTimeMs = currentTime.valueOf();
  const currentTimeUnix = currentTime.unix();
  const currentTimeDateISO = currentTime.toISOString();

  return query
    .replace(/\$__from/g, `${currentTimeMs}`)
    .replace(/\$__from_date_seconds/g, `${currentTimeUnix}`)
    .replace(/\$__from_date_iso/g, currentTimeDateISO)
    .replace(/\$__from_date/g, `${currentTimeDateISO}`)
    .replace(/\$__to/g, `${currentTimeMs}`)
    .replace(/\$__to_date_seconds/g, `${currentTimeUnix}`)
    .replace(/\$__to_date_iso/g, currentTimeDateISO)
    .replace(/\$__to_date/g, `${currentTimeDateISO}`)
    .replace(/\$__interval/g, '5m')
    .replace(/\$__interval_ms/g, '5m')
    .replace(/\$__rate_interval/g, '5m');
}

export function includesVariables(query: string) {
  const variablesNames = ['__interval', '__rate_interval', '__range'];
  if (!query || !variablesNames || variablesNames.length === 0) {
    return false;
  }
  return variablesNames.some((name) => {
    const variablePattern = new RegExp(`\\$${name}\\b`);
    return variablePattern.test(query);
  });
}
