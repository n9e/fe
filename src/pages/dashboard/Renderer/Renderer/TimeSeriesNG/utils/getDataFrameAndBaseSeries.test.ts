/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

import getDataFrameAndBaseSeries from './getDataFrameAndBaseSeries';

describe('getDataFrameAndBaseSeries', () => {
  it('should align series with non-overlapping timestamps, filling missing with undefined', () => {
    const oldSeries = [
      {
        id: 'series-01',
        refId: 'A',
        metric: {},
        name: 'Series A',
        data: [[1000, 10] as [number, number]],
      },
      {
        id: 'series-02',
        refId: 'B',
        metric: {},
        name: 'Series B',
        data: [[2000, 20] as [number, number]],
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);

    // 时间轴包含两个时间戳，已排序
    expect(frames[0]).toEqual([1000, 2000]);

    // Series A: 在 t=1000 有值 10，在 t=2000 为 undefined
    expect(frames[1]).toEqual([10, undefined]);

    // Series B: 在 t=1000 为 undefined，在 t=2000 有值 20
    expect(frames[2]).toEqual([undefined, 20]);

    expect(baseSeries).toHaveLength(2);
    expect(baseSeries[0].label).toBe('Series A');
    expect(baseSeries[1].label).toBe('Series B');
  });

  it('should align series with partially overlapping timestamps', () => {
    const oldSeries = [
      {
        id: 'series-01',
        refId: 'A',
        metric: {},
        name: 'Series A',
        data: [[1000, 10] as [number, number], [3000, 30] as [number, number]],
      },
      {
        id: 'series-02',
        refId: 'B',
        metric: {},
        name: 'Series B',
        data: [[2000, 20] as [number, number], [3000, 300] as [number, number]],
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);

    // 时间轴包含三个时间戳，排序后为 [1000, 2000, 3000]
    expect(frames[0]).toEqual([1000, 2000, 3000]);

    // Series A: 在 t=1000 有值 10, t=2000 为 undefined, t=3000 有值 30
    expect(frames[1]).toEqual([10, undefined, 30]);

    // Series B: 在 t=1000 为 undefined, t=2000 有值 20, t=3000 有值 300
    expect(frames[2]).toEqual([undefined, 20, 300]);
  });

  it('should handle series with same timestamps correctly', () => {
    const oldSeries = [
      {
        id: 'series-01',
        refId: 'A',
        metric: {},
        name: 'Series A',
        data: [[1000, 10] as [number, number]],
      },
      {
        id: 'series-02',
        refId: 'B',
        metric: {},
        name: 'Series B',
        data: [[1000, 20] as [number, number]],
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);

    expect(frames[0]).toEqual([1000]);
    expect(frames[1]).toEqual([10]);
    expect(frames[2]).toEqual([20]);
  });

  it('should handle empty data gracefully', () => {
    const oldSeries = [
      {
        id: 'series-01',
        refId: 'A',
        metric: {},
        name: 'Series A',
        data: [],
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);

    expect(frames[0]).toEqual([]);
    expect(frames[1]).toEqual([]);
  });

  it('should generate label from metric when name is not provided', () => {
    const oldSeries = [
      {
        id: 'series-01',
        refId: 'A',
        metric: { __name__: 'cpu_usage', host: 'server1' },
        data: [[1000, 10] as [number, number]],
      },
    ];

    const { baseSeries } = getDataFrameAndBaseSeries(oldSeries);

    expect(baseSeries[0].label).toContain('cpu_usage');
    expect(baseSeries[0].label).toContain('host');
  });
});
