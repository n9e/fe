import { Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export default class ReduceTransformation implements Transformation {
  name = 'Reduce';

  constructor(private options: { operation: 'sum' | 'avg' | 'max' | 'min' }) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.reduceTimeSeries(result);
      } else if (isTableData(result)) {
        return this.reduceTableData(result);
      }
      return result;
    });
  }

  private reduceTimeSeries(series: TimeSeries): TimeSeries {
    let reducedData = series.data[0].value;

    for (let i = 1; i < series.data.length; i++) {
      switch (this.options.operation) {
        case 'sum':
          reducedData += series.data[i].value;
          break;
        case 'avg':
          reducedData += series.data[i].value;
          break;
        case 'max':
          reducedData = Math.max(reducedData, series.data[i].value);
          break;
        case 'min':
          reducedData = Math.min(reducedData, series.data[i].value);
          break;
      }
    }

    const finalValue = this.options.operation === 'avg' ? reducedData / series.data.length : reducedData;

    return {
      ...series,
      data: [{ timestamp: series.data[0].timestamp, value: finalValue }],
    };
  }

  private reduceTableData(table: TableData): TableData {
    // 对数值类型的字段进行聚合操作
    const newFields = table.fields.map((field) => {
      if (field.type === 'number' && field.values.length > 0) {
        const numericValues = field.values.filter((value) => value !== null && value !== undefined && !isNaN(Number(value))).map((value) => Number(value));

        if (numericValues.length === 0) {
          return field;
        }

        let reducedValue: number;
        switch (this.options.operation) {
          case 'sum':
            reducedValue = numericValues.reduce((acc, val) => acc + val, 0);
            break;
          case 'avg':
            reducedValue = numericValues.reduce((acc, val) => acc + val, 0) / numericValues.length;
            break;
          case 'max':
            reducedValue = Math.max(...numericValues);
            break;
          case 'min':
            reducedValue = Math.min(...numericValues);
            break;
          default:
            reducedValue = numericValues[0];
        }

        return {
          ...field,
          values: [reducedValue],
        };
      }

      // 对于非数值字段，只保留第一个值
      return {
        ...field,
        values: field.values.length > 0 ? [field.values[0]] : [],
      };
    });

    return {
      ...table,
      fields: newFields,
    };
  }
}
