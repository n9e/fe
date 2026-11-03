import { buildStatSparklineData, hasDrawableSparklineValue } from './statGraphData';
import type { StatSparklinePoint } from './statGraphData';

describe('buildStatSparklineData', () => {
  it('preserves gaps instead of turning empty values into zero', () => {
    const data: StatSparklinePoint[] = [
      [1000, 1],
      [2000, null],
      [3000, undefined],
      [4000, Number.NaN],
      [5000, ''],
      [6000, 'not-a-number'],
      [7000, 7],
    ];

    expect(buildStatSparklineData(data)).toEqual([
      [1000, 2000, 3000, 4000, 5000, 6000, 7000],
      [1, null, null, null, null, null, 7],
    ]);
  });

  it('keeps numeric strings as numbers and sorts timestamps ascending', () => {
    expect(
      buildStatSparklineData([
        [3000, '3.5'],
        [1000, 1],
        [2000, '2'],
      ]),
    ).toEqual([
      [1000, 2000, 3000],
      [1, 2, 3.5],
    ]);
  });

  it('keeps the last value for duplicated timestamps', () => {
    expect(
      buildStatSparklineData([
        [1000, 1],
        [1000, 9],
        [2000, 2],
      ]),
    ).toEqual([
      [1000, 2000],
      [9, 2],
    ]);
  });

  it('drops points whose timestamp cannot locate the x axis', () => {
    expect(
      buildStatSparklineData([
        [Number.NaN, 1],
        [1000, 2],
      ]),
    ).toEqual([[1000], [2]]);
  });

  it('returns empty aligned data for missing input', () => {
    expect(buildStatSparklineData()).toEqual([[], []]);
    expect(buildStatSparklineData([])).toEqual([[], []]);
  });
});

describe('hasDrawableSparklineValue', () => {
  it('reports whether any point has a numeric value', () => {
    expect(
      hasDrawableSparklineValue([
        [1000, null],
        [2000, ''],
      ]),
    ).toBe(false);
    expect(
      hasDrawableSparklineValue([
        [1000, null],
        [2000, 0],
      ]),
    ).toBe(true);
    expect(hasDrawableSparklineValue()).toBe(false);
  });
});
