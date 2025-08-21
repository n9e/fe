import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface GroupByOptions {
  field: string; // 用于分组的字段
  aggregation?: 'sum' | 'avg' | 'count' | 'max' | 'min'; // 分组后的聚合操作
}

export default class GroupByTransformation implements Transformation {
  name = 'GroupBy';

  constructor(private options: GroupByOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.groupTimeSeries(result);
      } else if (isTableData(result)) {
        return this.groupTableData(result);
      }
      return result;
    });
  }

  private groupTimeSeries(series: TimeSeries): TimeSeries {
    const { field, aggregation } = this.options;

    // 按字段值分组
    const groups = new Map<any, DataPoint[]>();
    series.data.forEach((dataPoint) => {
      const key = dataPoint[field as keyof DataPoint];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(dataPoint);
    });

    // 对分组后的数据进行聚合
    const newData: DataPoint[] = [];
    groups.forEach((groupData, key) => {
      let aggregatedValue: number;
      switch (aggregation) {
        case 'sum':
          aggregatedValue = groupData.reduce((acc, dp) => acc + dp.value, 0);
          break;
        case 'avg':
          aggregatedValue = groupData.reduce((acc, dp) => acc + dp.value, 0) / groupData.length;
          break;
        case 'count':
          aggregatedValue = groupData.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...groupData.map((dp) => dp.value));
          break;
        case 'min':
          aggregatedValue = Math.min(...groupData.map((dp) => dp.value));
          break;
        default:
          aggregatedValue = key; // 如果没有聚合操作，直接使用分组键
      }
      newData.push({ [field]: key, value: aggregatedValue } as DataPoint);
    });

    return {
      ...series,
      data: newData,
    };
  }

  private groupTableData(table: TableData): TableData {
    const { field, aggregation } = this.options;

    // 找到分组字段
    const fieldIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === field);
    if (fieldIndex === -1) {
      return table; // 如果字段不存在，返回原表格
    }

    const fieldValues = table.fields[fieldIndex].values;

    // 按字段值分组
    const groups = new Map<any, number[]>();
    fieldValues.forEach((value, index) => {
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(index);
    });

    // 创建新的字段数组
    const newFields: Array<{
      name: string;
      type: string;
      values: (string | number | null)[];
      state: any;
    }> = [];

    // 添加分组字段
    const groupKeys = Array.from(groups.keys());
    newFields.push({
      name: field,
      type: table.fields[fieldIndex].type,
      values: groupKeys,
      state: table.fields[fieldIndex].state,
    });

    // 如果有聚合操作，添加聚合字段
    if (aggregation) {
      // 找一个数值字段进行聚合（优先选择名为'value'的字段）
      const valueFieldIndex =
        table.fields.findIndex((f) => f.type === 'number' && ((f.state?.displayName || f.name) === 'value' || (f.state?.displayName || f.name).includes('value'))) ||
        table.fields.findIndex((f) => f.type === 'number');

      if (valueFieldIndex !== -1) {
        const valueField = table.fields[valueFieldIndex];
        const aggregatedValues: (string | number | null)[] = [];

        groupKeys.forEach((key) => {
          const indices = groups.get(key)!;
          const values = indices
            .map((index) => valueField.values[index])
            .filter((value) => value !== null && value !== undefined && !isNaN(Number(value)))
            .map((value) => Number(value));

          if (values.length === 0) {
            aggregatedValues.push(null);
            return;
          }

          let aggregatedValue: number;
          switch (aggregation) {
            case 'sum':
              aggregatedValue = values.reduce((acc, val) => acc + val, 0);
              break;
            case 'avg':
              aggregatedValue = values.reduce((acc, val) => acc + val, 0) / values.length;
              break;
            case 'count':
              aggregatedValue = values.length;
              break;
            case 'max':
              aggregatedValue = Math.max(...values);
              break;
            case 'min':
              aggregatedValue = Math.min(...values);
              break;
            default:
              aggregatedValue = values[0];
          }
          aggregatedValues.push(aggregatedValue);
        });

        newFields.push({
          name: valueField.name,
          type: 'number',
          values: aggregatedValues,
          state: {},
        });
      }
    }

    return {
      ...table,
      fields: newFields,
    };
  }
}
