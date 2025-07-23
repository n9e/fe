import { Transformation, QueryResult, TableData } from '../types';
import { isTableData } from '../utils';

export interface RowsToFieldsOptions {
  fieldName: string; // 用于提取字段的行字段名
  valueField: string; // 用于提取值的行字段名
}

export default class RowsToFieldsTransformation implements Transformation {
  name = 'RowsToFields';

  constructor(private options: RowsToFieldsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTableData(result)) {
        return this.transformTableData(result);
      }
      return result;
    });
  }

  private transformTableData(table: TableData): TableData {
    const { fieldName, valueField } = this.options;

    // 创建一个映射表，用于存储转换后的字段
    const fieldMap = new Map<string, Record<string, any>>();

    table.rows.forEach((row) => {
      const key = row[fieldName];
      const value = row[valueField];

      if (!fieldMap.has(key)) {
        fieldMap.set(key, {});
      }

      // 将行数据中的其他字段合并到映射表中
      Object.entries(row).forEach(([col, val]) => {
        if (col !== fieldName && col !== valueField) {
          fieldMap.get(key)![col] = val;
        }
      });

      // 将值字段添加到映射表中
      fieldMap.get(key)![key] = value;
    });

    // 生成新的列名
    const newColumns = Array.from(fieldMap.keys()).filter((key) => key !== fieldName && key !== valueField);
    newColumns.push(...Array.from(fieldMap.keys()));

    // 生成新的行数据
    const newRows = Array.from(fieldMap.values());

    return {
      ...table,
      columns: newColumns,
      rows: newRows,
    };
  }
}
