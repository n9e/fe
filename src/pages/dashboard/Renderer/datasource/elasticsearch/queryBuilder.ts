import _ from 'lodash';
import { ElasticsearchQuery } from './types';

export function getLogsQuery(target: ElasticsearchQuery) {
  const queryObj: any = {
    size: target.limit,
    query: {
      bool: {
        filter: [
          {
            range: {
              [target.date_field]: {
                gte: target.start,
                lte: target.end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    sort: [
      {
        [target.date_field]: {
          order: 'desc',
          unmapped_type: 'boolean',
        },
      },
    ],
    script_fields: {},
    aggs: {},
  };
  if (target.filter && target.filter !== '') {
    queryObj.query.bool.filter = [
      ...queryObj.query.bool.filter,
      {
        query_string: {
          analyze_wildcard: true,
          query: target.filter,
        },
      },
    ];
  }
  return queryObj;
}

export function getSeriesQuery(target: ElasticsearchQuery, intervalkey: string) {
  target = _.cloneDeep(target);
  target.values = target.values || [{ func: 'count' }];
  target.group_by = target.group_by || [{ cate: 'date_histogram' }];

  if (!_.find(target.group_by, { cate: 'date_histogram' })) {
    target.group_by = [...target.group_by, { cate: 'date_histogram' }];
  }

  const queryObj: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              [target.date_field]: {
                gte: target.start,
                lte: target.end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
  };

  if (target.filter && target.filter !== '') {
    queryObj.query.bool.filter = [
      ...queryObj.query.bool.filter,
      {
        query_string: {
          analyze_wildcard: true,
          query: target.filter,
        },
      },
    ];
  }

  let nestedAggs = queryObj;

  for (let i = 0; i < target.group_by.length; i++) {
    const aggDef = target.group_by[i];
    const esAgg: any = {};
    let aggField;

    switch (aggDef.cate) {
      case 'date_histogram': {
        aggField = 'date';
        esAgg['date_histogram'] = {
          field: target.date_field,
          min_doc_count: 0,
          extended_bounds: {
            min: target.start,
            max: target.end,
          },
          format: 'epoch_millis',
          [intervalkey]: target.interval,
        };
        break;
      }
      case 'terms': {
        aggField = aggDef.field;
        esAgg['terms'] = {
          field: aggDef.field,
          size: aggDef.size || 10,
          order: {
            [aggDef.orderBy || '_key']: aggDef.order || 'desc',
          },
          min_doc_count: aggDef.min_value || 1,
        };
        break;
      }
    }

    nestedAggs.aggs = nestedAggs.aggs || {};
    if (aggField) {
      nestedAggs.aggs[aggField] = esAgg;
    }
    nestedAggs = esAgg;
  }

  nestedAggs.aggs = {};
  let metric;

  for (let i = 0; i < target.values.length; i++) {
    metric = target.values[i];
    if (metric.func === 'count') {
      continue;
    }

    const aggField: any = {};
    let metricAgg: any = {};

    metricAgg = { field: metric.field };

    _.forEach([90, 95, 99], (p) => {
      if (metric.func === `p${p}`) {
        metric.func = 'percentiles';
        metricAgg['percents'] = [p];
      }
    });

    aggField[metric.func] = metricAgg;
    nestedAggs.aggs[`${metric.func} ${metric.field}`] = aggField;
  }
  return queryObj;
}
