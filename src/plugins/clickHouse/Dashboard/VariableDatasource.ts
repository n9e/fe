import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Props } from '@/pages/dashboard/Variables/datasource';

import { getLogsQuery } from '../services';

export default async function variableDatasource(
  props: Props<{
    range?: IRawTimeRange;
    query?: string;
  }>,
) {
  const { datasourceCate, datasourceValue, query } = props;
  const queryValue = query?.query;
  let options: string[] = [];

  if (queryValue && query.range) {
    const parsedRange = parseRange(query.range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    const res = await getLogsQuery({
      queries: [
        {
          ds_cate: datasourceCate,
          ds_id: datasourceValue,
          ref: 'A',
          query: {
            ref: 'A',
            from: start,
            to: end,
            sql: queryValue,
          },
        },
      ],
    });
    _.forEach(res, (resItem) => {
      _.forEach(resItem.data, (dataItem) => {
        _.forEach(dataItem, (labelValue) => {
          if (_.isPlainObject(labelValue)) {
            options.push(JSON.stringify(labelValue));
          } else {
            options.push(_.toString(labelValue));
          }
        });
      });
    });
    options = _.uniq(_.compact(options));
  }
  return Promise.resolve(options);
}
