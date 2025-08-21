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

    // 找到字段名和值字段的索引
    const fieldNameIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === fieldName);
    const valueFieldIndex = table.fields.findIndex((f) => (f.state?.displayName || f.name) === valueField);

    if (fieldNameIndex === -1 || valueFieldIndex === -1) {
      return table; // 如果找不到指定字段，返回原表格
    }

    const fieldNameValues = table.fields[fieldNameIndex].values;
    const valueFieldValues = table.fields[valueFieldIndex].values;

    // 获取唯一的字段名
    const uniqueFieldNames = Array.from(new Set(fieldNameValues.filter((name) => name !== null && name !== undefined)));

    // 创建新的字段数组
    const newFields: Array<{
      name: string;
      type: string;
      values: (string | number | null)[];
      state: any;
    }> = [];

    // 添加保留的字段（除了fieldName和valueField之外的字段）
    table.fields.forEach((field, index) => {
      if (index !== fieldNameIndex && index !== valueFieldIndex) {
        newFields.push({
          ...field,
        });
      }
    });

    // 为每个唯一字段名创建一个新字段
    uniqueFieldNames.forEach((name) => {
      const values: (string | number | null)[] = [];

      // 为每行数据生成对应的值
      for (let i = 0; i < fieldNameValues.length; i++) {
        if (fieldNameValues[i] === name) {
          values.push(valueFieldValues[i]);
        } else {
          values.push(null);
        }
      }

      newFields.push({
        name: String(name),
        type: table.fields[valueFieldIndex].type,
        values,
        state: {},
      });
    });

    return {
      ...table,
      fields: newFields,
    };
  }
}
