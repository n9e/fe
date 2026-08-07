jest.mock('lodash', () => {
  const actual = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: actual,
    ...actual,
  };
});

import _ from 'lodash';
import { normalizeFormValues, normalizeInitialValues, normalizeProcessorsForForm, normalizeProcessorsForSubmit, omitDerivedFields } from './normalizeValues';

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

  it('header 已是对象时应原样保留（幂等，克隆数据未过初始化转换的场景）', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: { 'X-Hook-Token': 'xxx' },
          },
        },
      ],
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.processors[0].config.header).toEqual({ 'X-Hook-Token': 'xxx' });
  });

  it('空 header 数组应归一化为空对象', () => {
    const input = {
      processors: [
        {
          typ: 'callback',
          config: {
            header: [],
          },
        },
      ],
    } as const;

    const result = normalizeFormValues(input as any);
    expect(result.processors[0].config.header).toEqual({});
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

  it('header 已是数组时应原样保留（幂等，避免重复转换产生垃圾数据）', () => {
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

    const result = normalizeInitialValues(input as any);
    expect((result as any).processors[0].config.header).toEqual([{ key: 'Content-Type', value: 'application/json' }]);
  });

  it('克隆场景 round-trip：normalizeInitialValues 后 normalizeFormValues 应还原为对象', () => {
    const backendData = {
      id: 1,
      processors: [
        {
          typ: 'callback',
          config: {
            url: 'https://example.com/webhook',
            header: { 'X-Hook-Token': 'xxx' },
            auth_username: 'user',
            auth_password: 'pass',
            skip_ssl_verify: true,
          },
        },
      ],
    } as const;

    const formValues = normalizeInitialValues(backendData as any);
    const submitted = normalizeFormValues(formValues as any);

    expect(submitted.processors[0].config).toEqual({
      url: 'https://example.com/webhook',
      header: { 'X-Hook-Token': 'xxx' },
      auth_username: 'user',
      auth_password: 'pass',
      skip_ssl_verify: true,
    });
  });
});

// ---------- omitDerivedFields ----------

describe('omitDerivedFields', () => {
  it('应剔除后端派生的 nodes / connections', () => {
    const input = {
      id: 1,
      name: 'wf',
      processors: [{ typ: 'relabel', config: {} }],
      nodes: [{ id: 'node_0', name: 'relabel', type: 'relabel', config: {} }],
      connections: { node_0: { main: [] } },
    } as const;

    const result = omitDerivedFields(input);

    expect(result).not.toHaveProperty('nodes');
    expect(result).not.toHaveProperty('connections');
  });

  it('应保留表单未托管但需要回传的字段', () => {
    const input = {
      id: 1,
      group_id: 7,
      use_case: 'event_pipeline',
      trigger_mode: 'event',
      inputs: [{ key: 'k', value: 'v' }],
      nodes: [{ id: 'node_0' }],
    } as const;

    expect(omitDerivedFields(input)).toEqual({
      id: 1,
      group_id: 7,
      use_case: 'event_pipeline',
      trigger_mode: 'event',
      inputs: [{ key: 'k', value: 'v' }],
    });
  });

  it('不应修改原始输入对象（non-mutation）', () => {
    const input = { id: 1, nodes: [{ id: 'node_0' }] } as const;
    const inputClone = _.cloneDeep(input);

    omitDerivedFields(input);

    expect(input).toEqual(inputClone);
  });

  it('入参没有派生字段时应原样返回', () => {
    const input = { id: 1, name: 'wf' } as const;

    expect(omitDerivedFields(input)).toEqual({ id: 1, name: 'wf' });
  });
});

// ---------- 处理器级转换（告警规则表单内联工作流复用） ----------

describe('normalizeProcessorsForSubmit (告警规则表单内联工作流提交)', () => {
  it('event_update 的 header 数组应转成对象（issue #3313 复现场景 / 用户上报 payload）', () => {
    const processors = [
      {
        typ: 'event_update',
        config: {
          timeout: 10000,
          header: [{ key: 'h1', value: 'v1' }],
          url: 'http://example.com',
        },
      },
    ] as const;

    const result = normalizeProcessorsForSubmit(processors as any);
    expect(result).toEqual([
      {
        typ: 'event_update',
        config: {
          timeout: 10000,
          header: { h1: 'v1' },
          url: 'http://example.com',
        },
      },
    ]);
  });

  it('callback / ai_summary / alert_shot 的数组字段应一并转成对象', () => {
    const processors = [
      { typ: 'callback', config: { header: [{ key: 'A', value: '1' }] } },
      { typ: 'ai_summary', config: { header: [{ key: 'H', value: 'x' }], custom_params: [{ key: 'model', value: 'gpt' }] } },
      { typ: 'alert_shot', config: { url_shot_opts: { headers: [{ key: 'X', value: 'y' }] } } },
    ] as any;

    const result = normalizeProcessorsForSubmit(processors);
    expect(result[0].config.header).toEqual({ A: '1' });
    expect(result[1].config.header).toEqual({ H: 'x' });
    expect(result[1].config.custom_params).toEqual({ model: 'gpt' });
    expect(result[2].config.url_shot_opts.headers).toEqual({ X: 'y' });
  });

  it('input 已是对象时应原样保留（幂等）', () => {
    const processors = [{ typ: 'event_update', config: { header: { h1: 'v1' } } }] as any;

    const result = normalizeProcessorsForSubmit(processors);
    expect(result[0].config.header).toEqual({ h1: 'v1' });
  });

  it('不应修改原始入参（表单实时值，cloneDeep 保护）', () => {
    const processors = [
      {
        typ: 'event_update',
        config: {
          timeout: 10000,
          header: [{ key: 'h1', value: 'v1' }],
          url: 'http://example.com',
        },
      },
    ] as const;
    const processorsClone = _.cloneDeep(processors);

    normalizeProcessorsForSubmit(processors as any);

    expect(processors).toEqual(processorsClone);
  });
});

describe('normalizeProcessorsForForm (告警规则表单内联工作流回填)', () => {
  it('后端对象形态 header 应转成表单数组形态', () => {
    const processors = [
      {
        typ: 'event_update',
        config: {
          timeout: 10000,
          header: { h1: 'v1' },
          url: 'http://example.com',
        },
      },
    ] as const;

    const result = normalizeProcessorsForForm(processors as any);
    expect(result[0].config.header).toEqual([{ key: 'h1', value: 'v1' }]);
  });

  it('input 已是数组时应原样保留（幂等）', () => {
    const processors = [{ typ: 'event_update', config: { header: [{ key: 'h1', value: 'v1' }] } }] as any;

    const result = normalizeProcessorsForForm(processors);
    expect(result[0].config.header).toEqual([{ key: 'h1', value: 'v1' }]);
  });

  it('不应修改原始入参（拉取到的后端数据，cloneDeep 保护）', () => {
    const processors = [
      {
        typ: 'event_update',
        config: {
          timeout: 10000,
          header: { h1: 'v1' },
          url: 'http://example.com',
        },
      },
    ] as const;
    const processorsClone = _.cloneDeep(processors);

    normalizeProcessorsForForm(processors as any);

    expect(processors).toEqual(processorsClone);
  });
});
