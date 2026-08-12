import type { ITarget } from '@/pages/dashboard/types';
import type { DashboardQueryResponse, DashboardSeries, TimeSeriesResult } from '@/pages/dashboard/Renderer/datasource/types';

export function createMockTarget(overrides: Partial<ITarget> = {}): ITarget {
  return {
    refId: 'A',
    kind: 'query',
    datasource: { cate: 'prometheus', id: 1 },
    expr: 'up',
    ...overrides,
  };
}

export function createMockTimeSeriesResult(overrides: Partial<TimeSeriesResult> = {}): TimeSeriesResult {
  return {
    ref_id: 'A',
    status: 'success',
    result_type: 'time_series',
    series: [
      {
        labels: { instance: 'localhost:9090' },
        samples: [
          [1700000000, 1],
          [1700000060, 1],
        ],
      },
    ],
    ...overrides,
  };
}

export function createMockQueryResponse(results: DashboardQueryResponse['results'] = [createMockTimeSeriesResult()]): DashboardQueryResponse {
  return { results };
}

export function createMockSeries(overrides: Partial<DashboardSeries> = {}): DashboardSeries {
  return {
    id: 'A:series:test',
    refId: 'A',
    metric: { instance: 'localhost:9090' },
    data: [
      [1700000000, 1],
      [1700000060, 1],
    ],
    mode: 'timeSeries',
    isExp: false,
    ...overrides,
  } as DashboardSeries;
}
