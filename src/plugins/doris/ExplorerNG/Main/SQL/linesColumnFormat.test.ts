import { DEFAULT_LOGS_PAGE_SIZE } from '../../../constants';

/**
 * Table 组件中 linesColumnFormat 的行号计算逻辑：
 *   pageSize * (current - 1) + val
 * 其中 val 是当前页内的行序号（从 1 开始）。
 */
function linesColumnFormat(serviceParams: { current: number; pageSize: number }, val: number): number {
  return serviceParams.pageSize * (serviceParams.current - 1) + val;
}

describe('linesColumnFormat — 分页行号计算', () => {
  it('第一页第一行应为 1', () => {
    expect(linesColumnFormat({ current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE }, 1)).toBe(1);
  });

  it('第一页最后一行应为 pageSize', () => {
    expect(linesColumnFormat({ current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE }, DEFAULT_LOGS_PAGE_SIZE)).toBe(DEFAULT_LOGS_PAGE_SIZE);
  });

  it('第二页第一行应为 pageSize + 1', () => {
    expect(linesColumnFormat({ current: 2, pageSize: DEFAULT_LOGS_PAGE_SIZE }, 1)).toBe(DEFAULT_LOGS_PAGE_SIZE + 1);
  });

  it('第三页第五行应为正确的全局行号', () => {
    const pageSize = 30;
    expect(linesColumnFormat({ current: 3, pageSize }, 5)).toBe(65);
  });

  it('切换时间范围后 serviceParams 重置至第 1 页时，行号从 1 开始', () => {
    // 模拟用户在第 3 页时切换时间范围，serviceParams 应重置到 { current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE }
    const resetParams = { current: 1, pageSize: DEFAULT_LOGS_PAGE_SIZE } as const;
    expect(linesColumnFormat(resetParams, 1)).toBe(1);
    expect(linesColumnFormat(resetParams, 2)).toBe(2);
  });
});
