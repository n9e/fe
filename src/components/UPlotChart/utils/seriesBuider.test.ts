import { getBarStart } from './seriesBuider';

describe('getBarStart', () => {
  it.each([
    [-1, 700],
    [0, 850],
    [1, 1000],
  ] as const)('uses %s alignment', (alignment, expected) => {
    expect(getBarStart(1000, 300, alignment)).toBe(expected);
  });
});
