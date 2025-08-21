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
      return [{ refId: 'merged', fields: [] }];
    }

    // 收集所有表格的字段名，保持顺序
    const allFieldNamesSet = new Set<string>();
    tables.forEach((table) => {
      table.fields.forEach((field) => allFieldNamesSet.add(field.name));
    });
    const allFieldNames = Array.from(allFieldNamesSet);

    // 为每个字段创建合并后的字段定义
    const mergedFields = allFieldNames.map((fieldName) => {
      // 找到第一个包含此字段的表格，用其类型和状态作为基础
      const sourceField = tables.flatMap((table) => table.fields).find((field) => field.name === fieldName);

      // 合并所有表格中此字段的值
      const mergedValues: (string | number | null)[] = [];
      tables.forEach((table) => {
        const field = table.fields.find((f) => f.name === fieldName);
        if (field) {
          mergedValues.push(...field.values);
        } else {
          // 如果某个表格没有此字段，用 null 填充
          const maxLength = Math.max(...table.fields.map((f) => f.values.length));
          for (let i = 0; i < maxLength; i++) {
            mergedValues.push(null);
          }
        }
      });

      return {
        name: fieldName,
        type: sourceField?.type || 'string',
        values: mergedValues,
        state: sourceField?.state || {},
      };
    });

    return [
      {
        refId: 'merged',
        fields: mergedFields,
      },
    ];
  }
}
