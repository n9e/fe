import _ from 'lodash';

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
export default function convertToDataFrame(result: ResultItem[]): DataFrame {
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];

  // Extract all timestamps
  for (const item of result) {
    for (const data of item.data) {
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
    const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), null);

    for (const data of item.data) {
      for (const [ts, value] of data.values) {
        const index = timestamps.indexOf(ts);

        // Add value to frame
        frame[index] = value;
      }
    }

    frames.push(frame);
  }

  return frames;
}
