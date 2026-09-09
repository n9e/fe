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

describe('normalizeFormValues (通知媒介)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          request: {
            parameters: [{ key: 'param1', value: 'value1' }],
          },
        },
      },
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeFormValues(input);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: [{ key: 'Content-Type', value: 'application/json' }],
          request: {
            parameters: [{ key: 'param1', value: 'value1' }],
          },
        },
      },
    } as const;

    const result1 = normalizeFormValues(input);
    const result2 = normalizeFormValues(input);

    expect(result1).toEqual(result2);
  });

  it('应正确将 headers 从数组转换为对象', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer token' },
          ],
          request: {
            parameters: [],
          },
        },
      },
    } as const;

    const result = normalizeFormValues(input);
    expect(result.request_config.http_request_config.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    });
  });

  it('应正确将 parameters 从数组转换为对象', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: [],
          request: {
            parameters: [{ key: 'p1', value: 'v1' }],
          },
        },
      },
    } as const;

    const result = normalizeFormValues(input);
    expect(result.request_config.http_request_config.request.parameters).toEqual({
      p1: 'v1',
    });
  });

  it('应剔除全空的 xxx_request_config（空对象 / 字段全空）', () => {
    const input = {
      request_config: {
        http_request_config: {
          url: 'https://oapi.dingtalk.com/robot/send',
          headers: [],
          request: { parameters: [] },
        },
        // 折叠面板 forceRender 后必然被 getFieldsValue 带出来的空壳
        dingtalk_request_config: { app_key: '', app_secret: '' },
        feishu_request_config: {},
        smtp_request_config: { host: undefined, port: null },
      },
    } as const;

    const result = normalizeFormValues(input);
    expect(result.request_config).not.toHaveProperty('dingtalk_request_config');
    expect(result.request_config).not.toHaveProperty('feishu_request_config');
    expect(result.request_config).not.toHaveProperty('smtp_request_config');
    // http_request_config 是公共载体，即使没填内容也保留
    expect(result.request_config.http_request_config.url).toBe('https://oapi.dingtalk.com/robot/send');
  });

  it('填过值的 xxx_request_config 必须原样保留', () => {
    const input = {
      request_config: {
        http_request_config: { headers: [], request: { parameters: [] } },
        dingtalk_request_config: { app_key: 'key', app_secret: '' },
      },
    } as const;

    const result = normalizeFormValues(input);
    expect(result.request_config.dingtalk_request_config).toEqual({ app_key: 'key', app_secret: '' });
  });

  it('0 与 false 是有效值，不能被当成空剔除', () => {
    const input = {
      request_config: {
        http_request_config: { headers: [], request: { parameters: [] } },
        smtp_request_config: { host: '', port: 0, insecure_skip_verify: false },
      },
    } as const;

    const result = normalizeFormValues(input);
    expect(result.request_config.smtp_request_config).toEqual({ host: '', port: 0, insecure_skip_verify: false });
  });
});

// ---------- normalizeInitialValues 回归测试 ----------

describe('normalizeInitialValues (通知媒介)', () => {
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: {
            'Content-Type': 'application/json',
          },
          request: {
            parameters: {
              p1: 'v1',
            },
          },
        },
      },
    } as const;
    const inputClone = _.cloneDeep(input);

    normalizeInitialValues(input);

    expect(input).toEqual(inputClone);
  });

  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: {
            'Content-Type': 'application/json',
          },
          request: {
            parameters: {
              p1: 'v1',
            },
          },
        },
      },
    } as const;

    const result1 = normalizeInitialValues(input);
    const result2 = normalizeInitialValues(input);

    expect(result1).toEqual(result2);
  });

  it('应正确将 headers 从对象转换为数组', () => {
    const input = {
      request_config: {
        http_request_config: {
          headers: {
            'Content-Type': 'application/json',
          },
          request: {
            parameters: {},
          },
        },
      },
    } as const;

    const result = normalizeInitialValues(input);
    expect(result.request_config.http_request_config.headers).toEqual([{ key: 'Content-Type', value: 'application/json' }]);
  });
});
