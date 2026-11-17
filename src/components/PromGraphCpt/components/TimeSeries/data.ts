import _ from 'lodash';
import type { IStandardOptions } from '@/pages/dashboard/types';
import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';

export interface PromSeries {
  id: string;
  name: string;
  metric: Record<string, string>;
  data: [number, number | string | null][];
}

export interface PlotSeries {
  label: string;
  show: boolean;
  n9e_internal: { id: string; refId: string; metric: Record<string, string>; values?: (number | null)[] };
}

export type DataFrame = [number[], ...(number | null)[][]];
export const legendColumns = ['max', 'min', 'avg', 'sum', 'last'] as const;
export type LegendColumn = (typeof legendColumns)[number];
type LegendValue = ReturnType<typeof valueFormatter>;
export type LegendItem = Record<LegendColumn, LegendValue> & {
  id: string;
  name: string;
  metric: Record<string, string>;
  color: string;
  show: boolean;
};

/** 按时间对齐 Prom 序列；缺失值保留为 null，使折线断开。 */
export function getPlotData(series: PromSeries[]): { frames: DataFrame; baseSeries: PlotSeries[] } {
  const timestamps = Array.from(new Set(series.flatMap((item) => item.data.map(([time]) => time)))).sort((a, b) => a - b);
  const indexes = new Map(timestamps.map((time, index) => [time, index]));
  const frames: DataFrame = [timestamps];
  const baseSeries = series.map((item) => {
    const values: (number | null)[] = Array(timestamps.length).fill(null);
    item.data.forEach(([time, value]) => {
      values[indexes.get(time)!] = typeof value === 'string' ? Number(value) : value;
    });
    frames.push(values);
    return { label: item.name, show: true, n9e_internal: { id: item.id, refId: 'A', metric: item.metric } };
  });
  return { frames, baseSeries };
}

/** 使用与新版时序图相同的对齐后数据计算图例，统计值不受堆叠影响。 */
export function getLegendData(frames: DataFrame, series: PlotSeries[], colors: string[], standardOptions?: IStandardOptions): LegendItem[] {
  const options = standardOptions || {};
  return series.map((item, index) => {
    // 对齐后缺失的采样是 null，不参与统计；否则 Avg 会被 gap 稀释，Last 可能取到空值。
    const values = (frames[index + 1] || []).filter((value): value is number => value != null);
    return {
      id: item.n9e_internal.id,
      name: item.label,
      metric: item.n9e_internal.metric,
      color: colors[index % colors.length],
      show: item.show,
      max: valueFormatter(options, _.max(values)),
      min: valueFormatter(options, _.min(values)),
      avg: valueFormatter(options, _.mean(values)),
      sum: valueFormatter(options, _.sum(values)),
      last: valueFormatter(options, _.last(values)),
    };
  });
}
