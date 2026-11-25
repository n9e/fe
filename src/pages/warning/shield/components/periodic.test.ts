import moment from 'moment';

import { LAST_DAY_OF_MONTH, sortDaysOfMonth, toPeriodicMuteRow, hasMissingDaysOfMonth, isCrossMidnight, getNextPeriodicWindows, formatWindow } from './periodic';

const at = (s: string) => moment(s, 'YYYY-MM-DD HH:mm');
const windows = (rows, now: string, count = 3) => getNextPeriodicWindows(rows, at(now), count).map(formatWindow);

describe('sortDaysOfMonth', () => {
  it('按日期升序、最后一天排末尾并去重', () => {
    expect(sortDaysOfMonth([15, LAST_DAY_OF_MONTH, 1, 15])).toEqual([1, 15, LAST_DAY_OF_MONTH]);
    expect(sortDaysOfMonth(undefined)).toEqual([]);
  });
});

describe('hasMissingDaysOfMonth', () => {
  it('选了 29~31 号才提示', () => {
    expect(hasMissingDaysOfMonth([1, 28, LAST_DAY_OF_MONTH])).toBe(false);
    expect(hasMissingDaysOfMonth([29])).toBe(true);
  });
});

describe('isCrossMidnight', () => {
  const row = (stime: string, etime: string) => ({ enable_stime: at(`2026-01-01 ${stime}`), enable_etime: at(`2026-01-01 ${etime}`) });

  it('开始晚于结束算跨天，结束于 00:00 表示到当天结束', () => {
    expect(isCrossMidnight(row('23:00', '03:00'))).toBe(true);
    expect(isCrossMidnight(row('23:00', '00:00'))).toBe(false);
    expect(isCrossMidnight(row('00:00', '00:00'))).toBe(false);
  });
});

describe('toPeriodicMuteRow', () => {
  it('按周的行只带星期', () => {
    expect(toPeriodicMuteRow({ enable_days_of_week: ['1', '2'], enable_days_of_month: [3], enable_stime: at('2026-01-01 00:00'), enable_etime: at('2026-01-01 06:00') })).toEqual({
      cycle: 'week',
      enable_days_of_week: '1 2',
      enable_days_of_month: [],
      enable_stime: '00:00',
      enable_etime: '06:00',
    });
  });

  it('按月的行不带星期，避免旧版本节点按星期误匹配', () => {
    expect(
      toPeriodicMuteRow({
        cycle: 'month',
        enable_days_of_week: ['1'],
        enable_days_of_month: [LAST_DAY_OF_MONTH, 1],
        enable_stime: at('2026-01-01 00:00'),
        enable_etime: at('2026-01-01 06:00'),
      }),
    ).toEqual({
      cycle: 'month',
      enable_days_of_week: '',
      enable_days_of_month: [1, LAST_DAY_OF_MONTH],
      enable_stime: '00:00',
      enable_etime: '06:00',
    });
  });
});

describe('getNextPeriodicWindows', () => {
  const monthly = (days: number[], stime = '00:00', etime = '06:00') => ({ cycle: 'month' as const, enable_days_of_month: days, enable_stime: stime, enable_etime: etime });

  it('按月：1 号、15 号、最后一天', () => {
    expect(windows([monthly([1, 15, LAST_DAY_OF_MONTH])], '2026-11-25 10:00')).toEqual(['2026-11-30 00:00 ~ 06:00', '2026-12-01 00:00 ~ 06:00', '2026-12-15 00:00 ~ 06:00']);
  });

  it('包含正在生效的时段', () => {
    expect(windows([monthly([25])], '2026-11-25 03:00', 1)).toEqual(['2026-11-25 00:00 ~ 06:00']);
  });

  it('31 号跳过没有 31 号的月份', () => {
    expect(windows([monthly([31], '00:00', '23:59')], '2027-01-31 12:00', 2)).toEqual(['2027-01-31 00:00 ~ 24:00', '2027-03-31 00:00 ~ 24:00']);
  });

  it('最后一天按当月天数计算', () => {
    expect(windows([monthly([LAST_DAY_OF_MONTH])], '2028-02-01 00:00', 1)).toEqual(['2028-02-29 00:00 ~ 06:00']);
  });

  it('按周跨天时段沿用当天语义', () => {
    expect(windows([{ cycle: 'week', enable_days_of_week: '1', enable_stime: '22:00', enable_etime: '02:00' }], '2026-11-23 01:00')).toEqual([
      '2026-11-23 00:00 ~ 02:00',
      '2026-11-23 22:00 ~ 24:00',
      '2026-11-30 00:00 ~ 02:00',
    ]);
  });

  it('结束于 00:00 的行不产生空时段', () => {
    expect(windows([{ cycle: 'week', enable_days_of_week: '1', enable_stime: '22:00', enable_etime: '00:00' }], '2026-11-25 10:00')).toEqual([
      '2026-11-30 22:00 ~ 24:00',
      '2026-12-07 22:00 ~ 24:00',
      '2026-12-14 22:00 ~ 24:00',
    ]);
    expect(windows([monthly([LAST_DAY_OF_MONTH], '23:00', '00:00')], '2026-11-25 10:00', 1)).toEqual(['2026-11-30 23:00 ~ 24:00']);
  });

  it('混合按周和按月，按时间排序', () => {
    const rows = [{ cycle: 'week' as const, enable_days_of_week: '6 0', enable_stime: '00:00', enable_etime: '00:00' }, monthly([1])];
    expect(windows(rows, '2026-11-27 12:00')).toEqual(['2026-11-28 00:00 ~ 24:00', '2026-11-29 00:00 ~ 24:00', '2026-12-01 00:00 ~ 06:00']);
  });

  it('未填完整的行不产生时段', () => {
    expect(windows([{ cycle: 'month', enable_days_of_month: [1] }], '2026-11-25 10:00')).toEqual([]);
  });
});
