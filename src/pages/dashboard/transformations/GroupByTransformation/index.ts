import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface GroupByOptions {
  field: string; // 用于分组的字段
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min'; // 分组后的聚合操作
}

export default class GroupByTransformation implements Transformation {
  name = 'GroupBy';

  constructor(private options: GroupByOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.groupTimeSeries(result);
      } else if (isTableData(result)) {
        return this.groupTableData(result);
      }
      return result;
    });
  }

  private groupTimeSeries(series: TimeSeries): TimeSeries {
    const { field, aggregation } = this.options;

    // 按字段值分组
    const groups = new Map<any, DataPoint[]>();
    series.data.forEach((dataPoint) => {
      const key = dataPoint[field as keyof DataPoint];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(dataPoint);
    });

    // 对分组后的数据进行聚合
    const newData: DataPoint[] = [];
    groups.forEach((groupData, key) => {
      let aggregatedValue: number;
      switch (aggregation) {
        case 'sum':
          aggregatedValue = groupData.reduce((acc, dp) => acc + dp.value, 0);
          break;
        case 'avg':
          aggregatedValue = groupData.reduce((acc, dp) => acc + dp.value, 0) / groupData.length;
          break;
        case 'count':
          aggregatedValue = groupData.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...groupData.map((dp) => dp.value));
          break;
        case 'min':
          aggregatedValue = Math.min(...groupData.map((dp) => dp.value));
          break;
        default:
          aggregatedValue = key; // 如果没有聚合操作，直接使用分组键
      }
      newData.push({ [field]: key, value: aggregatedValue } as DataPoint);
    });

    return {
      ...series,
      data: newData,
    };
  }

  private groupTableData(table: TableData): TableData {
    const { field, aggregation } = this.options;

    // 按字段值分组
    const groups = new Map<any, Record<string, any>[]>();
    table.rows.forEach((row) => {
      const key = row[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // 对分组后的数据进行聚合
    const newRows: Record<string, any>[] = [];
    groups.forEach((groupRows, key) => {
      const aggregatedRow: Record<string, any> = { [field]: key };
      if (aggregation) {
        const values = groupRows.map((row) => row.value); // 假设聚合的字段是 'value'
        switch (aggregation) {
          case 'sum':
            aggregatedRow.value = values.reduce((acc, val) => acc + val, 0);
            break;
          case 'avg':
            aggregatedRow.value = values.reduce((acc, val) => acc + val, 0) / values.length;
            break;
          case 'count':
            aggregatedRow.value = values.length;
            break;
          case 'max':
            aggregatedRow.value = Math.max(...values);
            break;
          case 'min':
            aggregatedRow.value = Math.min(...values);
            break;
        }
      }
      newRows.push(aggregatedRow);
    });

    return {
      ...table,
      columns: [field, ...(aggregation ? ['value'] : [])],
      rows: newRows,
    };
  }
}
