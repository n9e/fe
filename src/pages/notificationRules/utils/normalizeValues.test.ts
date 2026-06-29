jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import _ from 'lodash';
import { normalizeFormValues, normalizeInitialValues } from './normalizeValues';

// ---------- dependency mocks ----------

jest.mock('moment', () => {
  const mockVal = { format: jest.fn().mockReturnValue('00:00') };
  const mockFn: any = jest.fn(() => mockVal);
  mockFn.fn = jest.fn();
  mockFn.parseZone = jest.fn();
  return { __esModule: true, default: mockFn, fn: mockFn.fn, parseZone: mockFn.parseZone };
});

// ---------- normalizeFormValues 回归测试 ----------

describe('normalizeFormValues (通知规则)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      notify_configs: [
        {
          time_ranges: [{ start: { format: jest.fn().mockReturnValue('00:00') }, end: { format: jest.fn().mockReturnValue('08:00') } }],
        },
      ],
      extra_config: {
        escalations: [
          {
            time_ranges: [{ start: { format: jest.fn().mockReturnValue('09:00') }, end: { format: jest.fn().mockReturnValue('18:00') } }],
          },
        ],
      },
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeFormValues(input as any);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      notify_configs: [
        {
          time_ranges: [{ start: { format: jest.fn().mockReturnValue('00:00') }, end: { format: jest.fn().mockReturnValue('08:00') } }],
        },
      ],
      extra_config: {
        escalations: [],
      },
    } as const;

    const result1 = normalizeFormValues(input as any);
    const result2 = normalizeFormValues(input as any);

    expect(result1).toEqual(result2);
  });

  it('应正确格式化 time_ranges 中的 moment 对象', () => {
    const mockStart = { format: jest.fn().mockReturnValue('09:00') };
    const mockEnd = { format: jest.fn().mockReturnValue('18:00') };
    const input = {
      notify_configs: [
        {
          time_ranges: [{ start: mockStart, end: mockEnd }],
        },
      ],
      extra_config: {
        escalations: [],
      },
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.notify_configs[0].time_ranges[0].start).toBe('09:00');
    expect(result.notify_configs[0].time_ranges[0].end).toBe('18:00');
  });
});

// ---------- normalizeInitialValues 回归测试 ----------

describe('normalizeInitialValues (通知规则)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      notify_configs: [
        {
          time_ranges: [{ start: '00:00', end: '08:00' }],
        },
      ],
      extra_config: {
        escalations: [],
      },
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeInitialValues(input);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      notify_configs: [
        {
          time_ranges: [{ start: '00:00', end: '08:00' }],
        },
      ],
      extra_config: {
        escalations: [],
      },
    } as const;

    const result1 = normalizeInitialValues(input);
    const result2 = normalizeInitialValues(input);

    expect(result1).toEqual(result2);
  });
});
