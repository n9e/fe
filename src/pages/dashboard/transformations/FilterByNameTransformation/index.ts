import { FilterOptions, Transformation, TimeSeries, TableData, QueryResult } from '../types';
import { isTimeSeriesArray } from '../utils';

export default class FilterTransformation implements Transformation {
  name = 'Filter Data by Name';
  constructor(private options: FilterOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    if (isTimeSeriesArray(input)) {
      return this.filterTimeSeries(input as TimeSeries[]);
    } else {
      return this.filterTableData(input as TableData[]);
    }
  }

  // 过滤时间序列数据
  private filterTimeSeries(data: TimeSeries[]): TimeSeries[] {
    const { labelName, pattern, include } = this.options;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    return data.filter((series) => {
      if (labelName) {
        // 过滤标签
        const labelValue = series.labels[labelName];
        const isMatch = labelValue && regex.test(labelValue);
        return include ? isMatch : !isMatch;
      } else {
        // 过滤名称
        const isMatch = regex.test(series.name);
        return include ? isMatch : !isMatch;
      }
    });
  }

  // 过滤表格数据
  private filterTableData(data: TableData[]): TableData[] {
    const { fieldName, pattern, include } = this.options;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    return data.map((table) => {
      const filteredRows = table.rows.filter((row) => {
        if (fieldName && row[fieldName] !== undefined) {
          const isMatch = regex.test(row[fieldName]);
          return include ? isMatch : !isMatch;
        }
        return false; // 如果字段不存在，默认排除
      });

      return { ...table, rows: filteredRows };
    });
  }
}
