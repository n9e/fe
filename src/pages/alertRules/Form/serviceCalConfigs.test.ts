import moment from 'moment';
import { isFullDayTimeRange, hasLegacyTimeRange, normalizeServiceCalConfigs, formatServiceCalConfigs } from './serviceCalConfigs';

describe('isFullDayTimeRange', () => {
  it('缺省 / 00:00-00:00 / 00:00-23:59 都是全天', () => {
    expect(isFullDayTimeRange(undefined)).toBe(true);
    expect(isFullDayTimeRange({ start: '', end: '' })).toBe(true);
    expect(isFullDayTimeRange({ start: '00:00', end: '00:00' })).toBe(true);
    expect(isFullDayTimeRange({ start: '00:00', end: '23:59' })).toBe(true);
    expect(isFullDayTimeRange({ start: moment('00:00', 'HH:mm'), end: moment('23:59', 'HH:mm') })).toBe(true);
  });

  it('其他时段不是全天', () => {
    expect(isFullDayTimeRange({ start: '09:00', end: '18:00' })).toBe(false);
    expect(isFullDayTimeRange({ start: '00:00', end: '18:00' })).toBe(false);
    expect(isFullDayTimeRange({ start: '01:00', end: '23:59' })).toBe(false);
    expect(isFullDayTimeRange({ start: moment('09:00', 'HH:mm'), end: moment('18:00', 'HH:mm') })).toBe(false);
  });
});

describe('normalizeServiceCalConfigs', () => {
  it('全天分组合并成一组、不带时段', () => {
    const result = normalizeServiceCalConfigs([
      { service_cal_ids: [1, 2], time_range: { start: '00:00', end: '00:00' } },
      { service_cal_ids: [2, 3], time_range: { start: '00:00', end: '23:59' } },
      { service_cal_ids: [4] },
    ]);
    expect(result).toEqual([{ service_cal_ids: [1, 2, 3, 4] }]);
  });

  it('存量非全天时段：保留分组，时段转 Moment', () => {
    const result = normalizeServiceCalConfigs([
      { service_cal_ids: [1], time_range: { start: '09:00', end: '18:00' } },
      { service_cal_ids: [2], time_range: { start: '00:00', end: '00:00' } },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].service_cal_ids).toEqual([1]);
    expect(result[0].time_range.start.format('HH:mm')).toBe('09:00');
    expect(result[0].time_range.end.format('HH:mm')).toBe('18:00');
    expect(result[1].time_range.start.format('HH:mm')).toBe('00:00');
    expect(hasLegacyTimeRange(result)).toBe(true);
  });

  it('空分组丢弃；全空返回空数组', () => {
    expect(normalizeServiceCalConfigs([{ service_cal_ids: [] }])).toEqual([]);
    expect(normalizeServiceCalConfigs(undefined)).toEqual([]);
  });

  it('service_cal_configs 为空时回落到更早的 service_cal_ids', () => {
    expect(normalizeServiceCalConfigs([], [5, 6])).toEqual([{ service_cal_ids: [5, 6] }]);
    // configs 非空时后端不读老字段，这里也不合并
    expect(normalizeServiceCalConfigs([{ service_cal_ids: [1] }], [5])).toEqual([{ service_cal_ids: [1] }]);
  });
});

describe('formatServiceCalConfigs', () => {
  it('全天时段不落库，空分组丢弃', () => {
    const result = formatServiceCalConfigs([
      { service_cal_ids: [1], time_range: { start: moment('00:00', 'HH:mm'), end: moment('00:00', 'HH:mm') } },
      { service_cal_ids: [2], time_range: { start: moment('00:00', 'HH:mm'), end: moment('23:59', 'HH:mm') } },
      { service_cal_ids: [3] },
      { service_cal_ids: [] },
    ]);
    expect(result).toEqual([{ service_cal_ids: [1] }, { service_cal_ids: [2] }, { service_cal_ids: [3] }]);
  });

  it('非全天时段原样保留为 HH:mm', () => {
    const result = formatServiceCalConfigs([{ service_cal_ids: [1], time_range: { start: moment('09:00', 'HH:mm'), end: moment('18:00', 'HH:mm') } }]);
    expect(result).toEqual([{ service_cal_ids: [1], time_range: { start: '09:00', end: '18:00' } }]);
  });
});
