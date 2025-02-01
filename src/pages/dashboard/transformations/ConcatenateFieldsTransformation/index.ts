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

    const newRows = table.rows.map((row) => {
      const concatenatedValue = fieldNames.map((field) => row[field]).join(separator);
      return { ...row, [newFieldName]: concatenatedValue };
    });

    return {
      ...table,
      columns: [...table.columns, newFieldName],
      rows: newRows,
    };
  }
}
