import moment, { Moment } from 'moment';
import { normalizeTime } from '@/pages/alertRules/utils';

function calculateFixedInterval(startTime: number, endTime: number, desiredDataPoints: number) {
  const totalDuration = endTime - startTime; // 总时长，单位为秒
  const initialInterval = totalDuration / desiredDataPoints; // 初步时间间隔，单位为秒

  // 将初步时间间隔转换为最接近的允许间隔
  const intervals = [
    { label: '1s', value: 1 },
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '10m', value: 600 },
    { label: '30m', value: 1800 },
    { label: '1h', value: 3600 },
    { label: '6h', value: 21600 },
    { label: '1d', value: 86400 },
  ];

  let fixedInterval = intervals[0].value;
  for (let i = 0; i < intervals.length; i++) {
    if (initialInterval <= intervals[i].value) {
      fixedInterval = intervals[i].value;
      break;
    }
  }

  return fixedInterval;
}

export function normalizeInterval(
  parsedRange: {
    start?: Moment;
    end?: Moment;
  },
  interval: number | null,
  unit: 'second' | 'min' | 'hour',
) {
  if (interval) {
    return normalizeTime(interval, unit);
  }
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  return calculateFixedInterval(start, end, 100);
}
