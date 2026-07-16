import { buildCKFilterFromLogValue, hasHighlightableFilter, pickCKTimeField } from './queryMode';
import { AGGREGATE_FUNCTION_TYPE_MAP, TYPE_OPERATOR_MAP } from '../components/QueryBuilder/constants';

describe('ClickHouse Explorer query mode', () => {
  test('does not create filters for flattened JSON child paths', () => {
    expect(buildCKFilterFromLogValue({ key: 'payload.foo.bar', value: 'error', operator: 'AND' }, [{ field: 'payload', type: 'JSON', normalized_type: 'json' }])).toBeUndefined();
  });

  test('keeps a real dotted column name intact', () => {
    expect(
      buildCKFilterFromLogValue({ key: 'service.name', value: null, operator: 'NOT' }, [{ field: 'service.name', type: 'Nullable(String)', normalized_type: 'text' }]),
    ).toMatchObject({ field: 'service.name', operator: 'IS NULL', not: true });
  });

  test('enables highlighting only for positive text filters', () => {
    expect(hasHighlightableFilter([{ field: 'message', operator: 'ILIKE', value: '%error%' }])).toBe(true);
    expect(hasHighlightableFilter([{ field: 'message', operator: 'NOT ILIKE', value: '%error%' }])).toBe(false);
    expect(hasHighlightableFilter([{ field: 'message', operator: 'hasToken', value: 'timeout' }])).toBe(true);
    expect(hasHighlightableFilter([{ field: 'message', operator: 'notMatch', value: 'x' }])).toBe(false);
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
    expect(TYPE_OPERATOR_MAP.text).toEqual(expect.arrayContaining(['ILIKE', 'NOT ILIKE', 'match', 'notMatch', 'hasToken']));
    expect(TYPE_OPERATOR_MAP.json).toEqual(['IS NULL', 'IS NOT NULL']);
    expect(TYPE_OPERATOR_MAP.map).toEqual(['IS NULL', 'IS NOT NULL']);
    expect(Object.keys(AGGREGATE_FUNCTION_TYPE_MAP)).toEqual(expect.arrayContaining(['TOPN', 'RATIO', 'EXIST_RATIO', 'PERCENTILE', 'VARIANCE', 'STDDEV']));
  });
});
