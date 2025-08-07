import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export type FieldType = 'string' | 'number' | 'boolean';

export interface ConvertFieldTypeOptions {
  fieldName: string; // 需要转换的字段名称
  targetType: FieldType; // 目标类型
}

export default class ConvertFieldTypeTransformation implements Transformation {
  name = 'ConvertFieldType';

  constructor(private options: ConvertFieldTypeOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.convertTimeSeriesField(result);
      } else if (isTableData(result)) {
        return this.convertTableDataField(result);
      }
      return result;
    });
  }

  private convertTimeSeriesField(series: TimeSeries): TimeSeries {
    const { fieldName, targetType } = this.options;

    const newData = series.data.map((dataPoint) => {
      const value = dataPoint[fieldName as keyof DataPoint];
      const convertedValue = this.convertValue(value, targetType);
      return { ...dataPoint, [fieldName]: convertedValue };
    });

    return {
      ...series,
      data: newData,
    };
  }

  private convertTableDataField(table: TableData): TableData {
    const { fieldName, targetType } = this.options;

    // 找到指定字段
    const fieldIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === fieldName);
    if (fieldIndex === -1) {
      return table; // 如果字段不存在，返回原表格
    }

    const newFields = table.fields.map((field, index) => {
      if (index === fieldIndex) {
        // 转换字段的类型和值
        const convertedValues = field.values.map((value) => this.convertValue(value, targetType));
        return {
          ...field,
          type: targetType,
          values: convertedValues,
        };
      }
      return field;
    });

    return {
      ...table,
      fields: newFields,
    };
  }

  private convertValue(value: any, targetType: FieldType): any {
    switch (targetType) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }
}
