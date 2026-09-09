import { formatPrometheusValue } from './value';

describe('formatPrometheusValue', () => {
  it.each([
    ['+Inf', '+Inf'],
    ['-Inf', '-Inf'],
    ['NaN', 'NaN'],
    ['Infinity', '+Inf'],
  ] as const)('keeps the Prometheus special float value %s visible', (value, expected) => {
    expect(formatPrometheusValue(value)).toBe(expected);
  });

  it('keeps invalid values as the no-value placeholder', () => {
    expect(formatPrometheusValue('not-a-number')).toBe('-');
  });

  it('formats a numeric string through the unit formatter', () => {
    expect(formatPrometheusValue('123')).toBe('123');
  });

  it('formats a number with a percent unit', () => {
    expect(formatPrometheusValue(123, 'percent')).toBe('123%');
  });
});
