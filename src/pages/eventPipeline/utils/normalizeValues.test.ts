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

// ---------- normalizeFormValues 回归测试 ----------

describe('normalizeFormValues (工作流/事件流)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: [{ key: 'Content-Type', value: 'application/json' }],
          },
        },
      ],
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeFormValues(input as any);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: [{ key: 'Content-Type', value: 'application/json' }],
          },
        },
      ],
    } as const;

    const result1 = normalizeFormValues(input as any);
    const result2 = normalizeFormValues(input as any);

    expect(result1).toEqual(result2);
  });

  it('应正确转换 callback processor 的 header 为对象', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'Authorization', value: 'Bearer token' },
            ],
          },
        },
      ],
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.processors[0].config.header).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    });
  });

  it('应正确转换 ai_summary processor 的 custom_params 为对象', () => {
    const input = {
      processors: [
        {
          typ: 'ai_summary',
          config: {
            header: [],
            custom_params: [{ key: 'model', value: 'gpt-4' }],
          },
        },
      ],
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.processors[0].config.custom_params).toEqual({
      model: 'gpt-4',
    });
  });

  it('应正确转换 alert_shot processor 的 url_shot_opts.headers 为对象', () => {
    const input = {
      processors: [
        {
          typ: 'alert_shot',
          config: {
            url_shot_opts: {
              headers: [{ key: 'X-Api-Key', value: 'abc123' }],
            },
          },
        },
      ],
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.processors[0].config.url_shot_opts.headers).toEqual({
      'X-Api-Key': 'abc123',
    });
  });
});

// ---------- normalizeInitialValues 回归测试 ----------

describe('normalizeInitialValues (工作流/事件流)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: {
              'Content-Type': 'application/json',
            },
          },
        },
      ],
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeInitialValues(input as any);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: {
              'Content-Type': 'application/json',
            },
          },
        },
      ],
    } as const;

    const result1 = normalizeInitialValues(input as any);
    const result2 = normalizeInitialValues(input as any);

    expect(result1).toEqual(result2);
  });

  it('应正确转换 header 从对象回数组', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: {
              'Content-Type': 'application/json',
            },
          },
        },
      ],
    } as const;

    const result = normalizeInitialValues(input as any);
    expect((result as any).processors[0].config.header).toEqual([{ key: 'Content-Type', value: 'application/json' }]);
  });
});
