import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getLogQuery } from '@/services/warning';
import { ITarget } from '../../types';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceName: string;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
}

export default async function elasticSearchLogQuery(options: IOptions) {
  const { time, targets, datasourceCate, datasourceName } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchParams: any[] = [];
  let series: any[] = [];
  if (targets && datasourceName) {
    _.forEach(targets, (target) => {
      const query: any = target.query || {};
      batchParams.push({
        index: query.index,
        filter: query.filter,
        date_field: query.date_field,
        limit: query.limit,
        start,
        end,
      });
    });
    const res = await getLogQuery({
      cate: datasourceCate,
      cluster: datasourceName,
      query: batchParams,
    });
    series = _.map(res.dat, (item) => {
      return {
        id: item._id,
        name: item._index,
        metric: item.fields,
        data: [],
      };
    });
  }
  return series;
}
