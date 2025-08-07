import { Transformation, QueryResult, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface ConfigFromQueryResultsOptions {
  configField: string; // 用于提取配置的字段
  targetField: string; // 目标字段（将配置值应用到该字段）
}

export default class ConfigFromQueryResultsTransformation implements Transformation {
  name = 'ConfigFromQueryResults';

  constructor(private options: ConfigFromQueryResultsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    if (input.length < 2) {
      return input; // 至少需要两个查询结果：一个用于提取配置，一个用于应用配置
    }

    const [configResult, ...targetResults] = input;

    // 提取配置值
    const configValue = this.extractConfigValue(configResult);

    // 将配置值应用到目标结果
    return targetResults.map((result) => this.applyConfig(result, configValue));
  }

  private extractConfigValue(result: QueryResult): any {
    if (isTableData(result)) {
      // 从 TableData 中提取配置值
      const { configField } = this.options;
      const fieldIndex = result.fields.findIndex((f) => (f.state?.displayName || f.name) === configField);
      if (fieldIndex !== -1 && result.fields[fieldIndex].values.length > 0) {
        return result.fields[fieldIndex].values[0];
      }
      return null;
    } else if (isTimeSeries(result)) {
      // 从 TimeSeries 中提取配置值
      const { configField } = this.options;
      const configDataPoint = result.data.find((dataPoint) => dataPoint[configField as keyof DataPoint] !== undefined);
      return configDataPoint ? configDataPoint[configField as keyof DataPoint] : null;
    }
    return null;
  }

  private applyConfig(result: QueryResult, configValue: any): QueryResult {
    if (isTableData(result)) {
      // 将配置值应用到 TableData
      const { targetField } = this.options;

      // 创建新字段的值数组，长度与现有字段相同
      const valueCount = result.fields[0]?.values.length || 0;
      const newFieldValues = Array(valueCount).fill(configValue);

      const newFields = [
        ...result.fields,
        {
          name: targetField,
          type: typeof configValue === 'number' ? 'number' : 'string',
          values: newFieldValues,
          state: {},
        },
      ];

      return {
        ...result,
        fields: newFields,
      };
    } else if (isTimeSeries(result)) {
      // 将配置值应用到 TimeSeries
      const { targetField } = this.options;
      const newData = result.data.map((dataPoint) => ({
        ...dataPoint,
        [targetField]: configValue,
      }));
      return {
        ...result,
        data: newData,
      };
    }
    return result;
  }
}
