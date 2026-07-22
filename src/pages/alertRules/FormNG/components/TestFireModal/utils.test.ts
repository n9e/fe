import { getDefaultSeverity, parseVectorSeries, summarizeNotifyResults } from './utils';

describe('getDefaultSeverity (模拟触发默认级别)', () => {
  it('取各查询里数值最小（最高）的级别', () => {
    const ruleConfig = {
      queries: [{ severity: 3 }, { severity: 1 }, { severity: 2 }],
    } as const;
    expect(getDefaultSeverity(ruleConfig)).toBe(1);
  });

  it('没有任何合法级别时回退 S2', () => {
    expect(getDefaultSeverity(undefined)).toBe(2);
    expect(getDefaultSeverity({ queries: [] })).toBe(2);
    expect(getDefaultSeverity({ queries: [{ severity: 0 }, { severity: 9 }] })).toBe(2);
  });

  it('忽略非法级别只在合法值里取最小', () => {
    const ruleConfig = {
      queries: [{ severity: 9 }, { severity: 3 }],
    } as const;
    expect(getDefaultSeverity(ruleConfig)).toBe(3);
  });
});

describe('parseVectorSeries (样本序列解析)', () => {
  it('解析 vector 结果为样本序列，label 展示串剔除内部 label', () => {
    const resp = {
      resultType: 'vector',
      result: [
        {
          metric: { __name__: 'cpu_usage_active', ident: 'web-01', cpu: 'cpu-total' },
          value: [1700000000, '92.3'],
        },
      ],
    } as const;

    const series = parseVectorSeries(resp);
    expect(series).toHaveLength(1);
    expect(series[0].value).toBe(92.3);
    expect(series[0].labelStr).toBe('cpu_usage_active{ident=web-01, cpu=cpu-total}');
    expect(series[0].labels).toEqual(resp.result[0].metric);
  });

  it('非 vector / 空入参 / 非法数值返回空数组或被剔除', () => {
    expect(parseVectorSeries(undefined)).toEqual([]);
    expect(parseVectorSeries({ resultType: 'matrix', result: [] })).toEqual([]);
    expect(
      parseVectorSeries({
        resultType: 'vector',
        result: [{ metric: { ident: 'a' }, value: [1700000000, 'NaN'] }],
      }),
    ).toEqual([]);
  });

  it('相同入参多次调用结果一致（幂等性）', () => {
    const resp = {
      resultType: 'vector',
      result: [{ metric: { ident: 'web-01' }, value: [1700000000, '1.5'] }],
    } as const;
    expect(parseVectorSeries(resp)).toEqual(parseVectorSeries(resp));
  });
});

describe('summarizeNotifyResults (通知结果汇总)', () => {
  it('分别统计 匹配/已发送/发送失败/未匹配', () => {
    const results = [
      { matched: true, sent: true },
      { matched: true, sent: false, error: 'smtp timeout' },
      { matched: true, sent: false, skipped: true },
      { matched: false, match_error: 'severity not match' },
    ] as const;

    expect(summarizeNotifyResults(results as any)).toEqual({
      matched: 3,
      sent: 1,
      failed: 1,
      notMatched: 1,
    });
  });

  it('空数组返回全零', () => {
    expect(summarizeNotifyResults([])).toEqual({ matched: 0, sent: 0, failed: 0, notMatched: 0 });
  });
});
