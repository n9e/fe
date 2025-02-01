import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface OrganizeFieldsOptions {
  fields: string[]; // 需要保留的字段列表
  renameMap?: Record<string, string>; // 字段重命名映射
}

export default class OrganizeFieldsTransformation implements Transformation {
  name = 'OrganizeFields';

  constructor(private options: OrganizeFieldsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.organizeTimeSeriesFields(result);
      } else if (isTableData(result)) {
        return this.organizeTableDataFields(result);
      }
      return result;
    });
  }

  private organizeTimeSeriesFields(series: TimeSeries): TimeSeries {
    const { fields, renameMap } = this.options;

    const newData = series.data.map((dataPoint) => {
      const newDataPoint: Record<string, any> = {};
      fields.forEach((field) => {
        if (dataPoint.hasOwnProperty(field)) {
          const newFieldName = renameMap?.[field] || field;
          newDataPoint[newFieldName] = dataPoint[field as keyof DataPoint];
        }
      });
      return newDataPoint as DataPoint;
    });

    return {
      ...series,
      data: newData,
    };
  }

  private organizeTableDataFields(table: TableData): TableData {
    const { fields, renameMap } = this.options;

    // 过滤并重命名字段
    const newColumns = fields.map((field) => renameMap?.[field] || field);

    const newRows = table.rows.map((row) => {
      const newRow: Record<string, any> = {};
      fields.forEach((field) => {
        if (row.hasOwnProperty(field)) {
          const newFieldName = renameMap?.[field] || field;
          newRow[newFieldName] = row[field];
        }
      });
      return newRow;
    });

    return {
      ...table,
      columns: newColumns,
      rows: newRows,
    };
  }
}
