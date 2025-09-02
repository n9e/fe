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

    // 收集所有表格的字段名
    const allFieldNamesSet = new Set<string>();
    tables.forEach((table) => {
      table.fields.forEach((field) => allFieldNamesSet.add(field.name));
    });
    const allFieldNames = Array.from(allFieldNamesSet);

    // 找出所有表都存在的共同字段（用于合并条件）
    const commonFields = allFieldNames.filter((fieldName) => tables.every((table) => table.fields.some((field) => field.name === fieldName)));

    // 创建行数据映射
    const allRows: Array<{ tableIndex: number; rowIndex: number; data: Record<string, any> }> = [];

    tables.forEach((table, tableIndex) => {
      const maxRowCount = Math.max(...table.fields.map((f) => f.values.length));

      for (let rowIndex = 0; rowIndex < maxRowCount; rowIndex++) {
        const rowData: Record<string, any> = {};
        table.fields.forEach((field) => {
          rowData[field.name] = field.values[rowIndex] ?? null;
        });

        allRows.push({ tableIndex, rowIndex, data: rowData });
      }
    });

    // 按共同字段分组合并
    const mergedRowsMap = new Map<string, Record<string, any>>();

    allRows.forEach((row) => {
      // 创建共同字段的键
      const commonKey = commonFields.map((fieldName) => `${fieldName}:${row.data[fieldName]}`).join('|');

      if (mergedRowsMap.has(commonKey)) {
        // 如果已存在相同的共同字段组合，合并其他字段的数据
        const existingRow = mergedRowsMap.get(commonKey)!;
        allFieldNames.forEach((fieldName) => {
          if (!commonFields.includes(fieldName) && row.data[fieldName] !== null && row.data[fieldName] !== undefined) {
            existingRow[fieldName] = row.data[fieldName];
          }
        });
      } else {
        // 创建新行，复制所有字段
        const newRow: Record<string, any> = {};
        allFieldNames.forEach((fieldName) => {
          newRow[fieldName] = row.data[fieldName];
        });
        mergedRowsMap.set(commonKey, newRow);
      }
    });

    const mergedRows = Array.from(mergedRowsMap.values());

    // 转换回字段格式
    const mergedFields = allFieldNames.map((fieldName) => {
      const sourceField = tables.flatMap((table) => table.fields).find((field) => field.name === fieldName);
      const values = mergedRows.map((row) => row[fieldName] ?? null);

      return {
        name: fieldName,
        type: sourceField?.type || 'string',
        values,
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
