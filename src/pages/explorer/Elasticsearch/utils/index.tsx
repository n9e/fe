import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import purify from 'dompurify';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { buildESQueryFromKuery } from '@fc-components/es-query';
import flatten from '../flatten';
import { getHighlightRequest, getHighlightHtml } from './highlight';

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

export function RenderValue({ value, highlights }: { value: any; highlights: string[] }) {
  const limit = 18;
  const { t } = useTranslation();
  const [expand, setExpand] = useState(false);
  const splitRegex = /\r\n|\n|\r|\\r\\n|\\n|\\r/g;
  const valArr = _.split(value, splitRegex);
  if (typeof value === 'string') {
    if (valArr.length > 1) {
      const lines = !expand ? _.slice(valArr, 0, limit) : valArr;
      return (
        <div style={{ display: 'inline-block', wordBreak: 'break-all' }}>
          {_.map(lines, (v, idx) => {
            return (
              <div key={idx}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(
                      getHighlightHtml(
                        v,
                        _.map(highlights, (item) => {
                          const itemArr = _.split(item, '\n');
                          return itemArr[idx];
                        }),
                      ),
                    ),
                  }}
                />
                {idx === lines.length - 1 && valArr.length > limit && (
                  <a
                    onClick={() => {
                      setExpand(!expand);
                    }}
                    style={{
                      marginLeft: 8,
                    }}
                  >
                    {expand ? t('common:btn.collapse') : t('common:btn.expand')}
                    {expand ? <LeftOutlined /> : <RightOutlined />}
                  </a>
                )}

                <br />
              </div>
            );
          })}
        </div>
      );
    }
    return <div style={{ display: 'inline-block', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: purify.sanitize(getHighlightHtml(value, highlights)) }}></div>;
  }
  return <div style={{ display: 'inline-block', wordBreak: 'break-all' }}>{value}</div>;
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
  syntax?: string; // lucene | kuery
  query_string?: string;
  kuery?: string;
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
  body.track_total_hits = true; //get real hits total
  body.highlight = getHighlightRequest(!!params.shouldHighlight);
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
  if (syntax === 'lucene') {
    body.query.bool.filter.push({
      query_string: {
        analyze_wildcard: true,
        query: params.query_string || '*',
      },
    });
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
