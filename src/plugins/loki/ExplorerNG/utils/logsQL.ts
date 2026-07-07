import _ from 'lodash';

import { LokiLabelMatcher, LokiLineFilter, LokiMetricBuilderState, LokiParsedFieldFilter, LokiRawBuilderState } from '../types';

const METRIC_PATTERNS = [
  /\b(count_over_time|rate|bytes_rate|bytes_over_time|absent_over_time)\s*\(/i,
  /\b(sum_over_time|avg_over_time|min_over_time|max_over_time|quantile_over_time)\s*\(/i,
  /\b(sum|avg|min|max|count)\s+(by|without)\s*\(/i,
  /\b(topk|bottomk)\s*\(/i,
];

function escapeString(value?: string | number) {
  return _.replace(_.toString(value ?? ''), /\\/g, '\\\\').replace(/"/g, '\\"');
}

function isEmptyValue(value: any) {
  return value === undefined || value === null || _.trim(_.toString(value)) === '';
}

function renderLabelMatcher(item: LokiLabelMatcher) {
  const label = _.trim(item.label);
  if (!label || isEmptyValue(item.value)) return '';
  return `${label}${item.op || '='}"${escapeString(item.value)}"`;
}

function renderLineFilter(item: LokiLineFilter) {
  if (isEmptyValue(item.value)) return '';
  return `${item.op || '|='} "${escapeString(item.value)}"`;
}

function renderParser(parser?: LokiRawBuilderState['parser']) {
  if (!parser?.type) return '';
  if (parser.type === 'regexp' || parser.type === 'pattern') {
    return parser.expression ? `| ${parser.type} "${escapeString(parser.expression)}"` : '';
  }
  return `| ${parser.type}`;
}

function renderParsedFieldFilter(item: LokiParsedFieldFilter) {
  const field = _.trim(item.field);
  if (!field || isEmptyValue(item.value)) return '';
  const op = item.op || '=';
  if (op === '>' || op === '>=' || op === '<' || op === '<=') {
    return `| ${field} ${op} ${_.toString(item.value)}`;
  }
  return `| ${field}${op}"${escapeString(item.value)}"`;
}

export function renderRawLogQL(builder?: LokiRawBuilderState) {
  const matchers = _.compact(_.map(builder?.labels || [], renderLabelMatcher));
  const selector = `{${_.join(matchers, ',')}}`;
  const lineFilters = _.compact(_.map(builder?.lineFilters || [], renderLineFilter));
  const parser = renderParser(builder?.parser);
  const parsedFilters = _.compact(_.map(builder?.parsedFieldFilters || [], renderParsedFieldFilter));
  return _.join(_.compact([selector, ...lineFilters, parser, ...parsedFilters]), ' ');
}

function renderRangeExpression(builder?: LokiMetricBuilderState) {
  const raw = renderRawLogQL(builder);
  const range = _.trim(builder?.range || '5m');
  const rangeFunc = builder?.rangeFunc || 'count_over_time';
  const rangeParam = builder?.rangeParam ?? 0.99;
  const unwrapField = _.trim(builder?.unwrapField || '');
  const unwrap = unwrapField ? ` | unwrap ${unwrapField}` : '';
  if (rangeFunc === 'quantile_over_time') {
    return `${rangeFunc}(${rangeParam}, ${raw}${unwrap}[${range}])`;
  }
  return `${rangeFunc}(${raw}${unwrap}[${range}])`;
}

export function renderMetricLogQL(builder?: LokiMetricBuilderState) {
  const expr = renderRangeExpression(builder);
  const vectorAgg = builder?.vectorAgg;
  const groupBy = _.compact(builder?.groupBy || []);
  if (!vectorAgg) return expr;

  const groupClause = _.isEmpty(groupBy) ? '' : ` by (${_.join(groupBy, ',')})`;
  if (vectorAgg === 'topk' || vectorAgg === 'bottomk') {
    return `${vectorAgg}(${builder?.vectorParam || 10}, ${expr})`;
  }
  return `${vectorAgg}${groupClause} (${expr})`;
}

export function renderLogQLByMode(mode: 'raw' | 'metric', builder?: LokiRawBuilderState | LokiMetricBuilderState) {
  return mode === 'metric' ? renderMetricLogQL(builder as LokiMetricBuilderState) : renderRawLogQL(builder as LokiRawBuilderState);
}

export function classifyExplorerMode(userQL?: string): 'raw' | 'metric' {
  const ql = _.trim(userQL || '');
  if (!ql) return 'raw';
  if (_.some(METRIC_PATTERNS, (pattern) => pattern.test(ql))) return 'metric';
  return 'raw';
}
