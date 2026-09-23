import { getValueKey } from './utils';

describe('getValueKey', () => {
  it('falls back to metricKey when valueKey is undefined or empty', () => {
    expect(getValueKey({ metricKey: ['metric'] })).toBe('metric');
    expect(getValueKey({ valueKey: [], metricKey: ['metric'] })).toBe('metric');
    expect(getValueKey({ valueKey: '   ', metricKey: 'metric' })).toBe('metric');
  });

  it('prefers a non-empty valueKey', () => {
    expect(getValueKey({ valueKey: 'value', metricKey: 'metric' })).toBe('value');
    expect(getValueKey({ valueKey: ['value_a', 'value_b'], metricKey: ['metric'] })).toBe('value_a value_b');
  });

  it('returns an empty string when no key is configured', () => {
    expect(getValueKey()).toBe('');
    expect(getValueKey({ valueKey: [], metricKey: [] })).toBe('');
  });
});
