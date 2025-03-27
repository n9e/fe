import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Popover } from 'antd';
import semver from 'semver';
import purify from 'dompurify';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { buildESQueryFromKuery } from '@fc-components/es-query';
import flatten from '../flatten';
import { getHighlightRequest, getHighlightHtml } from './highlight';
import { basePrefix } from '@/App';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

export function getFieldLabel(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.attrs?.[fieldKey]?.alias || fieldKey;
}

export function getFieldType(fieldKey: string, fieldConfig?: any) {
  return fieldConfig?.formatMap?.[fieldKey]?.type;
}

const handleNav = (link: string, rawValue: object, query: { start: number; end: number }) => {
  const param = new URLSearchParams(link);
  const startMargin = param.get('${__start_time_margin__}');
  const endMargin = param.get('${__end_time_margin__}');
  const startMarginNum = startMargin && !isNaN(Number(startMargin)) ? Number(startMargin) : 0;
  const endMarginNum = endMargin && !isNaN(Number(endMargin)) ? Number(endMargin) : 0;
  let reallink = link
    .replace('${local_protocol}', location.protocol)
    .replace('${local_domain}', location.host)
    .replace('${local_url}', location.origin)
    .replace('${__start_time__}', typeof query.start === 'number' ? String(1000 * query.start + startMarginNum) : '')
    .replace('${__end_time__}', typeof query.end === 'number' ? String(1000 * query.end + endMarginNum) : '');

  if (startMargin) {
    reallink = reallink.replace('&${__start_time_margin__}' + '=' + startMargin, '');
  }
  if (endMargin) {
    reallink = reallink.replace('&${__end_time_margin__}' + '=' + endMargin, '');
  }
  const unReplaceKeyReg = /\$\{(.+?)\}/g;
  reallink = reallink.replace(unReplaceKeyReg, function (a, b) {
    const wholeWord = rawValue[b];
    return wholeWord || _.get(rawValue, b.split('.'));
  });
  window.open(basePrefix + reallink.replace(unReplaceKeyReg, ''), '_blank');
};

export function getFieldValue(fieldKey, fieldValue, fieldConfig: any, rawValue?: { [field: string]: string }, range?: IRawTimeRange) {
  const format = fieldConfig?.formatMap?.[fieldKey];
  if (format && format?.type === 'date' && format?.params?.pattern) {
    return moment(fieldValue).format(format?.params?.pattern);
  }
  if (rawValue && format && format?.type === 'url' && format?.paramsArr?.length > 0) {
    const parsedRange = range ? parseRange(range) : null;
    let start = parsedRange ? moment(parsedRange.start).unix() : 0;
    let end = parsedRange ? moment(parsedRange.end).unix() : 0;
    return (
      <Popover
        placement='right'
        overlayClassName='popover-json'
        content={format?.paramsArr.map((item, i) => (
          <div key={i} style={{ lineHeight: '24px' }}>
            <a onClick={() => handleNav(item.urlTemplate, rawValue, { start, end })}>{item.name}</a>
          </div>
        ))}
      >
        <a
          style={{ textDecoration: 'underline', fontWeight: 'bold' }}
          onClick={() => {
            if (format?.paramsArr.length > 0) {
              handleNav(format?.paramsArr[0].urlTemplate, rawValue, { start, end });
            }
          }}
        >
          {format?.params?.labelTemplate.replace('{{value}}', fieldValue) || fieldValue}
        </a>
      </Popover>
    );
  }
  if (format && format?.type === 'url' && format?.params?.urlTemplate) {
    let realLink = format?.params?.urlTemplate.replace('{{value}}', fieldValue);
    const dataSource = rawValue ? Object.keys(rawValue).map((key) => ({ field: key, value: rawValue[key] })) : [];

    if (dataSource && dataSource.length > 0) {
      dataSource.forEach((item) => {
        realLink = realLink.replace('${' + item.field + '}', item.value);
      });
    }
    return (
      <a target='_blank' href={realLink}>
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

export function ajustFieldParamValue(field: Field, version: string) {
  if (semver.lt(version, '7.10.0') && field.type === 'text') {
    return `${field.name}.keyword`;
  }
  return field.name;
}
