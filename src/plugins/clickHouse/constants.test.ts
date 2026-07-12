import { getCKFieldIconType } from './constants';

describe('getCKFieldIconType', () => {
  it.each([
    ['DateTime64(3)', 'date', 'date'],
    ['Nullable(DateTime)', 'date', 'date'],
    ['UInt64', 'long', 'number'],
    ['Decimal(18, 2)', 'long', 'number'],
    ['Bool', 'bool', 'boolean'],
    ['Nullable(Bool)', 'bool', 'boolean'],
    ['String', 'text', 'string'],
    ['Map(String, String)', 'map', undefined],
    ['Array(String)', 'array', undefined],
    ['JSON', 'json', undefined],
    ['IPv4', 'ipv4', 'string'],
  ])('maps %s (%s) to %s', (type, normalizedType, expected) => {
    expect(getCKFieldIconType(type, normalizedType)).toBe(expected);
  });
});
