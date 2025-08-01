import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export default class SeriesToRowsTransformation implements Transformation {
  name = 'SeriesToRows';

  apply(input: QueryResult[]): QueryResult[] {
    // 过滤出所有的 TimeSeries
    const timeSeriesList = input.filter((result) => isTimeSeries(result)) as TimeSeries[];

    if (timeSeriesList.length === 0) {
      return input; // 如果没有 TimeSeries，直接返回原始数据
    }

    // 将 TimeSeries 转换为 TableData
    const tableData = this.convertSeriesToRows(timeSeriesList);

    // 返回转换后的 TableData
    return [tableData];
  }

  private convertSeriesToRows(seriesList: TimeSeries[]): TableData {
    const columns = ['timestamp', 'value', 'name', ...this.getLabelKeys(seriesList)];
    const rows: Record<string, any>[] = [];

    seriesList.forEach((series) => {
      series.data.forEach((dataPoint) => {
        const row: Record<string, any> = {
          timestamp: dataPoint.timestamp,
          value: dataPoint.value,
          name: series.name,
          ...series.labels, // 将标签作为字段添加到行中
        };
        rows.push(row);
      });
    });

    return {
      refId: 'transformed',
      columns,
      rows,
    };
  }

  private getLabelKeys(seriesList: TimeSeries[]): string[] {
    const labelKeys = new Set<string>();
    seriesList.forEach((series) => {
      Object.keys(series.labels || {}).forEach((key) => labelKeys.add(key));
    });
    return Array.from(labelKeys);
  }
}
