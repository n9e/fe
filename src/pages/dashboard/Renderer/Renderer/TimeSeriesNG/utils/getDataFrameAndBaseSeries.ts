import _ from 'lodash';
import { Series } from 'uplot';
import type { ITarget } from '@/pages/dashboard/types';
import getSerieName from '../../../utils/getSerieName';

interface ResultItem {
  ref: string;
  data: {
    ref: string;
    refId: string;
    name: string;
    metric: { [key: string]: string };
    values: [Ts: number, Value: number | null][]; // [unixTimestamp, value]
    target: Pick<ITarget, 'datasource' | 'legend'>;
    isExp: boolean;
  }[];
}

interface AlignmentSeries {
  target?: Pick<ITarget, 'datasource'>;
  datasourceCate?: string;
}

interface OldSeriesItem extends AlignmentSeries {
  id: string;
  refId: string;
  offset?: number;
  metric: { [key: string]: string };
  target?: Pick<ITarget, 'datasource' | 'expr' | 'legend'>;
  data: [Ts: number, Value: number | null][]; // [unixTimestamp, value]
  name?: string;
  isExp?: boolean;
  bucketInterval?: number;
}

export type { OldSeriesItem };

export type DataFrame = [xValues: number[], ...yValues: (number | null | undefined)[][]];

export interface DataFrameOptions {
  /**
   * 默认 null，兼容 Explorer 等既有调用方的 uPlot 断线行为。
   * Dashboard 可按数据源语义覆盖：Prometheus 为 null，非 Prom 为 undefined。
   */
  getAlignmentPlaceholder?: (series: AlignmentSeries) => null | undefined;
}

const defaultAlignmentPlaceholder = () => null;

/**
 * Convert the result to a DataFrame
 * @param result ResultItem[]
 * @returns DataFrame
 */
export function getDataFrameAndBaseSeriesByResult(
  result: ResultItem[],
  options: DataFrameOptions = {},
): {
  frames: DataFrame;
  baseSeries: Series[];
} {
  const getAlignmentPlaceholder = options.getAlignmentPlaceholder ?? defaultAlignmentPlaceholder;
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];
  const baseSeries: Series[] = [];

  // Extract all timestamps
  for (const item of result) {
    for (const data of item.data) {
      const label = data.name === undefined ? getSerieName(data.metric, { legend: data.target?.legend, ref: data.isExp ? data.refId : undefined }) : (data.name as string);
      baseSeries.push({ label });
      for (const [ts] of data.values) {
        // Add timestamp if not exists
        if (!timestamps.includes(ts)) {
          timestamps.push(ts);
        }
      }
    }
  }

  // Sort timestamps
  timestamps.sort((a, b) => a - b);
  frames[0] = timestamps;

  // 通用工具默认保留 null；Dashboard 通过 options 传入数据源级别策略。
  for (const item of result) {
    for (const data of item.data) {
      const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), getAlignmentPlaceholder(data));
      for (const [ts, value] of data.values) {
        const index = timestamps.indexOf(ts);
        frame[index] = value;
      }
      frames.push(frame);
    }
  }

  return { frames, baseSeries };
}

export interface BaseSeriesItem {
  show: boolean;
  label: string;
  n9e_internal: {
    id: string;
    refId: string;
    bucketInterval?: number;
    offset?: number;
    metric: Record<string, string>;
    values?: (number | null | undefined)[];
  };
}

/**
 * Convert the series to a DataFrame
 * @param oldSeries OldSeriesItem[]
 * @returns DataFrame
 */
export default function getDataFrameAndBaseSeries(
  oldSeries: OldSeriesItem[],
  options: DataFrameOptions = {},
): {
  frames: DataFrame;
  baseSeries: BaseSeriesItem[];
} {
  const getAlignmentPlaceholder = options.getAlignmentPlaceholder ?? defaultAlignmentPlaceholder;
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];
  const baseSeries: BaseSeriesItem[] = [];

  // Extract all timestamps
  for (const item of oldSeries) {
    // TODO: 如果没有在 datasource 环节里面设置 name，这里根据 metric、target、refId 生成一个 name
    const label = item.name === undefined ? getSerieName(item.metric, { legend: item.target?.legend, ref: item.isExp ? item.refId : undefined }) : (item.name as string);
    baseSeries.push({
      show: true,
      label,
      // n9e 内部使用
      n9e_internal: {
        id: item.id,
        refId: item.refId,
        bucketInterval: item.bucketInterval,
        offset: item.offset,
        metric: item.metric,
      },
    });
    if (item.data) {
      for (const [ts] of item.data) {
        // Add timestamp if not exists
        if (!timestamps.includes(ts)) {
          timestamps.push(ts);
        }
      }
    }
  }

  // Sort timestamps
  timestamps.sort((a, b) => a - b);
  frames[0] = timestamps;

  // 通用工具默认保留 null；Dashboard 通过 options 传入数据源级别策略。
  for (const item of oldSeries) {
    const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), getAlignmentPlaceholder(item));
    if (item.data) {
      for (const [ts, value] of item.data) {
        const index = timestamps.indexOf(ts);

        // Add value to frame
        // 如果是 string 类型的数值，转换为 number 类型，其他类似可能为 number、null 等类型的值不做处理
        frame[index] = _.isString(value) ? _.toNumber(value) : value;
      }
    }
    frames.push(frame);
  }

  return { frames, baseSeries };
}
