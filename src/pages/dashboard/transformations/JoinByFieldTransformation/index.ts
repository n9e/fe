import { DataPoint, Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeriesArray, isTableDataArray } from '../utils';

export interface JoinByFieldOptions {
  field: string; // 用于连接的字段（例如时间戳或 ID）
  type: 'inner' | 'left' | 'right'; // 连接类型
}

export default class JoinByFieldTransformation implements Transformation {
  name = 'JoinByField';

  constructor(private options: JoinByFieldOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    if (input.length < 2) {
      return input; // 至少需要两个数据集才能连接
    }

    if (isTimeSeriesArray(input)) {
      return [this.joinTimeSeries(input as TimeSeries[])];
    } else if (isTableDataArray(input)) {
      return [this.joinTableData(input as TableData[])];
    } else {
      // 如果输入类型不一致，直接返回原始数据
      return input;
    }
  }

  private joinTimeSeries(seriesArray: TimeSeries[]): TimeSeries {
    const { field, type } = this.options;

    if (field !== 'timestamp') {
      throw new Error('TimeSeries can only be joined by timestamp');
    }

    // 将所有时间序列的数据点按时间戳合并
    const timestampMap = new Map<number, Record<string, number>>();

    seriesArray.forEach((series, index) => {
      series.data.forEach((dataPoint) => {
        const timestamp = dataPoint.timestamp;
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, {});
        }
        timestampMap.get(timestamp)![`value${index}`] = dataPoint.value;
      });
    });

    // 根据连接类型过滤数据
    const joinedData: DataPoint[] = [];
    timestampMap.forEach((values, timestamp) => {
      if (type === 'inner' && Object.keys(values).length !== seriesArray.length) {
        return; // 内连接：只保留所有数据集都有的时间戳
      }
      joinedData.push({ timestamp, value: Object.values(values).reduce((acc, val) => acc + val, 0) });
    });

    return {
      refId: 'joined',
      name: 'joined-series',
      labels: {}, // 可以自定义合并后的标签
      data: joinedData.sort((a, b) => a.timestamp - b.timestamp),
    };
  }

  private joinTableData(tables: TableData[]): TableData {
    const { field, type } = this.options;

    // 确保所有表格都包含连接字段
    const isFieldConsistent = tables.every((table) => table.columns.includes(field));
    if (!isFieldConsistent) {
      throw new Error(`Field "${field}" is missing in one or more tables`);
    }

    // 创建一个映射表，用于存储连接后的行
    const fieldMap = new Map<any, Record<string, any>>();

    tables.forEach((table, tableIndex) => {
      table.rows.forEach((row) => {
        const key = row[field];
        if (!fieldMap.has(key)) {
          fieldMap.set(key, {});
        }
        Object.entries(row).forEach(([col, value]) => {
          fieldMap.get(key)![`${col}_${tableIndex}`] = value;
        });
      });
    });

    // 根据连接类型过滤数据
    const joinedRows: Record<string, any>[] = [];
    fieldMap.forEach((values, key) => {
      if (type === 'inner' && Object.keys(values).length !== tables.length * 2) {
        return; // 内连接：只保留所有数据集都有的键
      }
      joinedRows.push({ [field]: key, ...values });
    });

    // 生成合并后的列
    const joinedColumns = [field, ...tables.flatMap((table, tableIndex) => table.columns.filter((col) => col !== field).map((col) => `${col}_${tableIndex}`))];

    return {
      refId: 'joined',
      columns: joinedColumns,
      rows: joinedRows,
    };
  }
}
