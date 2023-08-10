import _ from 'lodash';
import semver from 'semver';
import { getDsQuery, getESVersion } from './services';
import { normalizeTime } from '@/pages/alertRules/utils';
import { dslBuilder } from './utils';

interface IOptions {
  datasourceValue: number;
  query: any;
  start: number;
  end: number;
  interval: number;
  intervalUnit: 'second' | 'min' | 'hour';
  filters?: any[];
}

export default async function metricQuery(options: IOptions) {
  const { query, datasourceValue, start, end, interval, intervalUnit, filters } = options;
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
    dslBuilder({
      index: query.index,
      date_field: query.date_field,
      start: start,
      end: end,
      filters,
      query_string: query.filter,
      date_histogram: {
        intervalkey,
        interval: `${normalizeTime(interval, intervalUnit)}s`,
      },
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
        return [item.key / 1000, item.doc_count];
      }),
    },
  ];
  return series;
}
