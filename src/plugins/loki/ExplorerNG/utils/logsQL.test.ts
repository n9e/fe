import { classifyExplorerMode, renderMetricLogQL, renderRawLogQL } from './logsQL';

describe('Loki ExplorerNG logsQL utils', () => {
  it('classifies raw and metric LogQL', () => {
    expect(classifyExplorerMode('{app="api"} |= "error"')).toBe('raw');
    expect(classifyExplorerMode('sum by (app) (count_over_time({app="api"}[5m]))')).toBe('metric');
  });

  it('renders raw LogQL from builder state', () => {
    expect(
      renderRawLogQL({
        labels: [{ id: '1', label: 'app', op: '=', value: 'api' }],
        lineFilters: [{ id: '2', op: '|=', value: 'error' }],
        parser: { type: 'json' },
        parsedFieldFilters: [{ id: '3', field: 'status', op: '>=', value: 500 }],
      }),
    ).toBe('{app="api"} |= "error" | json | status >= 500');
  });

  it('renders quantile_over_time with scalar parameter', () => {
    expect(
      renderMetricLogQL({
        labels: [{ id: '1', label: 'app', op: '=', value: 'api' }],
        parser: { type: 'logfmt' },
        rangeFunc: 'quantile_over_time',
        rangeParam: 0.95,
        range: '5m',
        unwrapField: 'latency',
        vizType: 'timeseries',
      }),
    ).toBe('quantile_over_time(0.95, {app="api"} | logfmt | unwrap latency[5m])');
  });
});
