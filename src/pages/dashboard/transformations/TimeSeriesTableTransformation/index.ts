import { Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeries } from '../utils';

export interface TimeSeriesTableOptions {
  functions?: (keyof NonNullable<TableData['fields'][0]['state']['calcs']>)[]; // 使用 calcs 的键作为操作类型
  fieldName?: string; // 要聚合的字段名（用于TableData）或生成的字段名（用于TimeSeries
  outputFieldNames?: Record<string, string>; // 自定义输出字段名映射，key为operation，value为字段名
}

export default class TimeSeriesTableTransformation implements Transformation {
  name = 'TimeSeriesTable';

  constructor(private options: TimeSeriesTableOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    const result: QueryResult[] = [];

    input.forEach((queryResult) => {
      if (isTimeSeries(queryResult)) {
        result.push(queryResult);
      } else {
        // 处理 TableData，对指定字段的值进行聚合计算
        const tableData = this.convertTableDataToAggregatedTable(queryResult);
        result.push(tableData);
      }
    });

    return result;
  }

  private convertTableDataToAggregatedTable(tableData: TableData): TableData {
    const { functions, fieldName, outputFieldNames = {} } = this.options;

    if (!functions || !fieldName) {
      // 如果没有指定函数或字段名，直接返回原数据
      return tableData;
    }

    // 查找要聚合的字段
    const targetField = tableData.fields.find((field) => field.name === fieldName);
    if (!targetField) {
      // 如果找不到指定字段，直接返回原数据
      return tableData;
    }

    // 检查是否存在 calcs 数据
    if (!targetField.state.calcs) {
      // 如果没有 calcs 数据，直接返回原数据
      return tableData;
    }

    const calcs = targetField.state.calcs;

    // 构建聚合后的表格数据
    const fields: TableData['fields'] = [
      {
        name: 'name',
        type: 'string',
        values: [targetField.name],
        state: {},
      },
    ];

    // 为每个操作添加对应的字段
    functions.forEach((operation) => {
      const outputFieldName = outputFieldNames[operation] || `${fieldName}_${operation}`;
      const calculatedValue = calcs[operation];

      fields.push({
        name: outputFieldName,
        type: 'number',
        values: [calculatedValue],
        state: {
          calcs: {
            min: calculatedValue,
            max: calculatedValue,
            avg: calculatedValue,
            sum: calculatedValue,
            last: calculatedValue,
            variance: calculatedValue,
            stdDev: calculatedValue,
            count: 1,
          },
        },
      });
    });

    return {
      refId: tableData.refId,
      fields,
    };
  }
}
