jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import _ from 'lodash';
import { normalizeFormValues, normalizeInitialValues, normalizeProcessorsForForm, normalizeProcessorsForSubmit } from './normalizeValues';

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

  it('header 已是对象时应保持对象形态', () => {
    const result = normalizeFormValues({ processors: [{ typ: 'callback', config: { header: { Authorization: 'Bearer token' } } }] } as any);
    expect(result.processors[0].config.header).toEqual({ Authorization: 'Bearer token' });
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

  it('header 已是数组时应保持数组形态', () => {
    const result = normalizeInitialValues({ processors: [{ typ: 'callback', config: { header: [{ key: 'Content-Type', value: 'application/json' }] } }] } as any);
    expect((result as any).processors[0].config.header).toEqual([{ key: 'Content-Type', value: 'application/json' }]);
  });
});

describe('处理器级转换（告警规则内联工作流）', () => {
  it('提交时将所有 map 字段转换为对象且不修改原始值', () => {
    const processors = [
      { typ: 'event_update', config: { header: [{ key: 'h1', value: 'v1' }] } },
      { typ: 'ai_summary', config: { header: [{ key: 'h2', value: 'v2' }], custom_params: [{ key: 'model', value: 'gpt' }] } },
      { typ: 'alert_shot', config: { url_shot_opts: { headers: [{ key: 'h3', value: 'v3' }] } } },
    ];
    const original = _.cloneDeep(processors);

    const result = normalizeProcessorsForSubmit(processors);

    expect(result[0].config.header).toEqual({ h1: 'v1' });
    expect(result[1].config).toMatchObject({ header: { h2: 'v2' }, custom_params: { model: 'gpt' } });
    expect(result[2].config.url_shot_opts.headers).toEqual({ h3: 'v3' });
    expect(processors).toEqual(original);
  });

  it('回填时将对象转换为 Form.List 数组且不修改原始值', () => {
    const processors = [{ typ: 'event_update', config: { header: { h1: 'v1' } } }];
    const result = normalizeProcessorsForForm(processors);

    expect(result[0].config.header).toEqual([{ key: 'h1', value: 'v1' }]);
    expect(processors[0].config.header).toEqual({ h1: 'v1' });
  });
});
