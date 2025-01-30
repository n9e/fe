import { DataPoint, Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeriesArray, isTableDataArray } from '../utils';

export default class MergeTransformation implements Transformation {
  name = 'Merge';

  apply(input: QueryResult[]): QueryResult[] {
    if (input.length === 0) {
      return [];
    }

    if (isTimeSeriesArray(input)) {
      return [this.mergeTimeSeries(input as TimeSeries[])];
    } else if (isTableDataArray(input)) {
      return [this.mergeTableData(input as TableData[])];
    } else {
      // 如果输入类型不一致，直接返回原始数据
      return input;
    }
  }

  private mergeTimeSeries(seriesArray: TimeSeries[]): TimeSeries {
    const mergedData: DataPoint[] = [];

    // 将所有时间序列的数据点合并到一个数组中
    seriesArray.forEach((series) => {
      mergedData.push(...series.data);
    });

    // 按时间戳排序
    mergedData.sort((a, b) => a.timestamp - b.timestamp);

    return {
      refId: 'merged',
      name: 'merged-series',
      labels: {}, // 可以自定义合并后的标签
      data: mergedData,
    };
  }

  private mergeTableData(tables: TableData[]): TableData {
    if (tables.length === 0) {
      return { refId: 'merged', columns: [], rows: [] };
    }

    // 确保所有表格的列一致
    const columns = tables[0].columns;
    const isColumnsConsistent = tables.every((table) => table.columns.every((col, index) => col === columns[index]));

    if (!isColumnsConsistent) {
      throw new Error('Cannot merge tables with different columns');
    }

    // 合并所有行
    const mergedRows = tables.flatMap((table) => table.rows);

    return {
      refId: 'merged',
      columns,
      rows: mergedRows,
    };
  }
}
