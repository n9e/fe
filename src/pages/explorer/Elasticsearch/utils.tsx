import React from 'react';
import _ from 'lodash';
import flatten from './flatten';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getColumnsFromFields(selectedFields: string[], dateField?: string) {
  let columns: any[] = [];
  if (_.isEmpty(selectedFields)) {
    columns = [
      {
        title: 'Document',
        dataIndex: 'fields',
        render(text) {
          return (
            <dl className='es-discover-logs-row'>
              {_.map(text, (val, key) => {
                const value = _.isArray(val) ? _.join(val, ',') : val;
                return (
                  <React.Fragment key={key}>
                    <dt>{key}:</dt> <dd>{value}</dd>
                  </React.Fragment>
                );
              })}
            </dl>
          );
        },
      },
    ];
  } else {
    columns = _.map(selectedFields, (item) => {
      return {
        title: item,
        dataIndex: 'fields',
        key: item,
        render: (fields) => {
          const value = _.isArray(fields[item]) ? _.join(fields[item], ',') : fields[item];
          return value;
        },
        sorter: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
      };
    });
  }
  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: 'fields',
      key: 'time',
      width: 200,
      render: (fields) => {
        return fields[dateField];
      },
      defaultSortOrder: 'descend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: true,
    });
  }
  return columns;
}

interface Mappings {
  [index: string]: {
    properties: {
      [key: string]:
        | {
            type: string;
          }
        | Mappings;
    };
  };
}

const typeMap: Record<string, string> = {
  float: 'number',
  double: 'number',
  integer: 'number',
  long: 'number',
  date: 'date',
  date_nanos: 'date',
  string: 'string',
  text: 'string',
  scaled_float: 'number',
  nested: 'nested',
  histogram: 'number',
};

export function mappingsToFields(mappings: Mappings, type?: string) {
  const fields: string[] = [];
  _.forEach(mappings, (item: any) => {
    function loop(mappings, prefix = '') {
      // mappings?.doc?.properties 为了兼容 6.x 版本接口
      _.forEach(mappings?.doc?.properties || mappings?.properties, (item, key) => {
        if (item.type) {
          if (typeMap[item.type] === type || !type) {
            fields.push(`${prefix}${key}`);
          }
        } else {
          loop(item, `${key}.`);
        }
      });
    }
    loop(item.mappings);
  });
  return _.sortBy(_.union(fields));
}

export function normalizeLogsQueryRequestBody(params: any) {
  const header = {
    search_type: 'query_then_fetch',
    ignore_unavailable: true,
    index: params.index,
  };
  const body: any = {
    size: params.limit,
    query: {
      bool: {
        filter: [
          {
            range: {
              [params.date_field]: {
                gte: params.start,
                lte: params.end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    sort: [
      {
        [params.date_field]: {
          order: params.order || 'desc',
          unmapped_type: 'boolean',
        },
      },
    ],
    script_fields: {},
    aggs: {},
  };
  if (params.filter) {
    body.query.bool.filter.push({
      query_string: {
        analyze_wildcard: true,
        query: params.filter || '*',
      },
    });
  }
  return `${JSON.stringify(header)}\n${JSON.stringify(body)}\n`;
}

export function normalizeTimeseriesQueryRequestBody(params: any) {
  const header = {
    search_type: 'query_then_fetch',
    ignore_unavailable: true,
    index: params.index,
  };
  const body: any = {
    size: params.limit,
    query: {
      bool: {
        filter: [
          {
            range: {
              [params.date_field]: {
                gte: params.start,
                lte: params.end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    script_fields: {},
    _source: false,
    aggs: {
      A: {
        date_histogram: {
          field: '@timestamp',
          min_doc_count: 0,
          extended_bounds: {
            min: params.start,
            max: params.end,
          },
          format: 'epoch_millis',
          interval: params.interval,
        },
        aggs: {},
      },
    },
  };
  if (params.filter) {
    body.query.bool.filter.push({
      query_string: {
        analyze_wildcard: true,
        query: params.filter || '*',
      },
    });
  }
  return `${JSON.stringify(header)}\n${JSON.stringify(body)}\n`;
}

export const flattenHits = (hits: any[]): { docs: Array<Record<string, any>>; propNames: string[] } => {
  const docs: any[] = [];
  let propNames: string[] = [];

  for (const hit of hits) {
    const flattened = hit._source ? flatten(hit._source) : {};
    const doc = {
      _id: hit._id,
      _type: hit._type,
      _index: hit._index,
      sort: hit.sort,
      highlight: hit.highlight,
      _source: { ...flattened },
      fields: { ...flattened },
    };

    for (const propName of Object.keys(doc)) {
      if (propNames.indexOf(propName) === -1) {
        propNames.push(propName);
      }
    }

    docs.push(doc);
  }

  propNames.sort();
  return { docs, propNames };
};
