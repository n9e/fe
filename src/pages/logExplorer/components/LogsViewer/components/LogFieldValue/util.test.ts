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
});
