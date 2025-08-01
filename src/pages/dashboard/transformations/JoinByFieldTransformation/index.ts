import { DataPoint, Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeriesArray, isTableDataArray } from '../utils';

export interface JoinByFieldOptions {
  byField?: string; // 用于连接的字段（例如时间戳或 ID）
  mode: 'outer' | 'inner'; // 连接类型
}

export default class JoinByFieldTransformation implements Transformation {
  name = 'JoinByField';

  constructor(private options: JoinByFieldOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    if (input.length < 2) {
      return input; // 至少需要两个数据集才能连接
    }

    if (isTimeSeriesArray(input)) {
      return this.joinTimeSeries(input as TimeSeries[]);
    } else if (isTableDataArray(input)) {
      return this.joinTableData(input as TableData[]);
    } else {
      // 如果输入类型不一致，直接返回原始数据
      return input;
    }
  }

  private joinTimeSeries(seriesArray: TimeSeries[]): TimeSeries[] {
    const { byField, mode } = this.options;

    if (byField !== 'timestamp') {
      console.warn('TimeSeries can only be joined by timestamp');
      return seriesArray; // 如果连接字段不是时间戳，返回原始数据
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
      if (mode === 'inner' && Object.keys(values).length !== seriesArray.length) {
        return; // 内连接：只保留所有数据集都有的时间戳
      }

      // 对于 outer 连接，需要确保所有 series 都有值，缺失的用 0 填充
      if (mode === 'outer') {
        for (let i = 0; i < seriesArray.length; i++) {
          if (!values.hasOwnProperty(`value${i}`)) {
            values[`value${i}`] = 0; // 缺失值用 0 填充
          }
        }
      }

      joinedData.push({ timestamp, value: Object.values(values).reduce((acc, val) => acc + val, 0) });
    });

    return [
      {
        refId: 'joined',
        name: 'joined-series',
        labels: {}, // 可以自定义合并后的标签
        data: joinedData.sort((a, b) => a.timestamp - b.timestamp),
      },
    ];
  }

  private joinTableData(tables: TableData[]): TableData[] {
    const { byField, mode } = this.options;

    if (!byField) {
      console.warn('byField must be specified for table data join');
      return tables; // 如果没有指定连接字段，返回第一个表格数据
    }

    // 确保所有表格都包含连接字段
    const isFieldConsistent = tables.every((table) => table.columns.includes(byField));
    if (!isFieldConsistent) {
      console.warn(`Field "${byField}" is missing in one or more tables`);
      return tables; // 如果连接字段不一致，返回第一个表格数据
    }

    // 创建一个映射表，用于存储连接后的行
    const fieldMap = new Map<any, Record<string, any>>();

    // 收集所有非连接字段，检查是否有重名
    const allColumns = tables.flatMap((table) => table.columns.filter((col) => col !== byField));
    const columnCounts = new Map<string, number>();
    allColumns.forEach((col) => {
      columnCounts.set(col, (columnCounts.get(col) || 0) + 1);
    });

    tables.forEach((table, tableIndex) => {
      table.rows.forEach((row) => {
        const key = row[byField];
        if (!fieldMap.has(key)) {
          fieldMap.set(key, {});
        }
        Object.entries(row).forEach(([col, value]) => {
          if (col === byField) {
            // 连接字段只保存一次，不加后缀
            fieldMap.get(key)![col] = value;
          } else {
            // 只有当字段名重复时才加上表索引后缀
            const fieldName = (columnCounts.get(col) || 0) > 1 ? `${col}_${tableIndex}` : col;
            fieldMap.get(key)![fieldName] = value;
          }
        });
      });
    });

    // 根据连接类型过滤数据
    const joinedRows: Record<string, any>[] = [];
    fieldMap.forEach((values, key) => {
      if (mode === 'inner') {
        // 内连接：只保留所有数据集都有的键
        // 计算期望的字段数量：连接字段(1) + 所有非重复的其他列数
        const expectedFieldCount = 1 + allColumns.length;
        if (Object.keys(values).length !== expectedFieldCount) {
          return;
        }
      }

      // 对于 outer 连接，需要确保所有表的所有列都有值，缺失的用 null 填充
      if (mode === 'outer') {
        tables.forEach((table, tableIndex) => {
          table.columns.forEach((col) => {
            if (col !== byField) {
              const fieldName = (columnCounts.get(col) || 0) > 1 ? `${col}_${tableIndex}` : col;
              if (!values.hasOwnProperty(fieldName)) {
                values[fieldName] = null; // 缺失值用 null 填充
              }
            }
          });
        });
      }

      joinedRows.push({ [byField]: key, ...values });
    });

    // 生成合并后的列
    const joinedColumns = [
      byField,
      ...tables.flatMap((table, tableIndex) => table.columns.filter((col) => col !== byField).map((col) => ((columnCounts.get(col) || 0) > 1 ? `${col}_${tableIndex}` : col))),
    ];

    return [
      {
        refId: 'joined',
        columns: joinedColumns,
        rows: joinedRows,
      },
    ];
  }
}
