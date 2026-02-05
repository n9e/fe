import _ from 'lodash';
import semver from 'semver';
import { buildESQueryFromKuery } from '@fc-components/es-query';

import { Filter } from '../ExplorerNG/types';
import { getHighlightRequest } from './highlight';

export default function dslBuilder(params: {
  index: string;
  date_field?: string;
  start: number;
  end: number;
  filters?: Filter[];
  syntax?: string; // lucene | kuery
  query_string?: string;
  kuery?: string;
  from?: number;
  limit?: number;
  order?: string;
  orderField?: string;
  sorter?: {
    field: string;
    order: string;
  }[];
  fields?: string[];
  _source?: boolean;
  date_histogram?: {
    interval: string;
    intervalkey: string;
  };
  shouldHighlight?: boolean;
  version?: string;
}) {
  const syntax = params.syntax || 'lucene';
  const header = {
    search_type: 'query_then_fetch',
    ignore_unavailable: true,
    index: params.index,
  };
  const body: any = {
    query: {
      bool: {
        filter: [],
        must_not: [],
      },
    },
    script_fields: {},
    // TODO: es6.x 和 es7.x 未测试，暂时不开放
    // fields: [
    //   {
    //     field: '*',
    //     include_unmapped: 'true',
    //   },
    // ],
    _source: false,
    aggs: {},
    from: 0,
  };
  body.track_total_hits = true; //get real hits total
  body.highlight = getHighlightRequest(!!params.shouldHighlight);
  if (params.date_field) {
    body.query.bool.filter.push({
      range: {
        [params.date_field]: {
          gte: params.start,
          lte: params.end,
          format: 'epoch_millis',
        },
      },
    });
  }
  if (_.isNumber(params.from)) {
    body.from = params.from;
  }
  if (params.limit) {
    body.size = params.limit;
  }
  if (!_.isEmpty(params.sorter)) {
    body.sort = _.map(params.sorter, (item) => {
      return {
        [item.field]: {
          order: item.order,
          unmapped_type: 'boolean',
        },
      };
    });
  } else if (params.order && params.orderField) {
    body.sort = [
      {
        [params.orderField]: {
          order: params.order,
          unmapped_type: 'boolean',
        },
      },
    ];
  }
  if (typeof params._source === 'boolean') {
    body._source = params._source;
  }
  if (_.isArray(params.fields)) {
    // 如果版本小于 7.10.0，不支持 fields 改用 docvalue_fields
    if (params.version && semver.lt(params.version, '7.10.0')) {
      body.docvalue_fields = params.fields;
    } else {
      body.fields = params.fields;
    }
  }
  if (_.isArray(params.filters)) {
    _.forEach(params.filters, (item) => {
      if (item.operator === 'AND') {
        body.query.bool.filter.push({
          match_phrase: {
            [item.key]: item.value,
          },
        });
      } else if (item.operator === 'NOT') {
        body.query.bool.must_not.push({
          match_phrase: {
            [item.key]: item.value,
          },
        });
      } else if (item.operator === 'EXISTS') {
        body.query.bool.filter.push({
          exists: {
            field: item.key,
          },
        });
      }
    });
  }
  if (syntax === 'lucene') {
    body.query.bool.filter.push(
      params.query_string
        ? {
            query_string: {
              analyze_wildcard: true,
              query: params.query_string,
            },
          }
        : { match_all: {} },
    );
  }
  if (syntax === 'kuery' && params.kuery) {
    const query = buildESQueryFromKuery(params.kuery);
    body.query.bool.filter = _.concat(body.query.bool.filter, query.filter);
  }
  if (params.date_histogram) {
    _.set(body, 'aggs.A', {
      date_histogram: {
        field: params.date_field,
        min_doc_count: 0,
        extended_bounds: {
          min: params.start,
          max: params.end,
        },
        format: 'epoch_millis',
        [params.date_histogram.intervalkey]: params.date_histogram.interval,
      },
    });
  }
  return `${JSON.stringify(header)}\n${JSON.stringify(body)}\n`;
}
