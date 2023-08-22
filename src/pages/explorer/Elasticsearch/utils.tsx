import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { measureTextWidth } from '@ant-design/plots';
import flatten from './flatten';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getFieldLabel(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.attrs?.[fieldKey]?.alias || fieldKey;
}

export function getFieldType(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.formatMap?.[fieldKey]?.type;
}

export function getFieldValue(fieldKey, fieldValue, fieldConfig?: any) {
  const format = fieldConfig?.formatMap?.[fieldKey];
  if (format && format?.type === 'date' && format?.params?.pattern) {
    return moment(fieldValue).format(format?.params?.pattern);
  }
  if (format && format?.type === 'url' && format?.params?.urlTemplate) {
    return (
      <a target='_blank' href={format?.params?.urlTemplate.replace('{{value}}', fieldValue)}>
        {format?.params?.labelTemplate.replace('{{value}}', fieldValue)}
      </a>
    );
  }
  return fieldValue;
}

export function normalizeLogs(logs: { [index: string]: string }, fieldConfig?: any) {
  const logsClone = _.cloneDeep(logs);
  _.forEach(logsClone, (item, key) => {
    const label = getFieldLabel(key, fieldConfig);
    logsClone[label] = getFieldValue(key, item, fieldConfig);
    if (label !== key) {
      delete logsClone[key];
    }
  });
  return logsClone;
}

export function getColumnsFromFields(selectedFields: { name: string }[], dateField?: string, fieldConfig?: any, filters?: any[]) {
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
                const label = getFieldLabel(key, fieldConfig);
                const value = _.isArray(val) ? _.join(val, ',') : getFieldValue(key, val, fieldConfig);
                return (
                  <React.Fragment key={label}>
                    <dt>{label}:</dt> <dd>{_.find(filters, { key, value: val, operator: 'is' }) ? <mark>{value}</mark> : value}</dd>
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
      const fieldKey = item.name;
      const label: string = getFieldLabel(fieldKey, fieldConfig);
      return {
        title: getFieldLabel(fieldKey, fieldConfig),
        dataIndex: 'fields',
        key: item,
        render: (fields) => {
          const fieldVal = getFieldValue(item.name, fields[fieldKey], fieldConfig);
          const value = _.isArray(fieldVal) ? _.join(fieldVal, ',') : fieldVal;
          return (
            <div
              style={{
                minWidth: measureTextWidth(label) + 30, // sorter width
              }}
            >
              {_.find(filters, { key: fieldKey, value: fields[fieldKey], operator: 'is' }) ? <mark>{value}</mark> : value}
            </div>
          );
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
        const format = fieldConfig?.formatMap?.[dateField];
        return getFieldValue(dateField, fields[dateField], {
          formatMap: {
            [dateField]: {
              type: 'date',
              params: {
                pattern: format?.params?.pattern || 'YYYY-MM-DD HH:mm:ss',
              },
            },
          },
        });
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

export const typeMap: Record<string, string> = {
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
  boolean: 'boolean',
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
          loop(item, `${prefix}${key}.`);
        }
      });
    }
    loop(item.mappings);
  });
  return _.sortBy(_.union(fields));
}

export interface Field {
  name: string;
  type: string;
}

export function mappingsToFullFields(
  mappings: Mappings,
  options: {
    type?: string;
    includeSubFields?: boolean;
  } = {
    includeSubFields: false,
  },
) {
  const fields: Field[] = [];
  _.forEach(mappings, (item: any) => {
    function loop(mappings, prefix = '') {
      // mappings?.doc?.properties 为了兼容 6.x 版本接口
      _.forEach(mappings?.doc?.properties || mappings?.properties, (item, key) => {
        if (item.type) {
          if (options.includeSubFields && item.type === 'text' && item.fields) {
            fields.push({
              ...item,
              name: `${prefix}${key}`,
            });
            _.forEach(item.fields, (item, subkey) => {
              if (typeMap[item.type] === options?.type || !options?.type) {
                fields.push({
                  ...item,
                  name: `${prefix}${key}.${subkey}`,
                });
              }
            });
          } else if (typeMap[item.type] === options?.type || !options?.type) {
            fields.push({
              ...item,
              type: item.type === 'keyword' ? 'string' : item.type,
              name: `${prefix}${key}`,
            });
            if (options.includeSubFields && item.type === 'keyword') {
              fields.push({
                ...item,
                name: `${prefix}${key}.keyword`,
              });
            }
          }
        } else if (item.properties) {
          loop(item, `${prefix}${key}.`);
        }
      });
    }
    loop(item.mappings);
  });
  return _.sortBy(_.unionBy(fields, 'name'), 'name');
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

export interface Filter {
  key: string;
  value: string;
  operator: 'is' | 'is not';
}

export function dslBuilder(params: {
  index: string;
  date_field: string;
  start: number;
  end: number;
  filters?: Filter[];
  query_string?: string;
  limit?: number;
  order?: string;
  orderField?: string;
  fields?: string[];
  _source?: boolean;
  date_histogram?: {
    interval: string;
    intervalkey: string;
  };
}) {
  const header = {
    search_type: 'query_then_fetch',
    ignore_unavailable: true,
    index: params.index,
  };
  const body: any = {
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
  };
  if (params.limit) {
    body.size = params.limit;
  }
  if (params.order && params.orderField) {
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
    body.fields = params.fields;
  }
  if (_.isArray(params.filters)) {
    _.forEach(params.filters, (item) => {
      if (item.operator === 'is') {
        body.query.bool.filter.push({
          match_phrase: {
            [item.key]: item.value,
          },
        });
      } else if (item.operator === 'is not') {
        body.query.bool.must_not.push({
          match_phrase: {
            [item.key]: item.value,
          },
        });
      }
    });
  }
  if (params.query_string) {
    body.query.bool.filter.push({
      query_string: {
        analyze_wildcard: true,
        query: params.query_string || '*',
      },
    });
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
