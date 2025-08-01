import { DataPoint, Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeriesArray, isTableDataArray } from '../utils';

export default class MergeTransformation implements Transformation {
  name = 'Merge';

  apply(input: QueryResult[]): QueryResult[] {
    if (input.length === 0) {
      return [];
    }

    if (isTimeSeriesArray(input)) {
      return this.mergeTimeSeries(input);
    } else if (isTableDataArray(input)) {
      return this.mergeTableData(input);
    } else {
      // 如果输入类型不一致，直接返回原始数据
      return input;
    }
  }

  private mergeTimeSeries(seriesArray: TimeSeries[]): TimeSeries[] {
    const mergedData: DataPoint[] = [];

    // 将所有时间序列的数据点合并到一个数组中
    seriesArray.forEach((series) => {
      mergedData.push(...series.data);
    });

    // 按时间戳排序
    mergedData.sort((a, b) => a.timestamp - b.timestamp);

    return [
      {
        refId: 'merged',
        name: 'merged-series',
        labels: {}, // 可以自定义合并后的标签
        data: mergedData,
      },
    ];
  }

  private mergeTableData(tables: TableData[]): TableData[] {
    if (tables.length === 0) {
      return [{ refId: 'merged', columns: [], rows: [] }];
    }

    // 收集所有表格的所有列，保持顺序
    const allColumnsSet = new Set<string>();
    tables.forEach((table) => {
      table.columns.forEach((col) => allColumnsSet.add(col));
    });
    const allColumns = Array.from(allColumnsSet);

    // 合并所有行
    let mergedRows: any[] = [];

    tables.forEach((table) => {
      mergedRows = mergedRows.concat(table.rows);
    });

    return [
      {
        refId: 'merged',
        columns: allColumns,
        rows: mergedRows,
      },
    ];
  }
}
