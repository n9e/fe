import _ from 'lodash';
import semver from 'semver';
import { getDsQuery, getESVersion } from './services';
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
  let intervalkey = 'interval';
  try {
    const version = await getESVersion(datasourceValue);
    if (semver.gte(version, '8.0.0')) {
      intervalkey = 'fixed_interval';
    }
  } catch (e) {
    console.error(new Error('get es version error'));
  }

  const res = await getDsQuery(
    datasourceValue,
    normalizeTimeseriesQueryRequestBody(
      {
        index: query.index,
        filter: query.filter,
        date_field: query.date_field,
        interval: `${normalizeTime(interval, intervalUnit)}s`,
        start: start,
        end: end,
      },
      intervalkey,
    ),
  );
  series = [
    {
      id: _.uniqueId('series_'),
      name: 'doc_count',
      metric: {
        __name__: 'doc_count',
      },
      data: _.map(res, (item) => {
        return [item.key / 1000, item.doc_count];
      }),
    },
  ];
  return series;
}
