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

type DataFrame = [xValues: number[], ...yValues: (number | null | undefined)[][]];

/**
 * Convert the result to a DataFrame
 * @param result ResultItem[]
 * @returns DataFrame
 */
export default function getDataFrameAndBaseSeries(result: ResultItem[]): {
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
