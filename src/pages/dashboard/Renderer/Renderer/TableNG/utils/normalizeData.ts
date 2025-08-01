import _ from 'lodash';

import { TransformationPipeline, transformationsMap } from '@/pages/dashboard/transformations';
import type { TableData } from '@/pages/dashboard/transformations/types';
import type { ITransformation } from '@/pages/dashboard/types';

export default function normalizeData(
  series: {
    id: string;
    refId: string;
    metric: { [key: string]: string };
    data: [number, number][];
    isRawData?: boolean;
  }[],
  transformations?: ITransformation[],
): (TableData & {
  id: string;
  metric?: { [key: string]: string };
})[] {
  let data: (TableData & {
    id: string;
  })[] = [];
  const isRawData = _.every(series, (item) => item.isRawData);
  if (isRawData) {
    const rows = _.map(series, (item) => {
      return item.metric;
    });
    data = [
      {
        id: 'rawData',
        refId: 'rawData',
        columns: _.uniq(_.flatMap(series, (item) => _.keys(item.metric))),
        rows,
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
              row[column] = dataPoint[1];
            } else {
              row[column] = item.metric[column] || null; // 默认值为 null
            }
          });
          rows.push(row);
        });
      });
      return {
        id: `#${refId}`,
        refId,
        columns,
        rows,
      };
    });
  }

  if (transformations && transformations.length > 0) {
    const pipeline = new TransformationPipeline();
    _.forEach(transformations, (transformationConfig) => {
      const transformationClass = transformationsMap[transformationConfig.id];
      if (transformationClass) {
        const transformation = new transformationClass(transformationConfig.options);
        pipeline.addTransformation(transformation);
      }
    });
    const result = pipeline.apply(data);
    return result;
  }
  return data;
}
