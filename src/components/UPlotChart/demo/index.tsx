/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * UPlotChart Tooltip 多曲线时间不对齐手工测试场景
 *
 * 场景 1 — 非堆叠图：4 条曲线，两两对齐
 *    t1 (1778293425): Series A=100, Series B=50
 *    t2 (1778293025): Series C=200, Series D=80
 *    预期：hover t1 显示 A+B，hover t2 显示 C+D
 *
 * 场景 2 — 堆叠图：4 条曲线，两两对齐
 *    同上数据，启用 stacking
 *    预期：hover t1 显示 A+B 的原始值，hover t2 显示 C+D 的原始值
 */
import React, { useMemo } from 'react';
import _ from 'lodash';
import { AlignedData } from 'uplot';

import UPlotChart, { tooltipPlugin, paddingSide, axisBuilder, seriesBuider, cursorBuider, getStackedDataAndBands } from '@/components/UPlotChart';
import getDataFrameAndBaseSeries, { type DataFrameOptions, type OldSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';
import { completeBreakpoints } from '@/pages/dashboard/Renderer/datasource/utils';
import { hexPalette } from '@/pages/dashboard/config';

const T1 = 1778293425;
const T2 = 1778293025;

const oldSeries = [
  { id: 'series-a', refId: 'A', metric: {}, name: 'Series A (t1)', data: [[T1, 100] as [number, number]] },
  { id: 'series-b', refId: 'B', metric: {}, name: 'Series B (t1)', data: [[T1, 50] as [number, number]] },
  { id: 'series-c', refId: 'C', metric: {}, name: 'Series C (t2)', data: [[T2, 200] as [number, number]] },
  { id: 'series-d', refId: 'D', metric: {}, name: 'Series D (t2)', data: [[T2, 80] as [number, number]] },
];

// 跨年场景：2025-12-31 00:00:00 ~ 2026-01-02 00:00:00（UTC 时间戳），2h 一个点
const CROSS_YEAR_START = 1767139200;
const CROSS_YEAR_END = 1767312000;
const CROSS_YEAR_STEP = 2 * 3600;

const crossYearSeries = [
  {
    id: 'series-cross-year',
    refId: 'A',
    metric: {},
    name: 'Cross Year Requests',
    data: (() => {
      const points: [number, number][] = [];
      for (let t = CROSS_YEAR_START; t <= CROSS_YEAR_END; t += CROSS_YEAR_STEP) {
        points.push([t, Math.round(80 + 40 * Math.sin(((t - CROSS_YEAR_START) / 3600) * 0.7))]);
      }
      return points;
    })(),
  },
];

// 2026-09-18 12:00:00 ~ 13:00:00（Asia/Shanghai）。两条 Prom 样本都不返回 null；
// completeBreakpoints 仅根据各自 step 将真实缺口标记为 null。
const DIFFERENT_STEPS_START = 1789704000;
const DIFFERENT_STEPS_END = 1789707600;
const dashboardDataFrameOptions: DataFrameOptions = {
  getAlignmentPlaceholder: (series) => (series.target?.datasource?.cate === 'prometheus' ? null : undefined),
};

function createPrometheusMockSamples(step: number, gaps: Array<[startOffset: number, endOffset: number]>, base: number, amplitude: number, phase: number): Array<[number, number]> {
  const samples: Array<[number, number]> = [];
  for (let timestamp = DIFFERENT_STEPS_START; timestamp <= DIFFERENT_STEPS_END; timestamp += step) {
    const offset = timestamp - DIFFERENT_STEPS_START;
    if (gaps.some(([startOffset, endOffset]) => offset >= startOffset && offset < endOffset)) continue;
    samples.push([timestamp, Number((base + Math.sin(offset / (step * 7) + phase) * amplitude).toFixed(2))]);
  }
  return samples;
}

const differentPrometheusStepsSeries: OldSeriesItem[] = [
  {
    id: 'series-prom-15s',
    refId: 'A',
    metric: { __name__: 'mock_cpu_usage_15s', instance: 'mock-prom-01', step: '15s' },
    name: 'Prom 指标 A · step 15s',
    target: { datasource: { cate: 'prometheus', id: 1 } },
    data: completeBreakpoints(
      15,
      createPrometheusMockSamples(
        15,
        [
          [540, 840], // 12:09:00 - 12:14:00
          [2175, 2400], // 12:36:15 - 12:40:00
        ],
        62,
        18,
        0,
      ),
    ),
  },
  {
    id: 'series-prom-30s',
    refId: 'B',
    metric: { __name__: 'mock_memory_usage_30s', instance: 'mock-prom-01', step: '30s' },
    name: 'Prom 指标 B · step 30s',
    target: { datasource: { cate: 'prometheus', id: 1 } },
    data: completeBreakpoints(
      30,
      createPrometheusMockSamples(
        30,
        [
          [1200, 1620], // 12:20:00 - 12:27:00
          [2820, 3120], // 12:47:00 - 12:52:00
        ],
        48,
        12,
        Math.PI / 4,
      ),
    ),
  },
];

function createDorisMockSamples(): Array<[number, number]> {
  const samples: Array<[number, number]> = [];
  for (let timestamp = DIFFERENT_STEPS_START + 7; timestamp <= DIFFERENT_STEPS_END; timestamp += 45) {
    const offset = timestamp - DIFFERENT_STEPS_START;
    // Doris 原始数据缺失一段样本，但没有返回 null；前端不从 SQL 推断 step。
    if (offset >= 1800 && offset < 2070) continue;
    samples.push([timestamp, Number((35 + Math.cos(offset / 310) * 9).toFixed(2))]);
  }
  return samples;
}

// Prom 用 step 识别缺口；Doris 保持原始稀疏样本，不推断缺点。
const mixedPrometheusAndDorisSeries: OldSeriesItem[] = [
  {
    id: 'series-mixed-prom-15s',
    refId: 'A',
    metric: { __name__: 'mock_http_requests_15s', instance: 'mock-prom-02' },
    name: 'Prom · step 15s',
    target: { datasource: { cate: 'prometheus', id: 1 } },
    data: completeBreakpoints(
      15,
      createPrometheusMockSamples(
        15,
        [
          [1050, 1290], // 12:17:30 - 12:21:30
          [2700, 2880], // 12:45:00 - 12:48:00
        ],
        70,
        15,
        Math.PI / 6,
      ),
    ),
  },
  {
    id: 'series-mixed-doris-45s',
    refId: 'B',
    metric: { table: 'mock_doris_metrics', interval: '45s' },
    name: 'Doris · 稀疏样本',
    target: { datasource: { cate: 'doris', id: 2 } },
    data: createDorisMockSamples(),
  },
];

function useChartOptions({ id, baseSeries, frames, stacked }: { id: string; baseSeries: any[]; frames: AlignedData; stacked: boolean }) {
  return useMemo(() => {
    const width = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 900) : 800;
    const height = 320;

    let data: AlignedData = frames;
    let optSeries: any[] | undefined;

    if (stacked) {
      const { data: stackedData, bands } = getStackedDataAndBands(frames);
      data = _.concat([frames[0]], stackedData) as any;
      optSeries = _.map(baseSeries, (s, i) => ({
        ...s,
        n9e_internal: {
          ...s.n9e_internal,
          values: frames[i + 1], // 保存原始（pre-stack）值
        },
      }));
    }

    return {
      options: {
        width,
        height,
        padding: [paddingSide, paddingSide, paddingSide, paddingSide] as any,
        legend: { show: false },
        plugins: [
          tooltipPlugin({
            id,
            mode: 'all' as const,
            sort: 'none' as const,
            pinningEnabled: true,
          }),
        ],
        cursor: cursorBuider({}),
        scales: {} as any,
        series: seriesBuider({
          baseSeries: optSeries ?? baseSeries,
          colors: hexPalette,
          pathsType: 'linear' as const,
          points: { show: true },
          width: 2,
          fillOpacity: stacked ? 0.3 : 0,
        }),
        bands: stacked ? [{ series: [1, 2] as [number, number], dir: 1 }] : undefined,
        axes: [axisBuilder({ isTime: true, theme: 'light' }), axisBuilder({ scaleKey: 'y', theme: 'light' })],
      } as any,
      data,
    };
  }, [id, baseSeries, frames, stacked]);
}

function ScenarioCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className='mb-8'>
      <h2 className='text-base font-semibold mb-1'>{title}</h2>
      <p className='text-sm text-gray-600 mb-3'>{description}</p>
      {children}
    </div>
  );
}

export default function ChartDemo() {
  const nonStackedId = useMemo(() => _.uniqueId('demo_tooltip_'), []);
  const stackedId = useMemo(() => _.uniqueId('demo_tooltip_'), []);
  const crossYearId = useMemo(() => _.uniqueId('demo_crossyear_'), []);
  const differentPrometheusStepsId = useMemo(() => _.uniqueId('demo_prometheus_steps_'), []);
  const mixedPrometheusAndDorisId = useMemo(() => _.uniqueId('demo_prometheus_doris_'), []);

  // 对齐后的帧数据
  const { frames, baseSeries } = useMemo(() => getDataFrameAndBaseSeries(oldSeries), []);
  const crossYear = useMemo(() => getDataFrameAndBaseSeries(crossYearSeries), []);
  const differentPrometheusSteps = useMemo(() => getDataFrameAndBaseSeries(differentPrometheusStepsSeries, dashboardDataFrameOptions), []);
  const mixedPrometheusAndDoris = useMemo(() => getDataFrameAndBaseSeries(mixedPrometheusAndDorisSeries, dashboardDataFrameOptions), []);

  const { options: nonStackedOpts, data: nonStackedData } = useChartOptions({
    id: nonStackedId,
    baseSeries,
    frames,
    stacked: false,
  });

  const { options: stackedOpts, data: stackedData } = useChartOptions({
    id: stackedId,
    baseSeries,
    frames,
    stacked: true,
  });

  const { options: crossYearOpts, data: crossYearData } = useChartOptions({
    id: crossYearId,
    baseSeries: crossYear.baseSeries,
    frames: crossYear.frames,
    stacked: false,
  });

  const { options: differentPrometheusStepsOpts, data: differentPrometheusStepsData } = useChartOptions({
    id: differentPrometheusStepsId,
    baseSeries: differentPrometheusSteps.baseSeries,
    frames: differentPrometheusSteps.frames,
    stacked: false,
  });
  const { options: mixedPrometheusAndDorisOpts, data: mixedPrometheusAndDorisData } = useChartOptions({
    id: mixedPrometheusAndDorisId,
    baseSeries: mixedPrometheusAndDoris.baseSeries,
    frames: mixedPrometheusAndDoris.frames,
    stacked: false,
  });

  return (
    <div className='p-6 space-y-8'>
      <h1 className='text-xl font-bold'>UPlotChart 测试</h1>

      {/* 场景 1: 非堆叠图 */}
      <ScenarioCard
        title='场景 1：非堆叠图 · 4 条曲线两两时间对齐'
        description={'Series A(t1=100)、B(t1=50) 共享 t1 时间点；Series C(t2=200)、D(t2=80) 共享 t2 时间点。' + 'hover t1 时应只显示 A+B，hover t2 时应只显示 C+D。'}
      >
        <div className='mb-2 text-xs text-gray-500'>对齐后时间轴：[t2, t1]（2 个时间戳），每对曲线共享一个时间点</div>
        <UPlotChart id={nonStackedId} options={nonStackedOpts} data={nonStackedData} />
      </ScenarioCard>

      {/* 场景 2: 堆叠图 */}
      <ScenarioCard
        title='场景 2：堆叠图 · 4 条曲线两两时间对齐'
        description={
          '与场景 1 相同数据，启用 stacking。' + 'hover t1 时应只显示 A+B 的原始值，hover t2 时应只显示 C+D 的原始值。' + '堆叠累积值仅在图形上体现，tooltip 中展示原始值。'
        }
      >
        <div className='mb-2 text-xs text-gray-500'>堆叠图使用 n9e_internal.values 保存原始值，tooltip 展示原始值而非累积值</div>
        <UPlotChart id={stackedId} options={stackedOpts} data={stackedData} />
      </ScenarioCard>

      {/* 场景 3: 跨年 X 轴 */}
      <ScenarioCard
        title='场景 3：X 轴跨年 · 2025-12-31 00:00:00 ~ 2026-01-02 00:00:00'
        description={
          '2 小时一个点的日粒度数据。预期跨年处的日界刻度第二行显示年份：' +
          '首个日界刻度（12-31）显示 ↵2025，跨年刻度（01-01）显示 ↵2026，其余日界刻度单行。' +
          '同时观察 X 轴高度是否为两行标签自动扩展、无截断。'
        }
      >
        <div className='mb-2 text-xs text-gray-500'>时间戳范围 [1767139200, 1767312000]（UTC），标签按浏览器时区渲染；非 UTC 时区下年份仍会出现在跨年的日界刻度上</div>
        <UPlotChart id={crossYearId} options={crossYearOpts} data={crossYearData} />
      </ScenarioCard>

      <ScenarioCard
        title='场景 4：Prometheus 多指标 · 不同 step 与各自断点'
        description='2026-09-18 12:00:00 至 13:00:00（Asia/Shanghai）。指标 A 的 step 为 15 秒，指标 B 的 step 为 30 秒；原始样本均不含 null，但两条曲线各有两段缺失时间。Prometheus 在共同横轴上的对齐占位按旧语义填 null。'
      >
        <div className='mb-2 text-xs text-gray-500'>A 缺口：12:09–12:14、12:36:15–12:40；B 缺口：12:20–12:27、12:47–12:52。可在 tooltip 中确认两条曲线的采样点不同。</div>
        <UPlotChart id={differentPrometheusStepsId} options={differentPrometheusStepsOpts} data={differentPrometheusStepsData} />
      </ScenarioCard>

      <ScenarioCard
        title='场景 5：Prometheus + Doris · 各自原始缺口'
        description='2026-09-18 12:00:00 至 13:00:00（Asia/Shanghai）。Prom 每 15 秒采样，缺失区间由 step 补为 null；Doris 每 45 秒返回一个偏移 7 秒的样本，缺少一段原始样本但不返回 null。Doris 因 Prom 横轴产生的位置均为 undefined，因此会跨过自身的稀疏缺口保持连线。'
      >
        <div className='mb-2 text-xs text-gray-500'>
          Prom 缺口：12:17:30–12:21:30、12:45–12:48；Doris 缺样本：12:30:07–12:33:52（无 null）。可观察 Doris 不会被 Prom 的 15 秒横轴额外断开，也不会根据缺样本自行断线。
        </div>
        <UPlotChart id={mixedPrometheusAndDorisId} options={mixedPrometheusAndDorisOpts} data={mixedPrometheusAndDorisData} />
      </ScenarioCard>
    </div>
  );
}
