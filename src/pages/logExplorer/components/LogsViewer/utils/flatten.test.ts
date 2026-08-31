import flatten from './flatten';

describe('flatten maxDepth', () => {
  test('maxDepth=1 does not recurse, keeps nested object as object', () => {
    const result = flatten({ a: { b: 1 } }, { maxDepth: 1 });
    expect(result).toEqual({ a: { b: 1 } });
    expect(result['a.b']).toBeUndefined();
  });

  test('maxDepth=2 expands one level and keeps deeper parts whole', () => {
    const result = flatten({ a: { b: { c: 1 } } }, { maxDepth: 2 });
    expect(result).toEqual({ 'a.b': { c: 1 } });
  });

  test('maxDepth=2 expands all sibling nested fields, not just the first', () => {
    expect(flatten({ labels: { a: 1 }, meta: { b: 2 } }, { maxDepth: 2 })).toEqual({ 'labels.a': 1, 'meta.b': 2 });
  });

  test('sibling expansion is correct at deeper levels too', () => {
    expect(flatten({ a: { b: { c: 1 }, d: { e: 2 } } }, { maxDepth: 3 })).toEqual({ 'a.b.c': 1, 'a.d.e': 2 });
  });

  test('no opts expands to unlimited depth (legacy behavior)', () => {
    expect(flatten({ a: { b: { c: { d: 1 } } } })).toEqual({ 'a.b.c.d': 1 });
  });

  test('flattenDepth=1 convention maps to maxDepth=2 (labels.rule_note)', () => {
    // 调用方约定:flattenDepth = N 对应 flatten 的 maxDepth = N + 1
    expect(flatten({ labels: { rule_note: 'value' } }, { maxDepth: 2 })).toEqual({ 'labels.rule_note': 'value' });
  });

  test('explicit maxDepth wins over internal default 3', () => {
    const deep = { a: { b: { c: { d: 1 } } } };
    expect(flatten(deep, { maxDepth: 2 })).toEqual({ 'a.b': { c: { d: 1 } } });
    expect(flatten(deep, { maxDepth: 4 })).toEqual({ 'a.b.c.d': 1 });
  });

  test('nested empty object is stringified', () => {
    expect(flatten({ a: {} }, { maxDepth: 1 })).toEqual({ a: '{}' });
  });

  test('arrays are stringified', () => {
    expect(flatten({ a: [1, 2] }, { maxDepth: 1 })).toEqual({ a: '[1,2]' });
  });

  test('flat values pass through untouched', () => {
    expect(flatten({ a: 'x', b: 1, c: null }, { maxDepth: 1 })).toEqual({ a: 'x', b: 1, c: null });
  });
});
