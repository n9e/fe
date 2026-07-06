import _ from 'lodash';

import { VictoriaLogsAggregation, VictoriaLogsFilter, VictoriaLogsMetricBuilderState, VictoriaLogsOrderBy, VictoriaLogsRawBuilderState } from '../types';

const TERMINAL_PIPE_NAMES = ['limit', 'offset', 'sort', 'sort by', 'fields', 'drop_fields', 'head', 'tail', 'sample'];
const AGGREGATION_PIPE_NAMES = ['stats', 'uniq', 'rate', 'histogram'];
const HISTOGRAM_SAFE_PIPE_NAMES = ['filter', 'extract', 'replace', 'json', 'pack_json', 'unpack_json'];
const RAW_EXPLORER_COMPATIBLE_PIPE_NAMES = ['filter', 'extract', 'replace', 'json', 'pack_json', 'unpack_json'];
const FIELD_STATS_SAFE_PIPE_NAMES = ['filter', 'json', 'unpack_json', 'extract'];
const FIELD_MUTATING_PIPE_NAMES = ['rename', 'drop', 'keep', 'fields', 'drop_fields', 'format'];

export type DeriveResult =
  | {
      ok: true;
      derivedQuery: string;
      strippedPipes: string[];
    }
  | {
      ok: false;
      reason: string;
      reasonKey?: string;
      reasonParams?: Record<string, string>;
    };

export function splitLogsQLPipes(input: string) {
  const parts: string[] = [];
  let current = '';
  let quote: '"' | "'" | '`' | undefined;
  let escaped = false;
  let parenDepth = 0;

  _.forEach(input, (char) => {
    if (escaped) {
      current += char;
      escaped = false;
      return;
    }
    if (char === '\\') {
      current += char;
      escaped = true;
      return;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        quote = undefined;
      }
      return;
    }
    if (char === '"' || char === "'" || char === '`') {
      current += char;
      quote = char;
      return;
    }
    if (char === '(') {
      current += char;
      parenDepth += 1;
      return;
    }
    if (char === ')') {
      current += char;
      parenDepth = Math.max(parenDepth - 1, 0);
      return;
    }
    if (char === '|' && parenDepth === 0) {
      parts.push(_.trim(current));
      current = '';
      return;
    }
    current += char;
  });
  parts.push(_.trim(current));
  return _.filter(parts, (item) => item !== '');
}

export function getPipeName(pipe: string) {
  const lower = _.toLower(_.trim(pipe));
  if (_.startsWith(lower, 'sort by')) return 'sort by';
  return _.split(lower, /\s+/, 1)[0];
}

function joinPipes(parts: string[]) {
  return _.join(_.filter(_.map(parts, _.trim), Boolean), ' | ');
}

function isTerminalPipe(pipe: string) {
  return _.includes(TERMINAL_PIPE_NAMES, getPipeName(pipe));
}

function isAggregationPipe(pipe: string) {
  return _.includes(AGGREGATION_PIPE_NAMES, getPipeName(pipe));
}

export function classifyExplorerMode(userQL?: string): 'raw' | 'metric' {
  const parts = splitLogsQLPipes(_.trim(userQL || ''));
  if (parts.length <= 1) return 'raw';

  const tailPipes = _.tail(parts);
  if (_.some(tailPipes, isAggregationPipe)) return 'metric';
  if (_.every(tailPipes, (pipe) => _.includes(RAW_EXPLORER_COMPATIBLE_PIPE_NAMES, getPipeName(pipe)))) {
    return 'raw';
  }
  return 'metric';
}

// Kept for field TopN derivation only; raw histogram uses the visible query directly.
export function deriveAggregationBase(userQL?: string): DeriveResult {
  const trimmed = _.trim(userQL || '*');
  if (!trimmed) {
    return { ok: false, reason: '查询条件为空，无法生成日志分布', reasonKey: 'explorer.histogram_unavailable.empty_query' };
  }
  const parts = splitLogsQLPipes(trimmed);
  if (parts.length === 0) {
    return { ok: false, reason: '查询条件为空，无法生成日志分布', reasonKey: 'explorer.histogram_unavailable.empty_query' };
  }
  const strippedPipes: string[] = [];
  const mutableParts = [...parts];

  while (mutableParts.length > 1 && isTerminalPipe(_.last(mutableParts)!)) {
    strippedPipes.unshift(mutableParts.pop()!);
  }

  if (_.some(_.tail(mutableParts), isAggregationPipe)) {
    return { ok: false, reason: '当前查询包含聚合 pipe，无法生成日志分布', reasonKey: 'explorer.histogram_unavailable.aggregation_pipe' };
  }

  const unsupportedPipe = _.find(_.tail(mutableParts), (pipe) => {
    return !_.includes(HISTOGRAM_SAFE_PIPE_NAMES, getPipeName(pipe));
  });
  if (unsupportedPipe) {
    return {
      ok: false,
      reason: `当前查询包含暂不支持的 pipe：${unsupportedPipe}`,
      reasonKey: 'explorer.histogram_unavailable.unsupported_pipe',
      reasonParams: { pipe: unsupportedPipe },
    };
  }

  const derivedQuery = joinPipes(mutableParts);
  if (!derivedQuery) {
    return { ok: false, reason: '处理后的查询为空，无法生成日志分布', reasonKey: 'explorer.histogram_unavailable.empty_derived_query' };
  }

  return {
    ok: true,
    derivedQuery,
    strippedPipes,
  };
}

export function deriveFieldStatsBase(userQL: string | undefined, field: string): DeriveResult {
  const result = deriveAggregationBase(userQL);
  if (!result.ok) return result;

  const parts = splitLogsQLPipes(result.derivedQuery);
  const unsupportedPipe = _.find(_.tail(parts), (pipe) => {
    const pipeName = getPipeName(pipe);
    return _.includes(FIELD_MUTATING_PIPE_NAMES, pipeName) || !_.includes(FIELD_STATS_SAFE_PIPE_NAMES, pipeName);
  });
  if (unsupportedPipe) {
    return { ok: false, reason: `字段 ${field} 的 TopN 暂不支持当前 pipe：${unsupportedPipe}` };
  }
  return result;
}

function escapeValue(value: any) {
  if (_.isNumber(value) || _.isBoolean(value)) return String(value);
  const str = _.toString(value);
  if (/^[A-Za-z0-9_.:@/-]+$/.test(str)) return str;
  return `"${_.replace(str, /"/g, '\\"')}"`;
}

function renderFilter(filter: VictoriaLogsFilter) {
  const field = _.trim(filter.field);
  if (!field) return '';
  const value = filter.value;

  switch (filter.op) {
    case 'eq':
      return `${field}:${escapeValue(value)}`;
    case 'neq':
      return `${field}:!${escapeValue(value)}`;
    case 'contains':
      return `${field}:*${escapeValue(value)}*`;
    case 'not_contains':
      return `${field}:!*${escapeValue(value)}*`;
    case 'regex':
      return `${field}:~${escapeValue(value)}`;
    case 'not_regex':
      return `${field}:!~${escapeValue(value)}`;
    case 'gt':
      return `${field}:>${escapeValue(value)}`;
    case 'gte':
      return `${field}:>=${escapeValue(value)}`;
    case 'lt':
      return `${field}:<${escapeValue(value)}`;
    case 'lte':
      return `${field}:<=${escapeValue(value)}`;
    case 'exists':
      return `${field}:*`;
    case 'not_exists':
      return `${field}:!*`;
    default:
      return '';
  }
}

export function renderLogsQL(builder?: VictoriaLogsRawBuilderState) {
  const filters = _.compact(_.map(builder?.filters || [], renderFilter));
  if (_.isEmpty(filters)) return '*';
  return _.join(filters, ' ');
}

function renderAggregation(aggregation: VictoriaLogsAggregation) {
  const alias = _.trim(aggregation.alias) || aggregation.func;
  if (aggregation.func === 'count') return `count() as ${alias || 'count'}`;
  if (aggregation.func === 'quantile') return `quantile(${aggregation.params?.quantile ?? 0.99}, ${aggregation.field}) as ${alias}`;
  if (!aggregation.field) return '';
  return `${aggregation.func}(${aggregation.field}) as ${alias}`;
}

function getAggregationAlias(aggregation: VictoriaLogsAggregation) {
  return _.trim(aggregation.alias) || aggregation.func || 'value';
}

export function inferMetricTimeseriesKeys(builder?: VictoriaLogsMetricBuilderState) {
  return {
    valueKey: _.isEmpty(builder?.aggregations) ? ['count'] : _.compact(_.map(builder?.aggregations || [], getAggregationAlias)),
    labelKey: _.compact(builder?.groupBy || []),
  };
}

export function inferMetricTimeseriesKeysFromQuery(query?: string) {
  const parts = splitLogsQLPipes(query || '');
  const statsPipe = _.find(parts, (part) => getPipeName(part) === 'stats');
  if (!statsPipe) {
    return {
      valueKey: [] as string[],
      labelKey: [] as string[],
    };
  }

  const labelMatch = statsPipe.match(/\bstats\s+by\s*\(([^)]*)\)/i);
  const labelKey = labelMatch ? _.compact(_.map(_.split(labelMatch[1], ','), (item) => _.trim(item))) : [];
  const valueKey = _.uniq(
    _.compact(
      _.map([...statsPipe.matchAll(/\bas\s+([A-Za-z_][A-Za-z0-9_.]*)/gi)], (match) => {
        return match[1];
      }),
    ),
  );

  if (_.isEmpty(valueKey) && /\bcount\s*\(/i.test(statsPipe)) {
    valueKey.push('count');
  }

  return {
    valueKey,
    labelKey,
  };
}

function renderOrderBy(orderBy?: VictoriaLogsOrderBy[]) {
  const items = _.compact(
    _.map(orderBy || [], (item) => {
      if (!item.field) return '';
      return `${item.field} ${item.direction || 'desc'}`;
    }),
  );
  if (_.isEmpty(items)) return '';
  return `sort by (${_.join(items, ', ')})`;
}

export function renderMetricLogsQL(builder?: VictoriaLogsMetricBuilderState) {
  const baseQuery = renderLogsQL({ filters: builder?.filters || [] });
  const aggregations = _.compact(_.map(builder?.aggregations || [], renderAggregation));
  const groupBy = _.filter(builder?.groupBy || [], Boolean);
  const statsPipe = `stats${_.isEmpty(groupBy) ? '' : ` by (${_.join(groupBy, ', ')})`} ${_.join(aggregations.length ? aggregations : ['count() as count'], ', ')}`;
  const pipes = [statsPipe, renderOrderBy(builder?.orderBy)];
  if (builder?.limit) {
    pipes.push(`limit ${builder.limit}`);
  }
  return joinPipes([baseQuery, ..._.compact(pipes)]);
}

export function renderFieldStatsQL(derivedQuery: string, field: string, topNumber: number) {
  return joinPipes([derivedQuery, `stats by (${field}) count() as count`, 'sort by (count desc)', `limit ${topNumber}`]);
}

export function renderFieldTotalQL(derivedQuery: string) {
  return joinPipes([derivedQuery, 'stats count() as total']);
}

export function injectTimeRangeFilter(query: string, startISO: string, endISO: string) {
  const parts = splitLogsQLPipes(query);
  const filter = _.trim(parts[0] || '*');
  const timeFilter = `_time:[${startISO},${endISO}]`;
  const nextFilter = filter === '*' ? timeFilter : `${timeFilter} AND (${filter})`;
  return joinPipes([nextFilter, ..._.tail(parts)]);
}
