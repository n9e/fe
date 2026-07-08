import { getLogQLCompletionContext } from './logqlCompletionContext';
import { buildCompletionCacheKey } from './logqlCompletionCache';

describe('Loki LogQL completion context', () => {
  it('detects label name context inside selector', () => {
    expect(getLogQLCompletionContext('{jo', 3)).toEqual({ type: 'label_name', from: 1, to: 3, selectorQuery: '{}', keyword: 'jo' });
  });

  it('detects label value context inside quotes', () => {
    expect(getLogQLCompletionContext('{job=""}', 6)).toEqual({ type: 'label_value', from: 6, to: 6, selectorQuery: '{}', label: 'job', keyword: '' });
  });

  it('uses completed matchers as selector query for label value completion', () => {
    const query = '{namespace="prod", job=""}';
    expect(getLogQLCompletionContext(query, 24)).toEqual({
      type: 'label_value',
      from: 24,
      to: 24,
      selectorQuery: '{namespace="prod"}',
      label: 'job',
      keyword: '',
    });
  });

  it('supports regex label value context', () => {
    const query = '{job=~"api"}';
    expect(getLogQLCompletionContext(query, 10)).toMatchObject({ type: 'label_value', label: 'job', keyword: 'api' });
  });

  it('detects grouping label context with selector query', () => {
    const query = 'sum by (ap) (count_over_time({job="api"}[5m]))';
    expect(getLogQLCompletionContext(query, 10)).toEqual({ type: 'grouping_label', from: 8, to: 10, selectorQuery: '{job="api"}', keyword: 'ap' });
  });

  it('keeps quoted braces while extracting selector for grouping label context', () => {
    const query = 'sum by (ap) (count_over_time({job="api}prod",namespace="prod"}[5m]))';
    expect(getLogQLCompletionContext(query, 10)).toEqual({
      type: 'grouping_label',
      from: 8,
      to: 10,
      selectorQuery: '{job="api}prod",namespace="prod"}',
      keyword: 'ap',
    });
  });

  it('falls back to empty selector query for grouping label context', () => {
    expect(getLogQLCompletionContext('sum by (ap', 10)).toEqual({ type: 'grouping_label', from: 8, to: 10, selectorQuery: '{}', keyword: 'ap' });
  });

  it('returns static context outside selector', () => {
    expect(getLogQLCompletionContext('{job="api"} | j', 15)).toMatchObject({ type: 'static', keyword: 'j' });
  });

  it('builds cache keys without time range', () => {
    expect(buildCompletionCacheKey({ datasourceId: 1, type: 'label_value', query: '{}', label: 'job', keyword: 'api' })).toBe('1:label_value:{}:job:api');
  });
});
