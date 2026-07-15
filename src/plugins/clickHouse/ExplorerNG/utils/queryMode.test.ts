import { buildCKFilterFromLogValue, hasHighlightableFilter, pickCKTimeField } from './queryMode';
import { AGGREGATE_FUNCTION_TYPE_MAP, TYPE_OPERATOR_MAP } from '../components/QueryBuilder/constants';

describe('ClickHouse Explorer query mode', () => {
  test('does not create filters for flattened JSON child paths', () => {
    expect(buildCKFilterFromLogValue({ key: 'payload.foo.bar', value: 'error', operator: 'AND' }, [{ field: 'payload', type: 'JSON', normalized_type: 'json' }])).toBeUndefined();
  });

  test('keeps a real dotted column name intact', () => {
    expect(
      buildCKFilterFromLogValue({ key: 'service.name', value: null, operator: 'NOT' }, [{ field: 'service.name', type: 'Nullable(String)', normalized_type: 'text' }]),
    ).toMatchObject({ field: 'service.name', operator: 'is-null', not: true });
  });

  test('enables highlighting only for positive text filters', () => {
    expect(hasHighlightableFilter([{ field: 'message', operator: 'ilike', value: '%error%' }])).toBe(true);
    expect(hasHighlightableFilter([{ field: 'message', operator: 'not_ilike', value: '%error%' }])).toBe(false);
    expect(hasHighlightableFilter([{ field: 'status', operator: '=', value: 500 }])).toBe(false);
  });

  test('prefers a conventional time field and otherwise uses the first date field', () => {
    const fields = [
      { field: 'created_at', type: 'DateTime64(3)', normalized_type: 'date' },
      { field: 'time', type: 'Nullable(DateTime)', normalized_type: 'date' },
    ];
    expect(pickCKTimeField(fields)?.field).toBe('time');
    expect(pickCKTimeField(fields.slice(0, 1))?.field).toBe('created_at');
  });

  test('exposes CK-native text operators and advanced aggregates', () => {
    expect(TYPE_OPERATOR_MAP.text).toEqual(expect.arrayContaining(['ilike', 'not_ilike', 'match', 'not_match', 'has_token']));
    expect(TYPE_OPERATOR_MAP.json).toEqual(['is-null', 'is-not-null']);
    expect(TYPE_OPERATOR_MAP.map).toEqual(['is-null', 'is-not-null']);
    expect(Object.keys(AGGREGATE_FUNCTION_TYPE_MAP)).toEqual(expect.arrayContaining(['TOPN', 'RATIO', 'EXIST_RATIO', 'PERCENTILE', 'VARIANCE', 'STDDEV']));
  });
});
