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

  it('renders multiline raw LogQL from builder state', () => {
    const query = renderRawLogQL(
      {
        labels: [{ id: '1', label: 'app', op: '=', value: 'api' }],
        lineFilters: [{ id: '2', op: '|=', value: 'error' }],
        parser: { type: 'json' },
        parsedFieldFilters: [{ id: '3', field: 'status', op: '>=', value: 500 }],
      },
      { multiline: true },
    );

    expect(query).toBe(['{app="api"}', '|= "error"', '| json', '| status >= 500'].join('\n'));
    expect(classifyExplorerMode(query)).toBe('raw');
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

  it('renders multiline metric LogQL with outer aggregation only', () => {
    const query = renderMetricLogQL(
      {
        labels: [{ id: '1', label: 'app', op: '=', value: 'api' }],
        lineFilters: [{ id: '2', op: '|=', value: 'error' }],
        rangeFunc: 'count_over_time',
        range: '5m',
        vectorAgg: 'sum',
        groupBy: ['app'],
        vizType: 'timeseries',
      },
      { multiline: true },
    );

    expect(query).toBe(['sum by (app) (', '  count_over_time({app="api"} |= "error"[5m])', ')'].join('\n'));
    expect(classifyExplorerMode(query)).toBe('metric');
  });
});
