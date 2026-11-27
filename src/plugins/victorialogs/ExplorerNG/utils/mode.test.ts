// ExplorerNG/constants imports a module that reads import.meta.env; replace it in jest.
jest.mock('../constants', () => ({
  METRIC_DEFAULT_QUERY: '* | stats count() as count',
  RAW_DEFAULT_QUERY: '*',
}));

import { METRIC_DEFAULT_QUERY } from '../constants';
import { buildMetricQueryOnSwitch, resolveExecutedQuery } from './mode';

describe('resolveExecutedQuery', () => {
  it('keeps raw mode for a plain query', () => {
    expect(resolveExecutedQuery({ mode: 'raw', query: '* status:500' })).toEqual({ mode: 'raw', query: '* status:500' });
  });

  it('forces the chart view when the query is an aggregation', () => {
    const query = '* | stats by (status) count() as count';
    expect(resolveExecutedQuery({ mode: 'raw', query })).toEqual({ mode: 'metric', query });
  });

  it('keeps the user-selected chart view for a non-aggregation query', () => {
    // The previous code silently switched back to raw logs here.
    expect(resolveExecutedQuery({ mode: 'metric', query: '* status:500' })).toEqual({ mode: 'metric', query: '* status:500' });
  });

  it('fills the default aggregation when the chart view has an empty query', () => {
    expect(resolveExecutedQuery({ mode: 'metric', query: '' })).toEqual({ mode: 'metric', query: METRIC_DEFAULT_QUERY });
  });
});

describe('buildMetricQueryOnSwitch', () => {
  it('uses the default aggregation for an empty or default raw query', () => {
    expect(buildMetricQueryOnSwitch('')).toBe('* | stats count() as count');
    expect(buildMetricQueryOnSwitch('*')).toBe('* | stats count() as count');
  });

  it('keeps an existing aggregation query untouched', () => {
    const ql = '* | stats by (status) count() as count';
    expect(buildMetricQueryOnSwitch(ql)).toBe(ql);
  });

  it('keeps filters and appends a default aggregation for a plain query', () => {
    expect(buildMetricQueryOnSwitch('* status:500')).toBe('* status:500 | stats count() as count');
  });
});
