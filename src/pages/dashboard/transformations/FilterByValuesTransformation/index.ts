import { Transformation, TimeSeries, TableData, QueryResult } from '../types';
import { isTimeSeriesArray } from '../utils';

export interface ValueFilterOptions {
  fieldName?: string; // 字段名称（适用于表格数据）
  labelName?: string; // 标签名称（适用于时间序列数据）
  condition: (value: any) => boolean; // 过滤条件函数
}

export default class FilterByValuesTransformation implements Transformation {
  name = 'Filter Data by Values';
  constructor(private options: ValueFilterOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    if (isTimeSeriesArray(input)) {
      return this.filterTimeSeries(input as TimeSeries[]);
    } else {
      return this.filterTableData(input as TableData[]);
    }
  }

  // 过滤时间序列数据
  private filterTimeSeries(data: TimeSeries[]): TimeSeries[] {
    const { labelName, condition } = this.options;

    return data.filter((series) => {
      if (labelName) {
        // 过滤标签值
        const labelValue = series.labels[labelName];
        return labelValue !== undefined && condition(labelValue);
      } else {
        // 过滤数据点的值
        return series.data.some((point) => condition(point.value));
      }
    });
  }

  // 过滤表格数据
  private filterTableData(data: TableData[]): TableData[] {
    const { fieldName, condition } = this.options;

    return data.map((table) => {
      if (!fieldName) {
        return table; // 如果没有指定字段名，返回原表格
      }

      // 找到指定字段
      const fieldIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === fieldName);
      if (fieldIndex === -1) {
        return table; // 如果字段不存在，返回原表格
      }

      const fieldObj = table.fields[fieldIndex];
      const values = fieldObj.values;

      // 创建过滤后的索引数组
      const filteredIndices: number[] = [];
      values.forEach((value, index) => {
        if (value !== null && value !== undefined && condition(value)) {
          filteredIndices.push(index);
        }
      });

      // 根据过滤后的索引重新构建所有字段的值
      const newFields = table.fields.map((field) => ({
        ...field,
        values: filteredIndices.map((index) => field.values[index]),
      }));

      return {
        ...table,
        fields: newFields,
      };
    });
  }
}
