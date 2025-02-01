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

    const newRows = table.rows.map((row) => {
      const newValue = expression(row);
      return { ...row, [fieldName]: newValue };
    });

    return {
      ...table,
      columns: [...table.columns, fieldName],
      rows: newRows,
    };
  }
}
