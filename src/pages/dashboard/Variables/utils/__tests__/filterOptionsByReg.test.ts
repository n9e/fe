/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

import filterOptionsByReg from '../filterOptionsByReg';

describe('filterOptionsByReg', () => {
  test('returns original options mapped to {label,value} when reg is empty', () => {
    const res = filterOptionsByReg(['a', 'b']);
    expect(res).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' },
    ]);
  });

  test('filters by plain regex string (wrapped with ^...$)', () => {
    const res = filterOptionsByReg(['dev-a', 'prod-a', 'dev-b'], 'dev-.*');
    expect(res).toEqual([
      { label: 'dev-a', value: 'dev-a' },
      { label: 'dev-b', value: 'dev-b' },
    ]);
  });

  test('supports named groups text/value', () => {
    const res = filterOptionsByReg(['foo:1', 'bar:2'], '/(?<text>\\w+):(?<value>\\d+)/');
    expect(res).toEqual([
      { label: 'foo', value: '1' },
      { label: 'bar', value: '2' },
    ]);
  });

  test('expands many matches for global regex capturing group', () => {
    const res = filterOptionsByReg(['a,b,c', 'd,e'], '/([a-z])/g');
    expect(res).toEqual([
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' },
      { label: 'c', value: 'c' },
      { label: 'd', value: 'd' },
      { label: 'e', value: 'e' },
    ]);
  });

  test('falls back to full match when no capture groups exist', () => {
    const res = filterOptionsByReg(['dev-flasheye-01', 'prod-01'], '/dev.*/');
    expect(res).toEqual([{ label: 'dev-flasheye-01', value: 'dev-flasheye-01' }]);
  });

  test('returns original mapping when reg is invalid', () => {
    const res = filterOptionsByReg(['a'], '/[/');
    expect(res).toEqual([{ label: 'a', value: 'a' }]);
  });
});
