import _ from 'lodash';
import moment from 'moment';

import { Props } from '@/pages/dashboard/Variables/datasource';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

import { getLogsQuery } from '../services';
import { NAME_SPACE, QUERY_KEY } from '../constants';

export default async function variableDatasource(
  options: Props<{
    range: IRawTimeRange;
    expression: string;
  }>,
) {
  const { datasourceValue, query } = options;
  const { range, expression } = query;
  const parsedRange = parseRange(range);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  const batchRawParams = [
    {
      ref: 'A',
      ds_id: datasourceValue,
      ds_cate: NAME_SPACE,
      query: {
        ref: 'A',
        from: start,
        to: end,
        [QUERY_KEY]: expression,
      },
    },
  ];
  try {
    const rawRes = await getLogsQuery({
      queries: batchRawParams,
    });
    const varOptions: string[] = [];
    _.forEach(rawRes, (item) => {
      _.forEach(item.data, (data) => {
        _.forEach(data, (value: string) => {
          if (!varOptions.includes(value)) {
            varOptions.push(value);
          }
        });
      });
    });
    return Promise.resolve(varOptions);
  } catch (e) {
    return Promise.resolve([]);
  }
}
