import { getRangeHourBucket } from './rangeHourBucket';

const at = (iso: string) => new Date(iso).getTime();

describe('getRangeHourBucket', () => {
  it('时间范围缺失时返回空串', () => {
    expect(getRangeHourBucket(undefined, undefined)).toBe('');
    expect(getRangeHourBucket(at('2026-09-16T10:00:00Z'), undefined)).toBe('');
    expect(getRangeHourBucket(undefined, at('2026-09-16T11:00:00Z'))).toBe('');
  });

  it('同一小时内的范围落在同一个桶', () => {
    expect(getRangeHourBucket(at('2026-09-16T10:00:00Z'), at('2026-09-16T11:00:00Z'))).toBe(
      getRangeHourBucket(at('2026-09-16T10:59:59Z'), at('2026-09-16T11:59:59Z')),
    );
  });

  // 这条是本函数存在的理由：相对范围（"最近 1 小时"）的字面值不变，但解析出来的绝对窗口
  // 一直在走。23:30 和次日 00:30 的"最近 1 小时"覆盖的是不同的日分区，字段集可能不同，
  // 必须落到不同的桶上才会重取。
  it('相对范围滚过小时边界后落到不同的桶', () => {
    const before = getRangeHourBucket(at('2026-09-16T22:30:00Z'), at('2026-09-16T23:30:00Z'));
    const after = getRangeHourBucket(at('2026-09-16T23:30:00Z'), at('2026-09-17T00:30:00Z'));
    expect(before).not.toBe(after);
  });

  it('起止分别变化都会改变桶', () => {
    const base = getRangeHourBucket(at('2026-09-16T10:00:00Z'), at('2026-09-16T11:00:00Z'));
    expect(getRangeHourBucket(at('2026-09-16T09:00:00Z'), at('2026-09-16T11:00:00Z'))).not.toBe(base);
    expect(getRangeHourBucket(at('2026-09-16T10:00:00Z'), at('2026-09-16T12:00:00Z'))).not.toBe(base);
  });
});
