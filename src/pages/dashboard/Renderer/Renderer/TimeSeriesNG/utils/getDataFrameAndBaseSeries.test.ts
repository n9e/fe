/// <reference types="jest" />

jest.mock('lodash', () => {
  const lodash = jest.requireActual('lodash');
  return {
    __esModule: true,
    default: lodash,
    ...lodash,
  };
});

import getDataFrameAndBaseSeries, { getDataFrameAndBaseSeriesByResult } from './getDataFrameAndBaseSeries';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils/index';

describe('getDataFrameAndBaseSeries', () => {
  it('keeps null as the default alignment placeholder for generic callers', () => {
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

    // Series A: 在 t=1000 有值 10，t=2000 仅由另一序列提供，默认保留旧版 null。
    expect(frames[1]).toEqual([10, null]);

    // Series B: 在 t=1000 仅由另一序列提供，默认保留旧版 null。
    expect(frames[2]).toEqual([null, 20]);

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

    // Series A: 在 t=1000 有值 10, t=2000 是对齐占位, t=3000 有值 30
    expect(frames[1]).toEqual([10, null, 30]);

    // Series B: 在 t=1000 是对齐占位, t=2000 有值 20, t=3000 有值 300
    expect(frames[2]).toEqual([null, 20, 300]);
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

  it('uses null for Prometheus alignment positions and undefined for non-Prometheus positions', () => {
    const { frames } = getDataFrameAndBaseSeriesByResult(
      [
        {
          ref: 'A',
          data: [
            {
              ref: 'A',
              refId: 'A',
              name: 'Prometheus',
              metric: {},
              values: [
                [1000, 1],
                [1015, null],
                [1030, 3],
              ] as Array<[number, number | null]>,
              target: { legend: '', datasource: { cate: 'prometheus', id: 1 } },
              isExp: false,
            },
          ],
        },
        {
          ref: 'B',
          data: [
            {
              ref: 'B',
              refId: 'B',
              name: 'Doris',
              metric: {},
              values: [[1020, 100]] as Array<[number, number | null]>,
              target: { legend: '', datasource: { cate: 'doris', id: 2 } },
              isExp: false,
            },
          ],
        },
      ],
      {
        getAlignmentPlaceholder: (series) => (series.target?.datasource?.cate === 'prometheus' ? null : undefined),
      },
    );

    expect(frames).toEqual([
      [1000, 1015, 1020, 1030],
      [1, null, null, 3],
      [undefined, undefined, 100, undefined],
    ]);
  });

  it('uses the derived Prometheus category for expression alignment', () => {
    const { frames } = getDataFrameAndBaseSeries(
      [
        {
          id: 'expression',
          refId: 'B',
          datasourceCate: 'prometheus',
          metric: {},
          data: [
            [1000, 2],
            [1030, 6],
          ],
        },
        {
          id: 'doris',
          refId: 'C',
          datasourceCate: 'doris',
          metric: {},
          data: [[1015, 100]],
        },
      ],
      {
        getAlignmentPlaceholder: (series) => (series.datasourceCate === 'prometheus' ? null : undefined),
      },
    );

    expect(frames).toEqual([
      [1000, 1015, 1030],
      [2, null, 6],
      [undefined, 100, undefined],
    ]);
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

  it('preserves an ES bucket interval on the corresponding base series', () => {
    const { baseSeries } = getDataFrameAndBaseSeries([
      {
        id: 'series-01',
        refId: 'A',
        metric: {},
        data: [[1000, 10] as [number, number]],
        bucketInterval: 300,
      },
    ]);

    expect(baseSeries[0].n9e_internal.bucketInterval).toBe(300);
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

  it('should preserve nulls inserted by completeBreakpoints at time gaps', () => {
    // 模拟用户提供的客户环境排查数据
    // Series 1: uri="/**" — 缺口前后值均为 0
    // Series 2: uri="/health/check" — 缺口前值下降到 0, 缺口后突增到 5452
    // 数据间隔 15s, 缺口约 46 分钟 (1781699160 → 1781701950)
    const step = 15;
    const rawSeries1: [number, number][] = [
      [1781699130, 0],
      [1781699145, 0],
      [1781701950, 0],
      [1781701965, 0],
    ];
    const rawSeries2: [number, number][] = [
      [1781699130, 20],
      [1781699145, 0],
      [1781699160, 0],
      [1781701950, 5452],
    ];

    // 模拟 prometheus.ts 中的 completeBreakpoints(step, serie.values)
    const series1Data = completeBreakpoints(step, rawSeries1);
    const series2Data = completeBreakpoints(step, rawSeries2);

    // 构建 getDataFrameAndBaseSeries 所需的 OldSeriesItem[]
    const oldSeries = [
      {
        id: 'series_01',
        refId: 'A',
        metric: { deployment: 'iam-oss-az01', namespace: 'cloudpath', uri: '/**' },
        name: '/**',
        target: { datasource: { cate: 'prometheus', id: 1 } },
        data: series1Data,
      },
      {
        id: 'series_02',
        refId: 'A',
        metric: { deployment: 'iam-oss-az01', namespace: 'cloudpath', uri: '/iam-oss/api/health/check' },
        name: '/health/check',
        target: { datasource: { cate: 'prometheus', id: 1 } },
        data: series2Data,
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);
    const timestamps = frames[0];
    const series1Frame = frames[1];
    const series2Frame = frames[2];

    // 验证时间轴包含缺口附近的全部时间戳
    expect(timestamps).toContain(1781699130);
    expect(timestamps).toContain(1781699145);
    expect(timestamps).toContain(1781699160);
    expect(timestamps).toContain(1781699175);
    expect(timestamps).toContain(1781701950);
    expect(timestamps).toContain(1781701965);

    // Series 1: completeBreakpoints 在 1781699145+15=1781699160 处插入了 null
    const idx_s1_null = timestamps.indexOf(1781699160);
    expect(series1Frame[idx_s1_null]).toBeNull();

    // Series 1 在缺口后的首点 1781701950 值应保留为 0
    const idx_s1_after = timestamps.indexOf(1781701950);
    expect(series1Frame[idx_s1_after]).toBe(0);

    // Series 2: completeBreakpoints 在 1781699160+15=1781699175 处插入了 null
    const idx_s2_null = timestamps.indexOf(1781699175);
    expect(series2Frame[idx_s2_null]).toBeNull();

    // Series 2 在缺口前的最后一点 1781699160 值应保留为 0
    const idx_s2_before = timestamps.indexOf(1781699160);
    expect(series2Frame[idx_s2_before]).toBe(0);

    // Series 2 在缺口后的首点 1781701950 值应保留为 5452
    const idx_s2_after = timestamps.indexOf(1781701950);
    expect(series2Frame[idx_s2_after]).toBe(5452);

    // 验证缺口内部: extendTimestampsWithNullGaps 在 gapEnd-1=1781701949 处插入了 null
    // Series 2 在 1781699175 由 completeBreakpoints 插入了 null
    // 这些 null 能确保 uPlot 的 findGaps(===null) 检测到缺口并正确裁剪
    const gapStart = 1781699160;
    const gapEnd = 1781701950;
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] > gapStart && timestamps[i] < gapEnd) {
        // Series 1: 缺口边界处为 null（来自 gap detection 或 completeBreakpoints）
        expect(series1Frame[i]).not.toEqual(expect.any(Number));
        // Series 2: 同样不应有真实数值（应为 null）
        expect(series2Frame[i]).not.toEqual(expect.any(Number));
      }
    }

    // 验证 baseSeries 的信息
    expect(baseSeries).toHaveLength(2);
    expect(baseSeries[0].label).toBe('/**');
    expect(baseSeries[1].label).toBe('/health/check');
    expect(baseSeries[0].n9e_internal.refId).toBe('A');
    expect(baseSeries[1].n9e_internal.refId).toBe('A');
  });

  it('should force null gap when other series are continuous through the gap', () => {
    // 真实场景: iam-oss-az01/health/check 有缺口,
    // 但 iam-oss-az02/health/check 连续无缺口, 会向合并时间轴贡献大量中间时间戳
    const step = 15;

    // Series A: 有缺口 (az01)
    const rawGapped: [number, number][] = [
      [1781699145, 0],
      [1781699160, 0],
      [1781701950, 5452],
      [1781701965, 5762],
    ];

    // Series B: 连续贯穿缺口 (az02) — 贡献中间时间戳 1781699175, 1781699190, 1781699205
    const rawContinuous: [number, number][] = [
      [1781699145, 123],
      [1781699160, 122],
      [1781699175, 119],
      [1781699190, 120],
      [1781699205, 120],
      [1781701950, 118],
      [1781701965, 120],
    ];

    const gappedData = completeBreakpoints(step, rawGapped);
    const continuousData = completeBreakpoints(step, rawContinuous);

    const oldSeries = [
      {
        id: 'series_az01',
        refId: 'A',
        metric: { deployment: 'iam-oss-az01', namespace: 'cloudpath', uri: '/iam-oss/api/health/check' },
        name: 'az01 health/check',
        target: { datasource: { cate: 'prometheus', id: 1 } },
        data: gappedData,
      },
      {
        id: 'series_az02',
        refId: 'A',
        metric: { deployment: 'iam-oss-az02', namespace: 'cloudpath', uri: '/iam-oss/api/health/check' },
        name: 'az02 health/check',
        target: { datasource: { cate: 'prometheus', id: 1 } },
        data: continuousData,
      },
    ];

    const { frames, baseSeries } = getDataFrameAndBaseSeries(oldSeries);
    const timestamps = frames[0];
    const gappedFrame = frames[1]; // az01 - 有缺口
    const continuousFrame = frames[2]; // az02 - 连续

    // verify: continuous series has real values at all its timestamps
    for (const ts of [1781699175, 1781699190, 1781699205]) {
      const idx = timestamps.indexOf(ts);
      expect(continuousFrame[idx]).toEqual(expect.any(Number));
    }

    // verify: Prometheus 保持旧版语义，连续序列提供的对齐时间戳也为 null。
    const gapStart = 1781699160;
    const gapEnd = 1781701950;
    for (let i = 0; i < timestamps.length; i++) {
      if (timestamps[i] > gapStart && timestamps[i] < gapEnd) {
        expect(gappedFrame[i]).toBeNull();
      }
    }

    // verify: gapped series preserves values before and after gap
    const idxBefore = timestamps.indexOf(1781699160);
    expect(gappedFrame[idxBefore]).toBe(0);
    const idxAfter = timestamps.indexOf(1781701950);
    expect(gappedFrame[idxAfter]).toBe(5452);

    expect(baseSeries).toHaveLength(2);
    expect(baseSeries[0].label).toBe('az01 health/check');
    expect(baseSeries[1].label).toBe('az02 health/check');
  });
});
