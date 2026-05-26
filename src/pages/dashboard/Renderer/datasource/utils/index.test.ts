import { completeBreakpoints, getSerieName } from './index';

describe('completeBreakpoints', () => {
  it('透传无缺口的数据', () => {
    const input = [
      [1000, 1],
      [1001, 2],
      [1002, 3],
    ] as const;
    expect(completeBreakpoints(1, input)).toEqual(input);
  });

  it('在单个缺口处插入 null', () => {
    const input = [
      [1000, 1],
      [1001, 2],
      [1003, 4],
    ] as const;
    const result = completeBreakpoints(1, input);
    expect(result).toEqual([
      [1000, 1],
      [1001, 2],
      [1002, null],
      [1003, 4],
    ]);
  });

  it('多个步骤的缺口只插入一个 null', () => {
    // t0→t4 中间缺 t1,t2,t3，但只补一个 t1→null 即可让 uPlot 断开
    const input = [
      [1000, 1],
      [1004, 5],
    ] as const;
    const result = completeBreakpoints(1, input);
    expect(result).toEqual([
      [1000, 1],
      [1001, null],
      [1004, 5],
    ]);
  });

  it('空数组返回空数组', () => {
    expect(completeBreakpoints(1, [])).toEqual([]);
  });

  it('单个数据点直接透传', () => {
    const input = [[1000, 42]] as const;
    expect(completeBreakpoints(1, input)).toEqual(input);
  });

  it('step 为 undefined 时透传原数据', () => {
    const input = [
      [1000, 1],
      [1003, 4],
    ] as const;
    // prev[0] + undefined = NaN, NaN < item[0] 为 false，所以不走补齐
    expect(completeBreakpoints(undefined, input)).toEqual(input);
  });

  it('多个连续的缺口段各自只补一个 null', () => {
    const input = [
      [1000, 1],
      [1003, 4], // 缺 1001,1002 → 补 1001
      [1006, 7], // 缺 1004,1005 → 补 1004
    ] as const;
    const result = completeBreakpoints(1, input);
    expect(result).toEqual([
      [1000, 1],
      [1001, null],
      [1003, 4],
      [1004, null],
      [1006, 7],
    ]);
  });

  it('step 较大时也能正确计算缺口', () => {
    const input = [
      [1000, 10],
      [1030, 20], // 缺 1020（1000+20<1030）
    ] as const;
    const result = completeBreakpoints(20, input);
    expect(result).toEqual([
      [1000, 10],
      [1020, null],
      [1030, 20],
    ]);
  });

  it('恰好等于 step 时不视为缺口', () => {
    const input = [
      [1000, 1],
      [1002, 3], // 1000 + 2 === 1002，不缺
    ] as const;
    expect(completeBreakpoints(2, input)).toEqual(input);
  });
});
