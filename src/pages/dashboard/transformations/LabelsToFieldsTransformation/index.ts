import { Transformation, QueryResult, TimeSeries, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export default class LabelsToFieldsTransformation implements Transformation {
  name = 'LabelsToFields';

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.transformTimeSeries(result);
      }
      return result;
    });
  }

  private transformTimeSeries(series: TimeSeries): TimeSeries {
    const { labels } = series;

    if (!labels || Object.keys(labels).length === 0) {
      return series; // 如果没有标签，直接返回原始数据
    }

    // 将标签添加到每个数据点中
    const newData = series.data.map((dataPoint) => {
      return { ...dataPoint, ...labels };
    });

    return {
      ...series,
      data: newData,
    };
  }
}
