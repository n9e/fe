import { Transformation, QueryResult, TimeSeries, TableData } from '../types';
import { isTimeSeries, isTableData, calculateVariance, calculateStdDev } from '../utils';

type TableValue = TableData['fields'][number]['values'][number];
type TableRow = Record<string, TableValue>;

export interface GroupedAggregateTableOptions {
  fields: {
    [fieldName: string]: {
      aggregations: (keyof NonNullable<TableData['fields'][0]['state']['calcs']>)[]; // 聚合函数列表
      operation: 'aggregate' | 'groupby';
    };
  };
}

export default class GroupedAggregateTableTransformation implements Transformation {
  name = 'GroupedAggregateTable';

  constructor(private options: GroupedAggregateTableOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTableData(result)) {
        return this.groupTableData(result);
      }

      return result;
    });
  }

  private groupByFields(rows: TableRow[], groupFieldNames: string[]): Record<string, TableRow[]> {
    const grouped: Record<string, TableRow[]> = {};

    rows.forEach((row) => {
      const key = groupFieldNames.map((fieldName) => row[fieldName]).join('|');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key]?.push(row);
    });

    return grouped;
  }

  private sum(values: number[]): number {
    return values.reduce((acc, val) => acc + val, 0);
  }

  private mean(values: number[]): number {
    return values.length > 0 ? this.sum(values) / values.length : 0;
  }

  private max(values: number[]): number {
    return Math.max(...values);
  }

  private min(values: number[]): number {
    return Math.min(...values);
  }

  private groupTableData(table: TableData): TableData {
    const { fields: fieldConfigs } = this.options;

    if (!fieldConfigs || Object.keys(fieldConfigs).length === 0) {
      return table; // 没有指定字段配置，返回原始数据
    }

    // 分离分组字段和聚合字段
    const groupFieldNames = Object.keys(fieldConfigs).filter((fieldName) => {
      return fieldConfigs[fieldName]?.operation === 'groupby';
    });

    const aggregateFieldNames = Object.keys(fieldConfigs).filter((fieldName) => {
      return fieldConfigs[fieldName]?.operation === 'aggregate';
    });

    if (groupFieldNames.length === 0) {
      return table; // 没有分组字段，返回原始数据
    }

    // 找到分组字段对象
    const groupFieldObjects = groupFieldNames
      .map((fieldName) => table.fields.find((field) => field.name === fieldName))
      .filter((field): field is NonNullable<typeof field> => field != null);

    if (groupFieldObjects.length === 0) {
      return table; // 没有找到有效的分组字段
    }

    // 构建行数据
    const rowCount = table.fields[0]?.values.length || 0;
    const rows: TableRow[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: TableRow = {};
      table.fields.forEach((field) => {
        row[field.name] = field.values[i] ?? null;
      });
      rows.push(row);
    }

    // 按分组字段分组
    const grouped = this.groupByFields(rows, groupFieldNames);
    const groupValues = Object.values(grouped);

    // 生成新的字段数组，重新创建分组字段
    const newFields: typeof table.fields = [];

    // 先创建分组字段
    groupFieldObjects.forEach((originalField, index) => {
      const newField = {
        name: originalField.name,
        type: originalField.type,
        values: [] as TableValue[],
        state: { ...originalField.state },
      };

      groupValues.forEach((groupRows) => {
        const firstRow = groupRows[0];
        const groupFieldName = groupFieldNames[index];
        if (firstRow && groupFieldName) {
          newField.values.push(firstRow[groupFieldName] ?? null);
        }
      });

      newFields.push(newField);
    });

    // 为每个聚合字段添加计算结果
    aggregateFieldNames.forEach((fieldName) => {
      const config = fieldConfigs[fieldName];
      const field = table.fields.find((f) => f.name === fieldName);

      if (!field || !config) return;

      // 为每个聚合函数创建一个新字段
      config.aggregations.forEach((aggregation) => {
        const newField = {
          name: `${field.name} (${aggregation})`,
          type: field.type,
          values: [] as TableValue[],
          state: {
            ...field.state,
            displayName: `${field.state.displayName || field.name} (${aggregation})`,
          },
        };

        // 计算每个分组的结果
        groupValues.forEach((groupRows) => {
          const fieldValues = groupRows.map((row) => row[fieldName]).filter((val): val is number => typeof val === 'number');

          let calculatedValue: TableValue = null;

          if (fieldValues.length > 0) {
            switch (aggregation) {
              case 'sum':
                calculatedValue = this.sum(fieldValues);
                break;
              case 'avg':
                calculatedValue = this.mean(fieldValues);
                break;
              case 'count':
                calculatedValue = fieldValues.length;
                break;
              case 'max':
                calculatedValue = this.max(fieldValues);
                break;
              case 'min':
                calculatedValue = this.min(fieldValues);
                break;
              case 'last':
                calculatedValue = fieldValues[fieldValues.length - 1] ?? null;
                break;
              case 'variance':
                // 计算方差
                const variance = calculateVariance(fieldValues);
                calculatedValue = variance;
                break;
              case 'stdDev':
                const stdDev = calculateStdDev(fieldValues);
                calculatedValue = stdDev;
                break;
              default:
                calculatedValue = fieldValues[fieldValues.length - 1] ?? null;
                break;
            }
          }

          newField.values.push(calculatedValue);
        });

        newFields.push(newField);
      });
    });

    // 填充分组字段的值 - 已在上面处理

    return {
      refId: table.refId,
      fields: newFields,
    };
  }
}
