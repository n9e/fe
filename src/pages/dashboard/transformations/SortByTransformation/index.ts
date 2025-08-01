import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface SortByOptions {
  field: string; // 用于排序的字段
  order: 'asc' | 'desc'; // 排序顺序（升序或降序）
}

export default class SortByTransformation implements Transformation {
  name = 'SortBy';

  constructor(private options: SortByOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.sortTimeSeries(result);
      } else if (isTableData(result)) {
        return this.sortTableData(result);
      }
      return result;
    });
  }

  private sortTimeSeries(series: TimeSeries): TimeSeries {
    const { field, order } = this.options;

    const sortedData = series.data.slice().sort((a, b) => {
      const aValue = a[field as keyof DataPoint] ?? 0;
      const bValue = b[field as keyof DataPoint] ?? 0;

      // if (aValue === undefined || bValue === undefined) {
      //   return 0; // 如果字段不存在，不改变顺序
      // }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return {
      ...series,
      data: sortedData,
    };
  }

  private sortTableData(table: TableData): TableData {
    const { field, order } = this.options;

    const sortedRows = table.rows.slice().sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue === undefined || bValue === undefined) {
        return 0; // 如果字段不存在，不改变顺序
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return {
      ...table,
      rows: sortedRows,
    };
  }
}
