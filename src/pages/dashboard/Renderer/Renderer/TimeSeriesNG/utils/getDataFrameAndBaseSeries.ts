import _ from 'lodash';
import { Series } from 'uplot';
import getSerieName from '../../../utils/getSerieName';

interface ResultItem {
  ref: string;
  data: {
    ref: string;
    refId: string;
    name: string;
    metric: { [key: string]: string };
    values: [Ts: number, Value: number][]; // [unixTimestamp, value]
    target: { legend: string };
    isExp: boolean;
  }[];
}

interface OldSeriesItem {
  id: string;
  refId: string;
  offset: number;
  metric: { [key: string]: string };
  target: { expr: string; legend: string };
  data: [Ts: number, Value: number][]; // [unixTimestamp, value]
  name?: string;
  isExp?: boolean;
}

type DataFrame = [xValues: number[], ...yValues: (number | null | undefined)[][]];

/**
 * Convert the result to a DataFrame
 * @param result ResultItem[]
 * @returns DataFrame
 */
export function getDataFrameAndBaseSeriesByResult(result: ResultItem[]): {
  frames: DataFrame;
  baseSeries: Series[];
} {
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];
  const baseSeries: Series[] = [];

  // Extract all timestamps
  for (const item of result) {
    for (const data of item.data) {
      const label = data.name === undefined ? getSerieName(data.metric, { legend: data.target?.legend, ref: data.isExp ? data.refId : undefined }) : data.name;
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

  // Create frames
  for (const item of result) {
    for (const data of item.data) {
      const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), null);
      for (const [ts, value] of data.values) {
        const index = timestamps.indexOf(ts);

        // Add value to frame
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
    [index: string]: any;
  };
}

/**
 * Convert the series to a DataFrame
 * @param oldSeries OldSeriesItem[]
 * @returns DataFrame
 */
export default function getDataFrameAndBaseSeries(oldSeries: OldSeriesItem[]): {
  frames: DataFrame;
  baseSeries: BaseSeriesItem[];
} {
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];
  const baseSeries: BaseSeriesItem[] = [];

  // Extract all timestamps
  for (const item of oldSeries) {
    // TODO: 如果没有在 datasource 环节里面设置 name，这里根据 metric、target、refId 生成一个 name
    const label = item.name === undefined ? getSerieName(item.metric, { legend: item.target?.legend, ref: item.isExp ? item.refId : undefined }) : item.name;
    baseSeries.push({
      show: true,
      label,
      // n9e 内部使用
      n9e_internal: {
        id: item.id,
        refId: item.refId,
        offset: item.offset,
        metric: item.metric,
      },
    });
    for (const [ts] of item.data) {
      // Add timestamp if not exists
      if (!timestamps.includes(ts)) {
        timestamps.push(ts);
      }
    }
  }

  // Sort timestamps
  timestamps.sort((a, b) => a - b);
  frames[0] = timestamps;

  // Create frames
  for (const item of oldSeries) {
    const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), null);
    for (const [ts, value] of item.data) {
      const index = timestamps.indexOf(ts);

      // Add value to frame
      // 如果是 string 类型的数值，转换为 number 类型，其他类似可能为 number、null 等类型的值不做处理
      frame[index] = _.isString(value) ? _.toNumber(value) : value;
    }
    frames.push(frame);
  }

  return { frames, baseSeries };
}
