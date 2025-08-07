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
      return tables; // 如果没有指定连接字段，返回原始数据
    }

    // 确保所有表格都包含连接字段
    const isFieldConsistent = tables.every((table) => table.fields.some((field) => field.name === byField));
    if (!isFieldConsistent) {
      console.warn(`Field "${byField}" is missing in one or more tables`);
      return tables; // 如果连接字段不一致，返回原始数据
    }

    // 创建连接键到行索引的映射
    const keyToRowIndexMaps = tables.map((table) => {
      const joinField = table.fields.find((field) => field.name === byField)!;
      const keyToRowIndex = new Map<any, number[]>();

      joinField.values.forEach((value, index) => {
        if (!keyToRowIndex.has(value)) {
          keyToRowIndex.set(value, []);
        }
        keyToRowIndex.get(value)!.push(index);
      });

      return keyToRowIndex;
    });

    // 获取所有可能的连接键
    const allKeys = new Set<any>();
    keyToRowIndexMaps.forEach((keyMap) => {
      Array.from(keyMap.keys()).forEach((key) => allKeys.add(key));
    });

    // 收集所有非连接字段名，检查是否有重名
    const allFieldNames = tables.flatMap((table) => table.fields.filter((field) => field.name !== byField).map((field) => field.name));
    const fieldCounts = new Map<string, number>();
    allFieldNames.forEach((fieldName) => {
      fieldCounts.set(fieldName, (fieldCounts.get(fieldName) || 0) + 1);
    });

    // 构建结果字段
    const resultFields: Array<{
      name: string;
      type: string;
      values: (string | number | null)[];
      state: any;
    }> = [];

    // 添加连接字段
    const joinFieldFromFirstTable = tables[0].fields.find((field) => field.name === byField)!;
    resultFields.push({
      name: byField,
      type: joinFieldFromFirstTable.type,
      values: [],
      state: joinFieldFromFirstTable.state,
    });

    // 添加其他字段
    tables.forEach((table, tableIndex) => {
      table.fields.forEach((field) => {
        if (field.name !== byField) {
          const fieldName = (fieldCounts.get(field.name) || 0) > 1 ? `${field.name}_${tableIndex}` : field.name;

          resultFields.push({
            name: fieldName,
            type: field.type,
            values: [],
            state: field.state,
          });
        }
      });
    });

    // 处理每个连接键
    allKeys.forEach((key) => {
      // 检查这个键在所有表中是否存在
      const existsInAllTables = keyToRowIndexMaps.every((keyMap) => keyMap.has(key));

      if (mode === 'inner' && !existsInAllTables) {
        return; // 内连接：跳过不在所有表中的键
      }

      // 获取每个表中对应的行索引
      const rowIndices = keyToRowIndexMaps.map((keyMap) => keyMap.get(key) || []);

      // 计算笛卡尔积的组合数
      const combinations = rowIndices.reduce((acc, indices) => (indices.length === 0 ? acc : acc * indices.length), 1);

      if (combinations === 0 && mode === 'outer') {
        // 对于外连接，如果某个表没有这个键，创建一行 null 值
        resultFields[0].values.push(key); // 连接字段值

        let fieldIndex = 1;
        tables.forEach((table, tableIndex) => {
          table.fields.forEach((field) => {
            if (field.name !== byField) {
              resultFields[fieldIndex].values.push(null);
              fieldIndex++;
            }
          });
        });
      } else {
        // 生成所有可能的组合
        const maxCombinations = Math.max(1, ...rowIndices.map((indices) => indices.length));

        for (let combIndex = 0; combIndex < maxCombinations; combIndex++) {
          resultFields[0].values.push(key); // 连接字段值

          let fieldIndex = 1;
          tables.forEach((table, tableIndex) => {
            const tableRowIndices = rowIndices[tableIndex];
            const rowIndex = tableRowIndices.length > 0 ? tableRowIndices[combIndex % tableRowIndices.length] : -1;

            table.fields.forEach((field) => {
              if (field.name !== byField) {
                const value = rowIndex >= 0 ? field.values[rowIndex] : null;
                resultFields[fieldIndex].values.push(value);
                fieldIndex++;
              }
            });
          });
        }
      }
    });

    return [
      {
        refId: 'joined',
        fields: resultFields,
      },
    ];
  }
}
