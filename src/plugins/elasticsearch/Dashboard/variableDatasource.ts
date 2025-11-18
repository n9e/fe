import moment from 'moment';
import _ from 'lodash';

import { getESVariableResult } from '@/services/dashboardV2';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Props } from '@/pages/dashboard/Variables/datasource';

export function normalizeESQueryRequestBody(
  params: {
    find: string;
    field: string;
    query?: string;
    size?: number;
    orderBy?: string;
    order?: string;
  },
  date_field: string | undefined,
  start: number,
  end: number,
) {
  let orderBy = '_key';
  if (params?.orderBy === 'doc_count') {
    orderBy = '_count';
  }
  const body: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              [date_field || '@timestamp']: {
                gte: start,
                lte: end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    aggs: {
      A: {
        [params.find]: {
          field: `${params.field}`,
          size: params.size || 500,
          order: {
            [orderBy]: params.order || 'desc',
          },
        },
      },
    },
  };

  if (params.query && params.query !== '') {
    body.query.bool.filter = [
      ...body.query.bool.filter,
      params?.query
        ? {
            query_string: {
              analyze_wildcard: true,
              query: params?.query,
            },
          }
        : { match_all: {} },
    ];
  }

  return body;
}

export default async function variableDatasource(
  props: Props<{
    range?: IRawTimeRange;
    query?: string;
    config?: any;
  }>,
) {
  const { datasourceValue, query } = props;
  const queryValue = query.query;
  const range = query.range;
  const config = query.config;
  let options: string[] = [];

  if (queryValue && range) {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).valueOf();
    const end = moment(parsedRange.end).valueOf();
    const expression = _.trim(queryValue);

    try {
      const query = JSON.parse(expression);
      return getESVariableResult(datasourceValue, config?.index!, normalizeESQueryRequestBody(query, config?.date_field, start, end));
    } catch (e) {
      console.warn(e);
      return Promise.resolve([]);
    }
  }
  return Promise.resolve(options);
}
