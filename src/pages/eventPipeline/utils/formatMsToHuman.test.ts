import formatMsToHuman from './formatMsToHuman';

describe('formatMsToHuman', () => {
  // 调用方（执行记录列表 / 详情 / 逐节点结果）都用默认参数，等价于紧凑 + 带毫秒
  it('formats sub-second durations compactly', () => {
    expect(formatMsToHuman(5)).toBe('5ms');
    expect(formatMsToHuman(999)).toBe('999ms');
  });

  it('formats compound durations', () => {
    expect(formatMsToHuman(1234)).toBe('1s234ms');
    expect(formatMsToHuman(3661000)).toBe('1h1m1s');
  });

  // 亚毫秒执行返回 0，必须仍然是一个耗时读数，且与其它取值同一种写法
  it('renders zero as a compact duration, not an English sentence', () => {
    expect(formatMsToHuman(0)).toBe('0ms');
  });

  it('keeps the verbose form when compact is off', () => {
    expect(formatMsToHuman(0, { compact: false, showMs: true })).toBe('0 milliseconds');
    expect(formatMsToHuman(0, { compact: false, showMs: false })).toBe('0 seconds');
  });

  it('rejects non-numeric input', () => {
    expect(() => formatMsToHuman(undefined as unknown as number)).toThrow(TypeError);
    expect(() => formatMsToHuman(NaN)).toThrow(TypeError);
  });
});
