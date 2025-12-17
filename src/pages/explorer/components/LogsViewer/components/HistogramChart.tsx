import React, { useContext, useMemo } from 'react';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import TimeSeriesBarChart, { TimeSeriesDataPoint } from './TimeSeriesBarChart';

interface Props {
  series: any[];
  stacked: boolean;
  histogramXTitle?: string;
  onClick?: (start: number, end: number) => void;
  onZoomWithoutDefult?: (times: Date[]) => void;
}

export default function HistogramChart(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { series, stacked, histogramXTitle, onClick, onZoomWithoutDefult } = props;

  // 将原有 series 结构转换为 TimeSeriesBarChart 所需的数据结构
  const chartData: TimeSeriesDataPoint[] = useMemo(() => {
    if (!Array.isArray(series)) return [];
    // 兼容两种可能：
    // 1) series 为 [{ name, data: [[ts, val], ...] }, ...]
    // 2) series 为 [[ts, val], ...]
    const mapped = series.flatMap((s: any) => {
      const dataArr = Array.isArray(s?.data) ? s.data : Array.isArray(s) ? s : [];
      const category = s?.name;
      return dataArr.map((d: any) => {
        const ts = Array.isArray(d) ? d[0] : d?.time;
        const val = Array.isArray(d) ? d[1] : d?.value;
        // 原来使用的是 Unix 秒，TimeSeriesBarChart 期望毫秒时间戳
        const timeMs = typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts;
        return {
          time: timeMs,
          value: Number(val) || 0,
          category,
        } as TimeSeriesDataPoint;
      });
    });
    return mapped;
  }, [series]);

  // 计算步长（用于 x 轴刻度格式化）
  const stepMs = useMemo(() => {
    const times = chartData.map((d) => (typeof d.time === 'number' ? d.time : new Date(d.time).getTime())).filter((t) => Number.isFinite(t));
    const sortedUnique = _.sortBy(_.uniq(times));
    if (sortedUnique.length < 2) return undefined;

    let minDiff = Infinity;
    for (let i = 1; i < sortedUnique.length; i += 1) {
      const diff = sortedUnique[i] - sortedUnique[i - 1];
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
      }
    }

    return Number.isFinite(minDiff) ? Math.max(1, minDiff) : undefined;
  }, [chartData]);

  // 将原 onClick/onZoomWithoutDefult 回调映射到新组件回调
  const handleBarClick = (data: TimeSeriesDataPoint) => {
    if (onClick) {
      const start = typeof data.time === 'number' ? data.time : new Date(data.time).getTime();
      const end = start + (stepMs || 0);
      // start/end 单位均为毫秒时间戳，需要改成 unix 秒
      onClick(Math.floor(start / 1000), Math.floor(end / 1000));
    }
  };

  const handleBrushEnd = (range: [number, number]) => {
    if (onZoomWithoutDefult) {
      onZoomWithoutDefult([new Date(range[0]), new Date(range[1])]);
    }
  };

  // 直接渲染新的时序柱状图组件
  return (
    <div className='w-full min-w-0 h-full min-h-0'>
      <TimeSeriesBarChart
        data={chartData}
        height={120}
        onBarClick={handleBarClick}
        onBrushEnd={handleBrushEnd}
        stacked={stacked}
        stepMs={stepMs}
        darkMode={darkMode}
        xTitle={histogramXTitle}
      />
    </div>
  );
}
