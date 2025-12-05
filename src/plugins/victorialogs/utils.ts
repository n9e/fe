import _ from 'lodash';
import moment from 'moment';

import { DataFrame, BaseSeriesItem } from '@/pages/dashboard/Renderer/Renderer/TimeSeriesNG/utils/getDataFrameAndBaseSeries';

import { HitResult } from './services';

export const getSerieName = (metric: Object, ref?: string) => {
  let name = metric['__name__'] || '';
  _.forEach(_.omit(metric, '__name__'), (value, key) => {
    name += ` ${key}: ${value}`;
  });
  name = _.trim(name);
  if (ref) {
    name = `${ref} ${name}`;
  }
  return name;
};

export const getStepByRange = (start: moment.Moment, end: moment.Moment) => {
  const startTime = moment(start).unix();
  const endTime = moment(end).unix();
  const step = (endTime - startTime) * 10;
  return `${step}ms`;
};

export const getDataFrameAndBaseSeries = (hits: HitResult[]) => {
  const timestamps: number[] = [];
  const frames: DataFrame = [[]];
  const baseSeries: BaseSeriesItem[] = [];
  let total = 0;

  for (const item of hits) {
    baseSeries.push({
      show: true,
      label: item.fields?._stream,
      n9e_internal: {},
    });
    total += item.total;
    for (const date of item.timestamps) {
      const ts = moment(date).unix();
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
  for (const item of hits) {
    const frame: (number | null | undefined)[] = _.fill(Array(timestamps.length), null);
    for (let i = 0; i < item.values.length; i++) {
      const value = item.values[i];
      const ts = moment(item.timestamps[i]).unix();
      const index = timestamps.indexOf(ts);
      frame[index] = _.isString(value) ? _.toNumber(value) : value;
    }
    frames.push(frame);
  }

  return { frames, baseSeries, total };
};

export const jsonLinesToJson = (jsonLines: string) => {
  const lines = jsonLines.split('\n');
  const jsonArray = lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch (e) {
      return null;
    }
  });
  return jsonArray.filter((item) => item !== null);
};

export const streamValueFormat = (streamValue: string) => {
  if (streamValue.startsWith('{') && streamValue.endsWith('}')) {
    // 去掉首尾的大括号
    streamValue = streamValue.slice(1, -1);
    return streamValue;
  }
  return streamValue;
};

export const dateValueFormat = (dateValue: string, format: string) => {
  const date = moment(dateValue);
  if (date.isValid()) {
    return date.format(format);
  }
  return dateValue;
};

export const getFiledsByLogs = (logs: { [index: string]: string }[]) => {
  const fields = new Set<string>();
  logs.forEach((log) => {
    Object.keys(log).forEach((key) => {
      fields.add(key);
    });
  });
  return Array.from(fields);
};

export function toString(val: any) {
  if (typeof val === 'string') {
    return val;
  }
  try {
    return JSON.stringify(val);
  } catch (e) {
    return 'unknow';
  }
}
