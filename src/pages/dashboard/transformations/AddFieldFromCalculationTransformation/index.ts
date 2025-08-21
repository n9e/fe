import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface AddFieldFromCalculationOptions {
  fieldName: string; // 新字段的名称
  expression: (row: Record<string, any>) => any; // 计算表达式（用于 TableData）
  timeSeriesExpression?: (dataPoint: DataPoint) => any; // 计算表达式（用于 TimeSeries）
}

export default class AddFieldFromCalculationTransformation implements Transformation {
  name = 'AddFieldFromCalculation';

  constructor(private options: AddFieldFromCalculationOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.addFieldToTimeSeries(result);
      } else if (isTableData(result)) {
        return this.addFieldToTableData(result);
      }
      return result;
    });
  }

  private addFieldToTimeSeries(series: TimeSeries): TimeSeries {
    const { fieldName, timeSeriesExpression } = this.options;

    if (!timeSeriesExpression) {
      throw new Error('timeSeriesExpression is required for TimeSeries');
    }

    const newData = series.data.map((dataPoint) => {
      const newValue = timeSeriesExpression(dataPoint);
      return { ...dataPoint, [fieldName]: newValue };
    });

    return {
      ...series,
      data: newData,
    };
  }

  private addFieldToTableData(table: TableData): TableData {
    const { fieldName, expression } = this.options;

    // 构建行数据，以便传递给表达式函数
    const valueCount = table.fields[0]?.values.length || 0;
    const newFieldValues: any[] = [];

    for (let i = 0; i < valueCount; i++) {
      // 构建当前行数据对象
      const row: Record<string, any> = {};
      table.fields.forEach((field) => {
        const fieldName = field.state?.displayName || field.name;
        row[fieldName] = field.values[i];
      });

      // 计算新字段的值
      const newValue = expression(row);
      newFieldValues.push(newValue);
    }

    // 添加新字段到字段数组
    const newFields = [
      ...table.fields,
      {
        name: fieldName,
        type: typeof newFieldValues[0] === 'number' ? 'number' : 'string',
        values: newFieldValues,
        state: {},
      },
    ];

    return {
      ...table,
      fields: newFields,
    };
  }
}
