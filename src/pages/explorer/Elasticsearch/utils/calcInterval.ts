import { Moment } from 'moment';

export default function calcInterval(
  start: Moment,
  end: Moment,
): {
  value: number;
  unit: 'second' | 'min' | 'hour' | 'day';
} {
  const duration = end.diff(start, 'seconds');
  /**
   * 1分钟以内，返回 1s
   * 5分钟以内，返回 5s
   * 30分钟以内，返回 30s
   * 1小时以内，返回 1min
   * 6小时以内，返回 5min
   * 12小时以内，返回 10min
   * 1天以内，返回 30min
   * 2天以内，返回 1hour
   * 7天以内，返回 3hour
   * 30天以内，返回 12hour
   * 其他，返回 1day
   */
  if (duration <= 60) {
    return { value: 1, unit: 'second' };
  }
  if (duration <= 300) {
    return { value: 5, unit: 'second' };
  }
  if (duration <= 1800) {
    return { value: 30, unit: 'second' };
  }
  if (duration <= 3600) {
    return { value: 1, unit: 'min' };
  }
  if (duration <= 21600) {
    return { value: 5, unit: 'min' };
  }
  if (duration <= 43200) {
    return { value: 10, unit: 'min' };
  }
  if (duration <= 86400) {
    return { value: 30, unit: 'min' };
  }
  if (duration <= 172800) {
    return { value: 1, unit: 'hour' };
  }
  if (duration <= 604800) {
    return { value: 3, unit: 'hour' };
  }
  if (duration <= 2592000) {
    return { value: 12, unit: 'hour' };
  }
  return { value: 1, unit: 'day' };
}
