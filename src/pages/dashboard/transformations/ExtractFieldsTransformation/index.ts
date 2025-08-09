import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface ExtractFieldsOptions {
  fields: string[]; // 需要提取的字段列表
}

export default class ExtractFieldsTransformation implements Transformation {
  name = 'ExtractFields';

  constructor(private options: ExtractFieldsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.extractTimeSeriesFields(result);
      } else if (isTableData(result)) {
        return this.extractTableDataFields(result);
      }
      return result;
    });
  }

  private extractTimeSeriesFields(series: TimeSeries): TimeSeries {
    const { fields } = this.options;

    const newData = series.data.map((dataPoint) => {
      const extractedDataPoint: Record<string, any> = {};
      fields.forEach((field) => {
        if (dataPoint.hasOwnProperty(field)) {
          extractedDataPoint[field] = dataPoint[field as keyof DataPoint];
        }
      });
      return extractedDataPoint as DataPoint;
    });

    return {
      ...series,
      data: newData,
    };
  }

  private extractTableDataFields(table: TableData): TableData {
    const { fields } = this.options;

    // 找到指定字段
    const extractedFields = table.fields.filter((field) => fields.includes(field.state?.displayName || field.name));

    return {
      ...table,
      fields: extractedFields,
    };
  }
}
