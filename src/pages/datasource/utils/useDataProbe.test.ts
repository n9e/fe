// 被测的是两个纯函数，但同模块的 service 依赖会经 request.tsx 拉进用了 import.meta 的
// constant.ts，Jest transform 处理不了，故在此切断
jest.mock('@/services/dashboardV2', () => ({ getMetric: jest.fn(), getQueryResult: jest.fn() }));

import { metricSelector, pickSampleMetric } from './useDataProbe';

describe('metricSelector', () => {
  it('包裹合法标识符指标名', () => {
    expect(metricSelector('node_cpu_seconds_total')).toBe('{__name__="node_cpu_seconds_total"}');
  });

  it('OTel 点分指标名不再产生语法错误', () => {
    expect(metricSelector('system.cpu.utilization')).toBe('{__name__="system.cpu.utilization"}');
  });

  it('含连字符的 relabel 产物同样安全', () => {
    expect(metricSelector('a-b')).toBe('{__name__="a-b"}');
  });

  it('转义引号与反斜杠，避免拼出非法 PromQL', () => {
    expect(metricSelector('weird"quote')).toBe('{__name__="weird\\"quote"}');
    expect(metricSelector('back\\slash')).toBe('{__name__="back\\\\slash"}');
  });
});

describe('pickSampleMetric', () => {
  it('跳过 up 与运行时自监控指标，选第一个业务指标', () => {
    const metrics = ['up', 'go_goroutines', 'process_cpu_seconds_total', 'http_requests_total'] as const;
    expect(pickSampleMetric([...metrics])).toBe('http_requests_total');
  });

  it('全是自监控指标时退回第一个，不返回 undefined', () => {
    const metrics = ['up', 'go_goroutines'] as const;
    expect(pickSampleMetric([...metrics])).toBe('up');
  });

  it('空列表返回 undefined', () => {
    expect(pickSampleMetric([])).toBeUndefined();
  });
});
