import { getLegendData, getPlotData } from './data';
import type { PromSeries } from './data';

const series: PromSeries[] = [
  {
    id: 'a',
    name: 'a',
    metric: { host: 'one' },
    data: [
      [1, '2'],
      [3, '6'],
    ],
  },
  {
    id: 'b',
    name: 'b',
    metric: { host: 'two' },
    data: [
      [2, '3'],
      [3, null],
    ],
  },
];

it('aligns timestamps and preserves missing Prom samples as gaps', () => {
  const { frames, baseSeries } = getPlotData(series);
  expect(frames).toEqual([
    [1, 2, 3],
    [2, null, 6],
    [null, 3, null],
  ]);
  expect(baseSeries.map((item) => item.n9e_internal.id)).toEqual(['a', 'b']);
});

it('computes legend statistics from present samples only, skipping alignment gaps', () => {
  const { frames, baseSeries } = getPlotData(series);
  const legend = getLegendData(frames, baseSeries, ['red', 'blue'], { unit: 'none' });
  expect(legend[0].max.stat).toBe(6);
  expect(legend[0].min.stat).toBe(2);
  expect(legend[0].sum.stat).toBe(8);
  expect(legend[0].avg.stat).toBe(4);
  expect(legend[1].last.stat).toBe(3);
  expect(legend[1].color).toBe('blue');
});

it('supports an empty result and no formatting configuration', () => {
  expect(getPlotData([])).toEqual({ frames: [[]], baseSeries: [] });
  const { frames, baseSeries } = getPlotData(series);
  expect(getLegendData(frames, baseSeries, ['red'])).toHaveLength(2);
});
