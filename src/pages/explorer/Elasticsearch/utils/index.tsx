import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import semver from 'semver';
import { buildESQueryFromKuery } from '@fc-components/es-query';
import flatten from '../flatten';
import { getHighlightRequest, getHighlightHtml } from './highlight';
import { basePrefix } from '@/App';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
export function getFieldLabel(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.attrs?.[fieldKey]?.alias || fieldKey;
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
  operator: string;
}

export function dslBuilder(params: {
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
      } else if (item.operator === 'exists') {
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

export function ajustFieldParamValue(field: Field, version: string) {
  if (semver.lt(version, '7.10.0') && field.type === 'text') {
    return `${field.name}.keyword`;
  }
  return field.name;
}
