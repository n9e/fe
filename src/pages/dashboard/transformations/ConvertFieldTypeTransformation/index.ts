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

    const newRows = table.rows.map((row) => {
      const value = row[fieldName];
      const convertedValue = this.convertValue(value, targetType);
      return { ...row, [fieldName]: convertedValue };
    });

    return {
      ...table,
      rows: newRows,
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
