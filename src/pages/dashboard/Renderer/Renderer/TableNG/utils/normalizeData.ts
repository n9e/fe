import _ from 'lodash';

import { TransformationPipeline, transformationsMap } from '@/pages/dashboard/transformations';
import type { TableData } from '@/pages/dashboard/transformations/types';
import type { ITransformation } from '@/pages/dashboard/types';
import { calculateVariance, calculateStdDev } from '@/pages/dashboard/Renderer/utils/calculateField';

export default function normalizeData(
  series: {
    id: string;
    refId: string;
    metric: { [key: string]: string };
    data: [number, number][];
    mode: 'timeSeries' | 'raw';
  }[],
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
            values: _.map(rows, (row) => row[column] ?? null),
            state: {},
          };
        }),
      },
    ];
  } else {
    const dataGrouped = _.groupBy(series, (item) => item.refId);
    data = _.map(dataGrouped, (subSeries, refId) => {
      const columns = _.union(['__time'], _.uniq(_.flatMap(subSeries, (item) => _.keys(item.metric))), [`__value_#${refId}`]);
      const rows: { [key: string]: any }[] = [];
      _.forEach(subSeries, (item) => {
        _.forEach(item.data, (dataPoint) => {
          const row = {};
          _.forEach(columns, (column) => {
            if (column === '__time') {
              row[column] = dataPoint[0];
            } else if (column === `__value_#${item.refId}`) {
              row[column] = dataPoint[1] !== null ? _.toNumber(dataPoint[1]) : null;
            } else {
              row[column] = item.metric[column] ?? null; // 默认值为 null
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
          let min: number | null = null;
          let max: number | null = null;
          let sum: number | null = null;
          let avg: number | null = null;

          if (column === `__value_#${refId}`) {
            _.forEach(values, (value) => {
              if (value !== null) {
                if (min === null || value < min) {
                  min = value;
                }
                if (max === null || value > max) {
                  max = value;
                }
                sum = (sum || 0) + value;
              }
            });
            if (values.length > 0) {
              avg = sum !== null ? sum / values.length : null;
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
                variance: calculateVariance(values),
                stdDev: calculateStdDev(values),
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
    const pipeline = new TransformationPipeline();
    _.forEach(enabledTransformations, (transformationConfig) => {
      const transformationClass = transformationsMap[transformationConfig.id];
      if (transformationClass) {
        const transformation = new transformationClass(transformationConfig.options);
        pipeline.addTransformation(transformation);
      }
    });
    data = pipeline.apply(data);
  }

  return _.map(data, (item) => {
    return {
      ...item,
      columns: _.map(
        _.filter(item.fields, (field) => {
          return field.state.hide !== true;
        }),
        (field) => {
          return field.state.displayName || field.name;
        },
      ),
      rows: _.map(item.fields[0]?.values, (_value, index) => {
        const row: { [key: string]: string | number | null } = {};
        _.forEach(item.fields, (field) => {
          const name = field.state.displayName || field.name;
          row[name] = field.values[index] ?? null;
        });
        return row;
      }),
    };
  });
}
