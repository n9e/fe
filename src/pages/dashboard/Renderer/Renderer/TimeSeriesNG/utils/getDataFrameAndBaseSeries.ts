import _ from 'lodash';
import { Series } from 'uplot';
import getSerieName from '../../../utils/getSerieName';

interface ResultItem {
  ref: string;
  data: {
    ref: string;
    metric: { [key: string]: string };
    values: [Ts: number, Value: number][]; // [unixTimestamp, value]
  }[];
}

interface OldSeriesItem {
  id: string;
  refId: string;
  offset: number;
  metric: { [key: string]: string };
  target: { expr: string };
  data: [Ts: number, Value: number][]; // [unixTimestamp, value]
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
      const label = getSerieName(data.metric);
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
    const label = _.isEmpty(item.metric) ? item.target.expr : getSerieName(item.metric);
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
      frame[index] = value;
    }
    frames.push(frame);
  }

  return { frames, baseSeries };
}
