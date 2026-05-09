import _ from 'lodash';
import { processInitialValues, parseTimeToValueAndUnit } from './utils';

// ---------- dependency mocks ----------

jest.mock('moment', () => {
  const mockVal = { format: jest.fn().mockReturnValue('00:00') };
  const mockMoment: any = jest.fn(() => mockVal);
  mockMoment.fn = jest.fn();
  return mockMoment;
});

jest.mock('@/components/TimeRangePicker', () => ({
  mapOptionToRelativeTimeRange: jest.fn(),
  mapRelativeTimeRangeToOption: jest.fn().mockReturnValue({ label: 'mocked', value: 'mocked' }),
}));

jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: {},
  IS_PLUS: false,
}));

jest.mock('./constants', () => ({
  getDefaultRuleConfig: jest.fn(),
  datasourceDefaultValue: {},
  defaultValues: {
    effective_time: [
      {
        enable_days_of_week: ['0', '1', '2', '3', '4', '5', '6'],
        enable_stime: { format: jest.fn().mockReturnValue('00:00') },
        enable_etime: { format: jest.fn().mockReturnValue('00:00') },
      },
    ],
  },
}));

jest.mock('../constants', () => ({
  DATASOURCE_ALL: 0,
}));

jest.mock(
  'plus:/parcels/AlertRule/utils',
  () => ({}),
  { virtual: true },
);

// ---------- parseTimeToValueAndUnit 单元测试 ----------

describe('parseTimeToValueAndUnit', () => {
  it('600秒应转换为10分钟', () => {
    const result = parseTimeToValueAndUnit(600);
    expect(result.value).toBe(10);
    expect(result.unit).toBe('min');
  });

  it('30秒应保持30秒', () => {
    const result = parseTimeToValueAndUnit(30);
    expect(result.value).toBe(30);
    expect(result.unit).toBe('second');
  });

  it('3600秒应转换为1小时', () => {
    const result = parseTimeToValueAndUnit(3600);
    expect(result.value).toBe(1);
    expect(result.unit).toBe('hour');
  });

  it('falsy值应返回默认min单位', () => {
    expect(parseTimeToValueAndUnit(0).unit).toBe('min');
    expect(parseTimeToValueAndUnit(undefined).unit).toBe('min');
    expect(parseTimeToValueAndUnit(null as any).unit).toBe('min');
  });
});

// ---------- processInitialValues 回归测试 ----------

describe('processInitialValues', () => {
  /**
   * 核心回归测试：不修改原始输入对象
   * 这是本 bug 修复的核心验证 — cloneDeep 防止了原始对象被污染
   */
  it('不应修改原始输入对象（non-mutation）', () => {
    const input = {
      rule_config: {
        queries: [{ interval: 600 }],
      },
    };
    const inputClone = _.cloneDeep(input);

    processInitialValues(input);

    expect(input).toEqual(inputClone);
  });

  /**
   * 核心回归测试：多次调用结果一致（幂等性）
   * 修复前，第二次调用会读到已被修改的数据，导致 unit 从 'min' 变为 'second'
   */
  it('多次调用应返回相同结果（幂等性）', () => {
    const input = {
      rule_config: {
        queries: [{ interval: 600 }],
      },
    };

    const result1 = processInitialValues(input);
    const result2 = processInitialValues(input);

    expect(result1.rule_config.queries[0].interval).toBe(10);
    expect(result1.rule_config.queries[0].interval_unit).toBe('min');
    expect(result2.rule_config.queries[0].interval).toBe(10);
    expect(result2.rule_config.queries[0].interval_unit).toBe('min');
  });

  // ---------- interval 转换测试 ----------

  it('interval=600 应转换为 10分钟', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ interval: 600 }],
      },
    });
    expect(result.rule_config.queries[0].interval).toBe(10);
    expect(result.rule_config.queries[0].interval_unit).toBe('min');
  });

  it('interval=30 应转换为 30秒', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ interval: 30 }],
      },
    });
    expect(result.rule_config.queries[0].interval).toBe(30);
    expect(result.rule_config.queries[0].interval_unit).toBe('second');
  });

  it('interval=3600 应转换为 1小时', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ interval: 3600 }],
      },
    });
    expect(result.rule_config.queries[0].interval).toBe(1);
    expect(result.rule_config.queries[0].interval_unit).toBe('hour');
  });

  it('interval=0/falsy 时 interval 和 interval_unit 应为 undefined', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ interval: 0 }],
      },
    });
    expect(result.rule_config.queries[0].interval).toBeUndefined();
    expect(result.rule_config.queries[0].interval_unit).toBeUndefined();
  });

  it('interval 不存在时不应报错', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{}],
      },
    });
    expect(result.rule_config.queries[0].interval).toBeUndefined();
    expect(result.rule_config.queries[0].interval_unit).toBeUndefined();
  });

  it('没有 queries 字段时不应报错', () => {
    const result = processInitialValues({});
    expect(result).toBeDefined();
  });

  // ---------- 多查询测试 ----------

  it('应正确处理多个 queries', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [
          { interval: 600 },
          { interval: 30 },
          { interval: 3600 },
        ],
      },
    });
    expect(result.rule_config.queries[0]).toMatchObject({ interval: 10, interval_unit: 'min' });
    expect(result.rule_config.queries[1]).toMatchObject({ interval: 30, interval_unit: 'second' });
    expect(result.rule_config.queries[2]).toMatchObject({ interval: 1, interval_unit: 'hour' });
  });

  // ---------- keys 字段转换测试 ----------

  it('应将 keys.labelKey 字符串转换为数组', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ keys: { labelKey: 'a b c' } }],
      },
    });
    expect(result.rule_config.queries[0].keys.labelKey).toEqual(['a', 'b', 'c']);
  });

  it('应将 keys.valueKey 字符串转换为数组', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ keys: { valueKey: 'x y' } }],
      },
    });
    expect(result.rule_config.queries[0].keys.valueKey).toEqual(['x', 'y']);
  });

  it('应将 keys.metricKey 字符串转换为数组', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ keys: { metricKey: 'm1 m2' } }],
      },
    });
    expect(result.rule_config.queries[0].keys.metricKey).toEqual(['m1', 'm2']);
  });

  it('keys 为空字符串时应处理为空数组', () => {
    const result = processInitialValues({
      rule_config: {
        queries: [{ keys: { labelKey: '' } }],
      },
    });
    expect(result.rule_config.queries[0].keys.labelKey).toEqual([]);
  });

  // ---------- 顶层字段转换测试 ----------

  it('应将 enable_in_bg 从 1 转换为 true', () => {
    const result = processInitialValues({ enable_in_bg: 1 });
    expect(result.enable_in_bg).toBe(true);
  });

  it('应将 enable_status 从 disabled=1 转换为 false', () => {
    const result = processInitialValues({ disabled: 1 });
    expect(result.enable_status).toBe(false);
  });

  it('应将 notify_recovered 从 1 转换为 true', () => {
    const result = processInitialValues({ notify_recovered: 1 });
    expect(result.notify_recovered).toBe(true);
  });

  it('应将 callbacks 字符串数组转换为 {url} 对象数组', () => {
    const result = processInitialValues({ callbacks: ['http://a.com', 'http://b.com'] });
    expect(result.callbacks).toEqual([
      { url: 'http://a.com' },
      { url: 'http://b.com' },
    ]);
  });
});
