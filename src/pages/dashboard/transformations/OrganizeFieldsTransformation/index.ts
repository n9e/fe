import { Transformation, QueryResult, TimeSeries, TableData, DataPoint } from '../types';
import { isTimeSeries, isTableData } from '../utils';

export interface OrganizeFieldsOptions {
  fields: string[]; // 需要保留的字段列表
  renameByName?: Record<string, string>; // 字段重命名映射
  excludeByName?: Record<string, boolean>; // 排除的字段
  indexByName?: Record<string, number>; // 字段索引映射
}

export default class OrganizeFieldsTransformation implements Transformation {
  name = 'OrganizeFields';

  constructor(private options: OrganizeFieldsOptions) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.map((result) => {
      if (isTimeSeries(result)) {
        return this.organizeTimeSeriesFields(result);
      } else if (isTableData(result)) {
        return this.organizeTableDataFields(result);
      }
      return result;
    });
  }

  private organizeTimeSeriesFields(series: TimeSeries): TimeSeries {
    const { fields, renameByName, excludeByName, indexByName } = this.options;

    if (!fields || fields.length === 0) {
      return series; // 如果没有指定字段，则返回原始时间序列数据
    }

    const newData = series.data.map((dataPoint) => {
      const newDataPoint: Record<string, any> = {};

      // 获取所有字段并排除被标记为排除的字段
      const availableFields = fields.filter((field) => !excludeByName?.[field]);

      // 根据indexByName排序字段
      const sortedFields = availableFields.sort((a, b) => {
        const indexA = indexByName?.[a] ?? Number.MAX_SAFE_INTEGER;
        const indexB = indexByName?.[b] ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
      });

      sortedFields.forEach((field) => {
        if (dataPoint.hasOwnProperty(field)) {
          const newFieldName = renameByName?.[field] || field;
          newDataPoint[newFieldName] = dataPoint[field as keyof DataPoint];
        }
      });
      return newDataPoint as DataPoint;
    });

    return {
      ...series,
      data: newData,
    };
  }

  private organizeTableDataFields(table: TableData): TableData {
    const { fields, renameByName, excludeByName, indexByName } = this.options;

    if (!fields || fields.length === 0) {
      return table; // 如果没有指定字段，则返回原始表格数据
    }

    // 获取所有字段并排除被标记为排除的字段
    const availableFields = fields.filter((field) => !excludeByName?.[field]);

    // 根据indexByName排序字段
    const sortedFields = availableFields.sort((a, b) => {
      const indexA = indexByName?.[a] ?? Number.MAX_SAFE_INTEGER;
      const indexB = indexByName?.[b] ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });

    // 过滤并重命名字段
    const newFields = sortedFields
      .map((fieldName) => {
        // 找到对应的字段
        const field = table.fields.find((f) => f.name === fieldName);
        if (!field) return null;

        return {
          ...field,
          name: renameByName?.[field.name] || field.name,
          state: {
            ...field.state,
            displayName: renameByName?.[field.name] || field.state?.displayName || field.name,
          },
        };
      })
      .filter((field) => field !== null);

    return {
      ...table,
      fields: newFields,
    };
  }
}
