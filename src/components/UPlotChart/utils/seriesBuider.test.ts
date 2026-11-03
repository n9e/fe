/** @jest-environment jsdom */
import uPlot from 'uplot';
import seriesBuider, { BarAlignment, getBarStart } from './seriesBuider';

class RecordingPath2D {
  rectangles: number[][] = [];

  rect(...args: number[]) {
    this.rectangles.push(args);
  }
}

function drawBars(barAlignment?: BarAlignment, barWidthFactor?: number, bucketInterval?: number, overrides?: unknown[]) {
  const series = seriesBuider({
    baseSeries: [{ label: 'A', n9e_internal: { refId: 'A', bucketInterval } } as uPlot.Series],
    colors: ['#000'],
    pathsType: overrides ? 'linear' : 'bars',
    width: 0,
    barAlignment,
    barWidthFactor,
    overrides,
  });
  const data = [
    [1000, 1015, 1030],
    [10, 20, 30],
  ];
  // 使用真实的 uPlot 路径生成器，只替换 Canvas 路径以记录最终柱形几何。
  const chart = {
    mode: 1,
    data,
    _data: data,
    series: [{ scale: 'x' }, { ...series[1], pxRound: (value: number) => value, fillTo: () => 0 }],
    scales: { x: { ori: 0, dir: 1 }, y: { ori: 1, dir: 1 } },
    bbox: { left: 0, top: 0, width: 300, height: 100 },
    valToPosH: (value: number) => (value - 1000) * 10,
    valToPosV: (value: number) => 100 - value,
  } as unknown as uPlot;
  const paths = series[1].paths!(chart, 1, 0, 2);
  return (paths?.fill as unknown as RecordingPath2D).rectangles;
}

describe('timeseries bar geometry', () => {
  const originalPath2D = globalThis.Path2D;

  beforeAll(() => {
    globalThis.Path2D = RecordingPath2D as unknown as typeof Path2D;
  });

  afterAll(() => {
    globalThis.Path2D = originalPath2D;
  });

  it.each([
    [-1, 120],
    [0, 135],
    [1, 150],
  ] as const)('aligns ordinary time series with %s relative to the timestamp', (alignment, expectedLeft) => {
    expect(drawBars(alignment, 0.2)[1]).toEqual([expectedLeft, 80, 30, 20]);
  });

  it.each([0.1, 0.2, 0.6, 1])('uses width factor %s without bucket metadata', (factor) => {
    expect(drawBars(1, factor)[1][2]).toBeCloseTo(150 * factor);
  });

  it('defaults to centered bars occupying 60% of the sampling interval', () => {
    expect(drawBars()[1]).toEqual([105, 80, 90, 20]);
  });

  it.each([
    [-1, 90],
    [0, 120],
    [1, 150],
  ] as const)('preserves explicit time bucket widths with %s alignment', (alignment, expectedLeft) => {
    expect(drawBars(alignment, 0.2, 30)[1]).toEqual([expectedLeft, 80, 60, 20]);
  });

  it('applies bar settings when an override selects the bar draw style', () => {
    expect(drawBars(-1, 0.2, undefined, [{ matcher: { id: 'byFrameRefID', value: 'A' }, properties: { drawStyle: 'bars' } }])[1]).toEqual([120, 80, 30, 20]);
  });
});

describe('getBarStart', () => {
  it.each([
    [-1, 700],
    [0, 850],
    [1, 1000],
  ] as const)('uses %s alignment', (alignment, expected) => {
    expect(getBarStart(1000, 300, alignment)).toBe(expected);
  });
});
