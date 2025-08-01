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
    // 这里可以根据需要对表格数据进行聚合操作
    // 例如，对某一列进行求和、平均值等操作
    // 由于表格数据的结构较为复杂，这里仅返回原始数据
    return table;
  }
}
