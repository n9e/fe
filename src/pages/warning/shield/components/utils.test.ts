jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import _ from 'lodash';
import { processFormValues } from './utils';

// ---------- dependency mocks ----------

jest.mock('moment', () => {
  const mockVal = { format: jest.fn().mockReturnValue('00:00'), unix: jest.fn().mockReturnValue(1000000) };
  const mockFn: any = jest.fn(() => mockVal);
  mockFn.fn = jest.fn();
  return { __esModule: true, default: mockFn, fn: mockFn.fn };
});

// ---------- processFormValues 回归测试 ----------

describe('processFormValues (屏蔽规则)', () => {
  /**
   * 核心回归测试：不修改原始输入对象
   */
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      btime: 1000000,
      etime: 2000000,
      periodic_mutes: [
        {
          enable_days_of_week: ['1', '2', '3'],
          enable_stime: '00:00',
          enable_etime: '01:00',
        },
      ],
    } as const;
    const inputClone = _.cloneDeep(input);

    processFormValues(input);

    expect(input).toEqual(inputClone);
  });

  /**
   * 核心回归测试：多次调用结果一致（幂等性）
   */
  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      btime: 1000000,
      etime: 2000000,
      periodic_mutes: [
        {
          enable_days_of_week: ['1', '2', '3'],
          enable_stime: '00:00',
          enable_etime: '01:00',
        },
      ],
    } as const;

    const result1 = processFormValues(input);
    const result2 = processFormValues(input);

    expect(result1).toEqual(result2);
  });

  /**
   * 验证 periodic_mutes 数组 join 转换正确
   */
  it('应正确转换 periodic_mutes 中的 enable_days_of_week', () => {
    const input = {
      btime: 1000000,
      etime: 2000000,
      periodic_mutes: [
        {
          enable_days_of_week: ['1', '2', '3'],
          enable_stime: '00:00',
          enable_etime: '01:00',
        },
      ],
    } as const;

    const result = processFormValues(input);
    expect(result.periodic_mutes[0].enable_days_of_week).toBe('1 2 3');
  });

  /**
   * 验证 cluster 默认值
   */
  it('应设置 cluster 为 0', () => {
    const input = { btime: 1000000, etime: 2000000, periodic_mutes: [] } as const;
    const result = processFormValues(input);
    expect(result.cluster).toBe('0');
  });
});
