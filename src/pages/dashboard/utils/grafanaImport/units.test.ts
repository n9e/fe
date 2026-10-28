import { grafanaBuiltinColors, grafanaColorNameToBuiltinToken } from './units';

describe('Grafana builtin color conversion', () => {
  it.each(grafanaBuiltinColors)('maps $name to the N9E token $token', ({ name, token }) => {
    expect(grafanaColorNameToBuiltinToken(name)).toBe(token);
  });

  it('preserves custom colors and returns an empty value when no color is provided', () => {
    expect(grafanaColorNameToBuiltinToken('#12abef')).toBe('#12abef');
    expect(grafanaColorNameToBuiltinToken('rgba(1, 2, 3, 0.5)')).toBe('rgba(1, 2, 3, 0.5)');
    expect(grafanaColorNameToBuiltinToken('custom-color')).toBe('custom-color');
    expect(grafanaColorNameToBuiltinToken(undefined)).toBe('');
  });
});
