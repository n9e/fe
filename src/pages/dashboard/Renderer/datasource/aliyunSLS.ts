import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery, getSLSLogs } from '@/services/metric';
import { ITarget } from '../../types';
import { getSerieName } from './utils';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
}

export default async function elasticSearchQuery(options: IOptions) {
  const { time, targets, datasourceCate, datasourceName } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchTimeSeriesParams: any[] = [];
  let batchTimeRawParams: any[] = [];
  let series: any[] = [];
  if (targets && datasourceName) {
    _.forEach(targets, (target) => {
      const query: any = target.query || {};
      const mode = query.mode;
      if (query.keys.valueKey) {
        query.keys.valueKey = _.join(query.keys.valueKey, ' ');
      }
      if (query.keys.labelKey) {
        query.keys.labelKey = _.join(query.keys.labelKey, ' ');
      }
      if (mode === 'timeSeries') {
        batchTimeSeriesParams.push({
          project: query.project,
          logstore: query.logstore,
          power_sql: query.power_sql,
          keys: query.keys,
          query: query.query,
          lines: 10,
          offset: 0,
          reverse: false,
          from: start,
          to: end,
        });
      } else if (mode === 'raw') {
        batchTimeRawParams.push({
          project: query.project,
          logstore: query.logstore,
          power_sql: query.power_sql,
          query: query.query,
          lines: 500,
          offset: 0,
          reverse: false,
          from: start,
          to: end,
        });
      }
    });
    const seriesRes = await getDsQuery({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchTimeSeriesParams,
    });
    const rawRes = await getSLSLogs({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchTimeRawParams,
    });
    series = _.map(seriesRes, (item) => {
      return {
        id: _.uniqueId('series_'),
        name: getSerieName(item.metric),
        metric: item.metric,
        data: item.values,
      };
    });
    const raw = _.map(rawRes.list, (item) => {
      return {
        id: item.__time__,
        name: item.__time__,
        metric: item,
        data: [],
      };
    });
    return _.concat(series, raw);
  }
  return series;
}
