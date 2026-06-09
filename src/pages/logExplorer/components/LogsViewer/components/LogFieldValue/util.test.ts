import { toString } from './util';

describe('LogFieldValue util toString', () => {
  it('returns empty string for undefined', () => {
    expect(toString(undefined)).toBe('');
  });

  it('returns the original string unchanged', () => {
    expect(toString('abc')).toBe('abc');
  });

  it('serializes null and plain objects safely', () => {
    expect(toString(null)).toBe('null');
    expect(toString({ foo: 'bar' })).toBe('{"foo":"bar"}');
  });

  it('returns a stable fallback for circular objects', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    expect(toString(circular)).toBe('unknow');
  });

  it('serializes deeply nested objects', () => {
    const obj = { a: { b: { c: [1, 2, { d: 'e' }] } } };
    expect(toString(obj)).toBe('{"a":{"b":{"c":[1,2,{"d":"e"}]}}}');
  });

  it('serializes arrays with mixed types', () => {
    const arr = [1, 'two', null, { three: 3 }];
    expect(toString(arr)).toBe('[1,"two",null,{"three":3}]');
  });

  it('serializes empty object and empty array', () => {
    expect(toString({})).toBe('{}');
    expect(toString([])).toBe('[]');
  });

  it('serializes number zero and boolean false correctly', () => {
    expect(toString(0)).toBe('0');
    expect(toString(false)).toBe('false');
    expect(toString(true)).toBe('true');
  });

  it('handles objects with numeric keys', () => {
    const obj = { 0: 'a', 1: 'b' };
    expect(toString(obj)).toBe('{"0":"a","1":"b"}');
  });

  it('does not throw on objects with toJSON', () => {
    const obj = {
      toJSON: () => ({ serialized: true }),
    };
    expect(toString(obj)).toBe('{"serialized":true}');
  });
});
