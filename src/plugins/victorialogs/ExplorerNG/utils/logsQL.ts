import _ from 'lodash';

import { VictoriaLogsAggregation, VictoriaLogsFilter, VictoriaLogsMetricBuilderState, VictoriaLogsOrderBy, VictoriaLogsRawBuilderState } from '../types';

const AGGREGATION_PIPE_NAMES = ['stats', 'uniq', 'rate', 'histogram'];
const RAW_EXPLORER_COMPATIBLE_PIPE_NAMES = ['filter', 'extract', 'replace', 'json', 'pack_json', 'unpack_json'];

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
    valueKey: _.compact(_.map(builder?.aggregations || [], getAggregationAlias)),
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
  if (_.isEmpty(aggregations)) return baseQuery;
  const groupBy = _.filter(builder?.groupBy || [], Boolean);
  const statsPipe = `stats${_.isEmpty(groupBy) ? '' : ` by (${_.join(groupBy, ', ')})`} ${_.join(aggregations, ', ')}`;
  const pipes = [statsPipe, renderOrderBy(builder?.orderBy)];
  if (builder?.limit) {
    pipes.push(`limit ${builder.limit}`);
  }
  return joinPipes([baseQuery, ..._.compact(pipes)]);
}
