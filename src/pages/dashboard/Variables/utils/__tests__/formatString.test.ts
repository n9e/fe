/// <reference types="jest" />

import { formatString, formatDatasource } from '../formatString';

describe('formatString', () => {
  test('replaces $var with ${var} and resolves value', () => {
    expect(formatString('x=$a', { a: 1 })).toBe('x=1');
  });

  test('supports smart boundary for $varSuffix by matching shortest existing var', () => {
    expect(formatString('$aSuffix', { a: '1' })).toBe('1Suffix');
  });

  test('replaces [[var]] only when var exists', () => {
    expect(formatString('[[a]]', { a: 1 })).toBe('1');
    expect(formatString('[[missing]]', { a: 1 })).toBe('[[missing]]');
  });

  test('replaces ${key} when key exists, including dot keys', () => {
    expect(formatString('${__field.labels.ident}', { '__field.labels.ident': 'x' })).toBe('x');
  });

  test('keeps ${...} when key does not exist', () => {
    expect(formatString('${missing}', { a: 1 })).toBe('${missing}');
  });
});

describe('formatDatasource', () => {
  test('converts formatted result to number', () => {
    expect(formatDatasource('${ds}', { ds: '12' })).toBe(12);
  });

  test('returns NaN when formatted result is not numeric', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(Number.isNaN(formatDatasource('${ds}', { ds: 'abc' }) as any)).toBe(true);
    warnSpy.mockRestore();
  });
});
