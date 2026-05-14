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
