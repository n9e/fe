// service 依赖会经 request.tsx 拉进用了 import.meta 的 constant.ts，Jest transform 处理不了，
// 故在此切断；probePrometheus 的用例也正好靠这两个 mock 驱动
jest.mock('@/services/dashboardV2', () => ({ getMetric: jest.fn(), getQueryResult: jest.fn() }));

import { getMetric, getQueryResult } from '@/services/dashboardV2';

import { metricSelector, pickSampleMetric, probePrometheus } from './useDataProbe';

const getMetricMock = getMetric as unknown as jest.Mock;
const getQueryResultMock = getQueryResult as unknown as jest.Mock;

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

describe('probePrometheus', () => {
  beforeEach(() => {
    getMetricMock.mockReset();
    getQueryResultMock.mockReset();
  });

  it('指标名列表必须带时间窗，否则会把整个 retention 期内的僵尸指标算进来', async () => {
    getMetricMock.mockResolvedValue({ data: ['http_requests_total'] });
    getQueryResultMock.mockResolvedValue({ data: { result: [{ value: [0, '1700000000'] }] } });

    await probePrometheus(42);

    const [params, datasourceId] = getMetricMock.mock.calls[0];
    expect(datasourceId).toBe(42);
    expect(typeof params.start).toBe('number');
    expect(typeof params.end).toBe('number');
    expect(params.end - params.start).toBe(300);
  });

  it('首个候选指标已停更、但其他候选仍在写时判为 hasData（回归：曾按单指标误判 staleData/noData）', async () => {
    getMetricMock.mockResolvedValue({ data: ['aliyun_zombie_metric', 'node_cpu_seconds_total'] });
    // 第一个候选（字典序在前的僵尸指标）无样本，第二个有
    getQueryResultMock.mockImplementation((params: { query: string }) =>
      params.query.includes('aliyun_zombie_metric') ? Promise.resolve({ data: { result: [] } }) : Promise.resolve({ data: { result: [{ value: [0, '1700000000'] }] } }),
    );

    const res = await probePrometheus(42);

    expect(res.state).toBe('hasData');
    expect(res.metricCount).toBe(2);
    // 抽样指标取实际有样本的那个，而不是字典序第一个
    expect(res.sampleMetric).toBe('node_cpu_seconds_total');
    expect(res.lastDataTs).toBe(1700000000);
  });

  it('候选指标全都没有近期样本 → staleData，hasData 永远带得出 lastDataTs', async () => {
    // label values 的 start/end 会被对齐到 block 边界，名单还在不代表此刻还在写
    getMetricMock.mockResolvedValue({ data: ['node_cpu_seconds_total', 'http_requests_total'] });
    getQueryResultMock.mockResolvedValue({ data: { result: [] } });

    const res = await probePrometheus(42);

    expect(res.state).toBe('staleData');
    expect(res.lastDataTs).toBeUndefined();
  });

  it('候选指标查询全部失败 → unreachable；只失败一部分则不算', async () => {
    getMetricMock.mockResolvedValue({ data: ['a_metric', 'b_metric'] });
    getQueryResultMock.mockRejectedValue({ message: 'query timeout' });

    const allFailed = await probePrometheus(42);
    expect(allFailed.state).toBe('unreachable');
    expect(allFailed.errorMessage).toBe('query timeout');

    getQueryResultMock.mockReset();
    getQueryResultMock.mockImplementation((params: { query: string }) =>
      params.query.includes('a_metric') ? Promise.reject({ message: 'query timeout' }) : Promise.resolve({ data: { result: [{ value: [0, '1700000000'] }] } }),
    );

    const partial = await probePrometheus(42);
    expect(partial.state).toBe('hasData');
    expect(partial.sampleMetric).toBe('b_metric');
  });

  it('近 5 分钟为空、24 小时内有过数据 → staleData，且 metricCount 取 24h 窗口', async () => {
    getMetricMock.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: ['node_cpu_seconds_total', 'up'] });

    const res = await probePrometheus(42);

    expect(res.state).toBe('staleData');
    expect(res.metricCount).toBe(2);
    expect(res.sampleMetric).toBe('node_cpu_seconds_total');
    expect(getMetricMock.mock.calls[1][0].end - getMetricMock.mock.calls[1][0].start).toBe(86400);
    // 5 分钟窗口就是空的，不必再发 PromQL 查询
    expect(getQueryResultMock).not.toHaveBeenCalled();
  });

  it('两个窗口都为空 → noData', async () => {
    getMetricMock.mockResolvedValue({ data: [] });

    const res = await probePrometheus(42);

    expect(res.state).toBe('noData');
    expect(res.metricCount).toBe(0);
  });

  it('指标名接口失败 → unreachable 并透出错误', async () => {
    getMetricMock.mockRejectedValue({ message: 'connection refused' });

    const res = await probePrometheus(42);

    expect(res.state).toBe('unreachable');
    expect(res.errorMessage).toBe('connection refused');
  });
});
