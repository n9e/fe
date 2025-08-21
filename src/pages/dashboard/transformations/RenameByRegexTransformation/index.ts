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

    // 重命名字段名和显示名
    const newFields = table.fields.map((field) => ({
      ...field,
      name: field.name.replace(regex, replacement),
      state: {
        ...field.state,
        displayName: (field.state?.displayName || field.name).replace(regex, replacement),
      },
    }));

    return {
      ...table,
      fields: newFields,
    };
  }
}
