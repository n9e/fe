import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface ConcatenateFieldsOptions {
  fieldNames: string[]; // 需要连接的字段列表
  newFieldName: string; // 新字段的名称
  separator?: string; // 连接分隔符（默认为空字符串）
}

export default class ConcatenateFieldsTransformation implements Transformation {
  name = 'ConcatenateFields';

  constructor(private options: ConcatenateFieldsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.concatenateTimeSeriesFields(result);
      } else if (isTableData(result)) {
        return this.concatenateTableDataFields(result);
      }
      return result;
    });
  }

  private concatenateTimeSeriesFields(series: TimeSeries): TimeSeries {
    const { fieldNames, newFieldName, separator = '' } = this.options;

    const newData = series.data.map((dataPoint) => {
      const concatenatedValue = fieldNames.map((field) => dataPoint[field as keyof DataPoint]).join(separator);
      return { ...dataPoint, [newFieldName]: concatenatedValue };
    });

    return {
      ...series,
      data: newData,
    };
  }

  private concatenateTableDataFields(table: TableData): TableData {
    const { fieldNames, newFieldName, separator = '' } = this.options;

    // 找到指定字段的索引
    const fieldIndices = fieldNames.map((fieldName) => table.fields.findIndex((f) => (f.state?.displayName || f.name) === fieldName)).filter((index) => index !== -1);

    if (fieldIndices.length === 0) {
      return table; // 如果没有找到任何字段，返回原表格
    }

    // 创建新字段的值数组
    const newFieldValues: string[] = [];
    const valueCount = table.fields[0]?.values.length || 0;

    for (let i = 0; i < valueCount; i++) {
      const concatenatedValue = fieldIndices
        .map((fieldIndex) => {
          const value = table.fields[fieldIndex].values[i];
          return value !== null && value !== undefined ? String(value) : '';
        })
        .join(separator);
      newFieldValues.push(concatenatedValue);
    }

    // 添加新字段到字段数组
    const newFields = [
      ...table.fields,
      {
        name: newFieldName,
        type: 'string',
        values: newFieldValues,
        state: {},
      },
    ];

    return {
      ...table,
      fields: newFields,
    };
  }
}
