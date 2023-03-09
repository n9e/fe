import _ from 'lodash';
import { getDsQuery } from './services';
import { normalizeTime } from '@/pages/alertRules/utils';
import { normalizeTimeseriesQueryRequestBody } from './utils';

interface IOptions {
  datasourceCate: string;
  datasourceValue: number;
  query: any;
  start: number;
  end: number;
  interval: number;
  intervalUnit: 'second' | 'min' | 'hour';
}

export default async function metricQuery(options: IOptions) {
  const { query, datasourceValue, start, end, interval, intervalUnit } = options;
  let series: any[] = [];
  const res = await getDsQuery(
    datasourceValue,
    normalizeTimeseriesQueryRequestBody({
      index: query.index,
      filter: query.filter,
      date_field: query.date_field,
      interval: `${normalizeTime(interval, intervalUnit)}s`,
      start: start,
      end: end,
    }),
  );
  series = [
    {
      id: _.uniqueId('series_'),
      name: 'doc_count',
      metric: {
        __name__: 'doc_count',
      },
      data: _.map(res, (item) => {
        return [item.key, item.doc_count];
      }),
    },
  ];
  return series;
}
