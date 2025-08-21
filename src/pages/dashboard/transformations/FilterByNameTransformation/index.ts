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

    return data
      .map((table) => {
        if (fieldName) {
          // 根据字段名过滤字段
          const filteredFields = table.fields.filter((field) => {
            const nameToCheck = field.state?.displayName || field.name;
            const isMatch = regex.test(nameToCheck);
            return include ? isMatch : !isMatch;
          });

          return {
            ...table,
            fields: filteredFields,
          };
        } else {
          // 根据 refId 过滤表格
          const isMatch = regex.test(table.refId);
          return include && isMatch ? table : null;
        }
      })
      .filter((table) => table !== null) as TableData[];
  }
}
