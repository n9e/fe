import React from 'react';
import _ from 'lodash';

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
            <dl className='event-logs-row'>
              {_.map(text, (val, key) => {
                return (
                  <React.Fragment key={key}>
                    <dt>{key}:</dt> <dd>{_.join(val, ',')}</dd>
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
        render: (fields) => {
          return _.join(fields[item], ',');
        },
        sorter: (a, b) => localeCompareFunc(_.join(_.get(a, `fields[${item}]`, '')), _.join(_.get(b, `fields[${item}]`, ''))),
      };
    });
  }
  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: 'fields',
      width: 200,
      render: (fields) => {
        return fields[dateField];
      },
      sorter: (a, b) => {
        return localeCompareFunc(_.join(_.get(a, `fields[${dateField}]`, '')), _.join(_.get(b, `fields[${dateField}]`, '')));
      },
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

export function mappingsToFields(mappings: Mappings) {
  const fields: string[] = [];
  _.forEach(mappings, (item: any) => {
    function loop(mappings, prefix = '') {
      _.forEach(mappings?.properties, (item, key) => {
        if (item.type) {
          fields.push(`${prefix}${key}`);
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
  const body = {
    size: params.limit,
    from: params.page,
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
        must: [
          {
            query_string: {
              analyze_wildcard: true,
              query: params.filter || '*',
            },
          },
        ],
      },
    },
    sort: [
      {
        [params.date_field]: {
          order: 'desc',
          unmapped_type: 'boolean',
        },
      },
    ],
    script_fields: {},
    aggs: {},
    fields: ['*'],
  };
  return `${JSON.stringify(header)}\n${JSON.stringify(body)}\n`;
}

export function normalizeTimeseriesQueryRequestBody(params: any) {
  const header = {
    search_type: 'query_then_fetch',
    ignore_unavailable: true,
    index: params.index,
  };
  const body = {
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
        must: [
          {
            query_string: {
              analyze_wildcard: true,
              query: params.filter || '*',
            },
          },
        ],
      },
    },
    sort: [
      {
        [params.date_field]: {
          order: 'desc',
          unmapped_type: 'boolean',
        },
      },
    ],
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
          fixed_interval: params.interval,
        },
        aggs: {},
      },
    },
  };
  return `${JSON.stringify(header)}\n${JSON.stringify(body)}\n`;
}
