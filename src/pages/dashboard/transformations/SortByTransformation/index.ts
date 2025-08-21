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

    // 找到指定字段
    const fieldIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === field);
    if (fieldIndex === -1) {
      return table; // 如果字段不存在，返回原表格
    }

    const fieldObj = table.fields[fieldIndex];
    const values = fieldObj.values;

    // 创建索引数组用于排序
    const indices = values.map((_, index) => index);

    // 根据字段值排序索引
    indices.sort((a, b) => {
      const aValue = values[a];
      const bValue = values[b];

      if (aValue === null || aValue === undefined) {
        if (bValue === null || bValue === undefined) return 0;
        return order === 'asc' ? 1 : -1;
      }
      if (bValue === null || bValue === undefined) {
        return order === 'asc' ? -1 : 1;
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // 根据排序后的索引重新排列所有字段的值
    const newFields = table.fields.map((field) => ({
      ...field,
      values: indices.map((index) => field.values[index]),
    }));

    return {
      ...table,
      fields: newFields,
    };
  }
}
