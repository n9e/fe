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
import getDataFrameAndBaseSeries from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';
import { hexPalette } from '@/pages/dashboard/config';

const T1 = 1778293425;
const T2 = 1778293025;

const oldSeries = [
  { id: 'series-a', refId: 'A', metric: {}, name: 'Series A (t1)', data: [[T1, 100] as [number, number]] },
  { id: 'series-b', refId: 'B', metric: {}, name: 'Series B (t1)', data: [[T1, 50] as [number, number]] },
  { id: 'series-c', refId: 'C', metric: {}, name: 'Series C (t2)', data: [[T2, 200] as [number, number]] },
  { id: 'series-d', refId: 'D', metric: {}, name: 'Series D (t2)', data: [[T2, 80] as [number, number]] },
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

  // 对齐后的帧数据
  const { frames, baseSeries } = useMemo(() => getDataFrameAndBaseSeries(oldSeries), []);

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

  return (
    <div className='p-6 space-y-8'>
      <h1 className='text-xl font-bold'>UPlotChart Tooltip 测试</h1>

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
    </div>
  );
}
