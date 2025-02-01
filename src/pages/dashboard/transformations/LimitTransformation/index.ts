import { Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface LimitOptions {
  limit: number; // 限制的记录数量
}

export default class LimitTransformation implements Transformation {
  name = 'Limit';

  constructor(private options: LimitOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.limitTimeSeries(result);
      } else if (isTableData(result)) {
        return this.limitTableData(result);
      }
      return result;
    });
  }

  private limitTimeSeries(series: TimeSeries): TimeSeries {
    const { limit } = this.options;
    const newData = series.data.slice(0, limit);

    return {
      ...series,
      data: newData,
    };
  }

  private limitTableData(table: TableData): TableData {
    const { limit } = this.options;
    const newRows = table.rows.slice(0, limit);

    return {
      ...table,
      rows: newRows,
    };
  }
}
