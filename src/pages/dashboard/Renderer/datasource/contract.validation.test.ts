import moment from 'moment';

import type { ITarget } from '@/pages/dashboard/types';

import type { DashboardQueryRequest } from './types';
import { buildDashboardQueryRequest, normalizeDashboardQueryResponse, validateDashboardQueryRequest } from './contract';

jest.mock('./queryStep', () => ({
  getDashboardQueryStep: () => 30,
}));
jest.mock('@/components/TimeRangePicker/utils', () => ({
  parseRange: (range: { start: unknown; end: unknown }) => range,
}));
jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value,
  replaceDatasourceVariables: (value: number | string) => value,
}));

const time = {
  start: moment('2026-07-24T00:00:00.000Z'),
  end: moment('2026-07-24T01:00:00.000Z'),
};

describe('dashboard unified query contract validation', () => {
  it('rejects a request whose end time is earlier than start time', () => {
    const request: DashboardQueryRequest = {
      from: 2000,
      to: 1000,
      queries: [],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/end time/i);
  });

  it('rejects invalid RefID formats', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [{ kind: 'query', ref_id: '1A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} }],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/Invalid RefID/);
  });

  it('rejects duplicate RefIDs', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [
        { kind: 'query', ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} },
        { kind: 'query', ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} },
      ],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/Duplicate RefID/);
  });

  it('rejects expression dependency cycles', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [
        { kind: 'query', ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} },
        { kind: 'expression', ref_id: 'B', expression: '$A / $C' },
        { kind: 'expression', ref_id: 'C', expression: '$B * 2' },
      ],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/cycle/i);
  });

  it('rejects expressions that reference unknown refs', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [{ kind: 'expression', ref_id: 'B', expression: '$NOPE * 2' }],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/not found/i);
  });

  it('rejects expressions that reference log queries', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [
        { kind: 'query', ref_id: 'A', datasource: { cate: 'elasticsearch', id: 1 }, result_type: 'logs', query: {} },
        { kind: 'expression', ref_id: 'B', expression: '$A * 2' },
      ],
    };
    expect(() => validateDashboardQueryRequest(request)).toThrow(/log query/i);
  });

  it('accepts a valid expression DAG', () => {
    const request: DashboardQueryRequest = {
      from: 1000,
      to: 2000,
      queries: [
        { kind: 'query', ref_id: 'A', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} },
        { kind: 'query', ref_id: 'B', datasource: { cate: 'prometheus', id: 1 }, result_type: 'time_series', query: {} },
        { kind: 'expression', ref_id: 'C', expression: '$A / $B * 100' },
      ],
    };
    expect(() => validateDashboardQueryRequest(request)).not.toThrow();
  });

  it('surfaces validation failures from buildDashboardQueryRequest', () => {
    const targets: ITarget[] = [
      { refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 }, expr: 'up' },
      { refId: 'B', kind: 'expression', expression: '$C * 2' },
    ];
    expect(() =>
      buildDashboardQueryRequest({
        time,
        targets,
        datasourceList: [],
      }),
    ).toThrow(/not found/i);
  });

  it('drops hidden targets during normalization', () => {
    const response = {
      results: [{ ref_id: 'A', status: 'success' as const, result_type: 'time_series' as const, series: [{ labels: { a: '1' }, samples: [[1, 1]] }] }],
    };
    const targets: ITarget[] = [{ refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 }, hide: true }];
    const normalized = normalizeDashboardQueryResponse(response, targets);
    expect(normalized.series).toEqual([]);
  });
});
