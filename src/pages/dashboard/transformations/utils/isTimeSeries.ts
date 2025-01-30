import { QueryResult, TimeSeries } from '../types';

export function isTimeSeries(result: QueryResult): result is TimeSeries {
  return (result as TimeSeries).data !== undefined;
}

export function isTimeSeriesArray(data: QueryResult[]): data is TimeSeries[] {
  return data.every((series) => 'name' in series && 'data' in series);
}
