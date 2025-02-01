import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface PartitionByValuesOptions {
  field: string; // 用于分区的字段
}

export default class PartitionByValuesTransformation implements Transformation {
  name = 'PartitionByValues';

  constructor(private options: PartitionByValuesOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.flatMap((result) => {
      if (isTimeSeries(result)) {
        return this.partitionTimeSeries(result);
      } else if (isTableData(result)) {
        return this.partitionTableData(result);
      }
      return [result] as QueryResult[];
    });
  }

  private partitionTimeSeries(series: TimeSeries): TimeSeries[] {
    const { field } = this.options;

    // 按字段值分组
    const groups = new Map<any, DataPoint[]>();
    series.data.forEach((dataPoint) => {
      const key = dataPoint[field as keyof DataPoint];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(dataPoint);
    });

    // 为每个分组创建一个新的 TimeSeries
    return Array.from(groups.entries()).map(([key, dataPoints]) => ({
      ...series,
      name: `${series.name}-${key}`, // 可以根据需要调整名称
      data: dataPoints,
    }));
  }

  private partitionTableData(table: TableData): TableData[] {
    const { field } = this.options;

    // 按字段值分组
    const groups = new Map<any, Record<string, any>[]>();
    table.rows.forEach((row) => {
      const key = row[field];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });

    // 为每个分组创建一个新的 TableData
    return Array.from(groups.entries()).map(([key, rows]) => ({
      ...table,
      refId: `${table.refId}-${key}`, // 可以根据需要调整 refId
      rows,
    }));
  }
}
