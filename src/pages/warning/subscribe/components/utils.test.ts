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

// ---------- processFormValues 回归测试 ----------

describe('processFormValues (订阅规则)', () => {
  /**
   * 核心回归测试：不修改原始输入对象
   */
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      tags: [{ func: '==', key: 'env', value: ['prod', 'staging'] }],
      busi_groups: [{ func: '==', key: 'group', value: ['g1', 'g2'] }],
      redefine_severity: true,
      redefine_channels: false,
      redefine_webhooks: true,
      user_group_ids: [1, 2, 3],
      new_channels: ['c1', 'c2'],
    } as const;
    const inputClone = _.cloneDeep(input);

    processFormValues(input, [{ id: 10 }, { id: 20 }]);

    expect(input).toEqual(inputClone);
  });

  /**
   * 核心回归测试：多次调用结果一致（幂等性）
   */
  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      tags: [{ func: '==', key: 'env', value: ['prod', 'staging'] }],
      busi_groups: [{ func: '==', key: 'group', value: ['g1', 'g2'] }],
      redefine_severity: true,
      redefine_channels: false,
      redefine_webhooks: true,
      user_group_ids: [1, 2, 3],
      new_channels: ['c1', 'c2'],
    } as const;
    const selectedRules = [{ id: 10 }, { id: 20 }];

    const result1 = processFormValues(input, selectedRules);
    const result2 = processFormValues(input, selectedRules);

    expect(result1).toEqual(result2);
  });

  /**
   * 验证 tags value 数组 → 空格分隔字符串
   */
  it('应正确转换 tags 中的 value 数组为空格分隔字符串', () => {
    const input = {
      tags: [{ func: '==', key: 'env', value: ['prod', 'staging'] }],
      busi_groups: [],
      redefine_severity: false,
      redefine_channels: false,
      redefine_webhooks: false,
      user_group_ids: [],
      new_channels: [],
    } as const;

    const result = processFormValues(input, []);
    expect(result.tags[0].value).toBe('prod staging');
  });

  /**
   * 验证 user_group_ids 数组 → 空格分隔字符串
   */
  it('应正确转换 user_group_ids 数组为空格分隔字符串', () => {
    const input = {
      tags: [],
      busi_groups: [],
      redefine_severity: false,
      redefine_channels: false,
      redefine_webhooks: false,
      user_group_ids: [1, 2, 3],
      new_channels: [],
    } as const;

    const result = processFormValues(input, []);
    expect(result.user_group_ids).toBe('1 2 3');
  });

  /**
   * 验证 boolean → 0/1 转换
   */
  it('应正确将 boolean 值转换为 0/1', () => {
    const input = {
      tags: [],
      busi_groups: [],
      redefine_severity: true,
      redefine_channels: false,
      redefine_webhooks: true,
      user_group_ids: [],
      new_channels: [],
    } as const;

    const result = processFormValues(input, []);
    expect(result.redefine_severity).toBe(1);
    expect(result.redefine_channels).toBe(0);
    expect(result.redefine_webhooks).toBe(1);
  });

  /**
   * 验证 rule_ids 来自 selectedRules
   */
  it('应正确提取 selectedRules 中的 id', () => {
    const input = {
      tags: [],
      busi_groups: [],
      redefine_severity: false,
      redefine_channels: false,
      redefine_webhooks: false,
      user_group_ids: [],
      new_channels: [],
    } as const;

    const result = processFormValues(input, [{ id: 10 }, { id: 20 }]);
    expect(result.rule_ids).toEqual([10, 20]);
  });
});
