import _ from 'lodash';

import { isRegisteredTransformationId, TransformationPipeline, transformationsMap } from '@/pages/dashboard/transformations';
import type { Transformation } from '@/pages/dashboard/transformations';
import type { TableCellValue, TableData } from '@/pages/dashboard/transformations/types';
import type { ITransformation } from '@/pages/dashboard/types';
import { calculateVariance, calculateStdDev } from '@/pages/dashboard/Renderer/utils/calculateField';
import { normalizeDataPointValue } from './parseNumericValue';
import type { DashboardSeries } from '../../../datasource/types';

export default function normalizeData(
  series: DashboardSeries[],
  transformations?: ITransformation[],
): (TableData & {
  id: string;
  columns: string[];
  rows: { [key: string]: string | number | null }[];
})[] {
  let data: (TableData & {
    id: string;
  })[] = [];
  const isRawData = _.every(series, (item) => item.mode === 'raw');
  if (isRawData) {
    const rows = _.map(series, (item) => {
      return item.metric;
    });
    const columns = _.uniq(_.flatMap(rows, (item) => _.keys(item)));

    data = [
      {
        id: 'rawData',
        refId: 'rawData',
        fields: _.map(columns, (column) => {
          return {
            name: column,
            type: 'string',
            values: _.map(rows, (row) => (row[column] ?? null) as TableCellValue),
            state: {},
          };
        }),
      },
    ];
  } else {
    const dataGrouped = _.groupBy(series, (item) => item.refId);
    data = _.map(dataGrouped, (subSeries, refId) => {
      const isRawData = _.every(subSeries, (item) => item.mode === 'raw');
      if (isRawData) {
        const rows = _.map(subSeries, (item) => item.metric);
        const columns = _.uniq(_.flatMap(rows, (item) => _.keys(item)));

        return {
          id: `#${refId}`,
          refId,
          fields: _.map(columns, (column) => {
            return {
              name: column,
              type: 'string',
              values: _.map(rows, (row) => (row[column] ?? null) as TableCellValue),
              state: {},
            };
          }),
        };
      }

      const columns = _.union(['__time'], _.uniq(_.flatMap(subSeries, (item) => _.keys(item.metric))), [`__value_#${refId}`]);
      const rows: Array<Record<string, TableCellValue>> = [];
      _.forEach(subSeries, (item) => {
        _.forEach(item.data, (dataPoint) => {
          const row: Record<string, TableCellValue> = {};
          _.forEach(columns, (column) => {
            if (column === '__time') {
              row[column] = dataPoint[0];
            } else if (column === `__value_#${item.refId}`) {
              row[column] = normalizeDataPointValue(dataPoint[1]);
            } else {
              // metric 值来自 DashboardSeries，运行时为 string/number 等标量，这里收窄为 TableCellValue
              row[column] = (item.metric[column] ?? null) as TableCellValue; // 默认值为 null
            }
          });
          rows.push(row);
        });
      });
      return {
        id: `#${refId}`,
        refId,
        fields: _.map(columns, (column) => {
          const values = _.map(rows, (row) => row[column] ?? null);
          const numericValues = _.filter(values, (value): value is number => typeof value === 'number' && Number.isFinite(value));
          let min: number | null = null;
          let max: number | null = null;
          let sum: number | null = null;
          let avg: number | null = null;

          if (column === `__value_#${refId}`) {
            _.forEach(numericValues, (value) => {
              if (min === null || value < min) {
                min = value;
              }
              if (max === null || value > max) {
                max = value;
              }
              sum = (sum || 0) + value;
            });
            if (numericValues.length > 0) {
              avg = sum !== null ? sum / numericValues.length : null;
            }
          }
          return {
            name: column,
            type: _.includes(['__time'], column) ? 'time' : _.includes([`__value_#${refId}`], column) ? 'number' : 'string',
            values,
            state: {
              calcs: {
                min,
                max,
                sum,
                avg,
                last: _.last(values),
                variance: calculateVariance(numericValues),
                stdDev: calculateStdDev(numericValues),
                count: values.length,
              },
            },
          };
        }),
      };
    });
  }

  const enabledTransformations = _.filter(transformations, (transformation) => transformation.disabled !== true);

  if (enabledTransformations && enabledTransformations.length > 0) {
    // 转换链会基于 TableData 重建对象（如 organize 返回新的 fields 列表），
    // 先快照各帧的 id，供转换后回填，避免丢失用于帧切换的标识。
    const idByRefId = new Map<string, string>();
    _.forEach(data, (item) => {
      if (item.id !== undefined && item.id !== null) {
        idByRefId.set(item.refId, item.id);
      }
    });

    const pipeline = new TransformationPipeline();
    _.forEach(enabledTransformations, (transformationConfig) => {
      if (isRegisteredTransformationId(transformationConfig.id)) {
        // transformationsMap 各构造器参数不统一（部分无参，运行时按 options 实例化），这里统一收窄为带 options 的构造器
        const transformationClass = transformationsMap[transformationConfig.id] as unknown as new (options: ITransformation['options']) => Transformation;
        const transformation = new transformationClass(transformationConfig.options);
        pipeline.addTransformation(transformation);
      }
    });
    // 转换链对 TableData 结构做变换，运行时保留 id 字段，这里做类型收窄
    data = pipeline.apply(data) as (TableData & { id: string })[];
    // 转换后若 id 丢失（例如转换器只返回 { refId, fields }），按原始 refId 回填。
    data = _.map(data, (item) => {
      if (item.id !== undefined && item.id !== null) {
        return item;
      }
      const restoredId = idByRefId.get(item.refId);
      return restoredId === undefined ? item : { ...item, id: restoredId };
    });
  }

  return _.map(data, (item) => {
    const visibleFields = _.filter(item.fields, (field) => {
      return field.state.hide !== true;
    });
    return {
      ...item,
      columns: _.map(visibleFields, (field) => {
        return field.state.displayName || field.name;
      }),
      rows: _.map(visibleFields[0]?.values, (_value, index) => {
        const row: { [key: string]: string | number | null } = {};
        _.forEach(visibleFields, (field) => {
          const name = field.state.displayName || field.name;
          row[name] = (field.values[index] ?? null) as string | number | null;
        });
        return row;
      }),
    };
  });
}
