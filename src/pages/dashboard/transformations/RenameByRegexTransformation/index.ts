import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface RenameByRegexOptions {
  pattern: string | RegExp; // 正则表达式模式
  replacement: string; // 替换字符串
}

export default class RenameByRegexTransformation implements Transformation {
  name = 'RenameByRegex';

  constructor(private options: RenameByRegexOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.renameTimeSeriesFields(result);
      } else if (isTableData(result)) {
        return this.renameTableColumns(result);
      }
      return result;
    });
  }

  private renameTimeSeriesFields(series: TimeSeries): TimeSeries {
    const { pattern, replacement } = this.options;
    const regex = new RegExp(pattern);

    // 重命名数据点中的字段
    const newData = series.data.map((dataPoint) => {
      const newDataPoint: Record<string, any> = {};
      Object.entries(dataPoint).forEach(([key, value]) => {
        const newKey = key.replace(regex, replacement);
        newDataPoint[newKey] = value;
      });
      return newDataPoint as DataPoint;
    });

    return {
      ...series,
      data: newData,
    };
  }

  private renameTableColumns(table: TableData): TableData {
    const { pattern, replacement } = this.options;
    const regex = new RegExp(pattern);

    // 重命名列名
    const newColumns = table.columns.map((column) => column.replace(regex, replacement));

    // 重命名行中的字段
    const newRows = table.rows.map((row) => {
      const newRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, value]) => {
        const newKey = key.replace(regex, replacement);
        newRow[newKey] = value;
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
