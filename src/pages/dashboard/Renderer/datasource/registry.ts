import _ from 'lodash';

import type { ITarget, JsonObject, JsonValue } from '@/pages/dashboard/types';

import type { DashboardQueryResultType } from './types';

export const DASHBOARD_DATASOURCE_CATES = [
  'prometheus',
  'elasticsearch',
  'opensearch',
  'iotdb',
  'tdengine',
  'ck',
  'mysql',
  'pgsql',
  'doris',
  'aliyun-sls',
  'tencent-cls',
  'volc-tls',
  'huawei-lts',
  'bce-bls',
  'cloudwatchlogs',
  'oracle',
  'sqlserver',
  'redshift',
  'influxdb',
  'zabbix',
  'cloudwatch',
  'gcm',
] as const;

type DashboardDatasourceCate = (typeof DASHBOARD_DATASOURCE_CATES)[number];

export const DASHBOARD_TARGET_META_FIELDS = [
  'refId',
  'kind',
  '__mode__',
  'datasource',
  'resultType',
  'expression',
  'query',
  'queries',
  'hide',
  'legend',
  'legendFormat',
  'time',
  'maxDataPoints',
] as const;

const LOG_CAPABLE_DATASOURCES = new Set<string>([
  'elasticsearch',
  'opensearch',
  'ck',
  'mysql',
  'pgsql',
  'doris',
  'oracle',
  'sqlserver',
  'redshift',
  'aliyun-sls',
  'tencent-cls',
  'volc-tls',
  'huawei-lts',
  'bce-bls',
  'cloudwatchlogs',
]);

const SQL_QUERY_DATASOURCE_CATES = new Set<DashboardDatasourceCate>(['ck', 'mysql', 'doris']);

export interface DashboardDatasourceDefinition {
  cate: string;
  resultTypes: DashboardQueryResultType[];
  defaultTarget?: Partial<ITarget>;
  isQueryReady: (target: ITarget) => boolean;
  serializeTarget: (target: ITarget) => JsonObject;
}

const DEFAULT_TARGETS: Partial<Record<(typeof DASHBOARD_DATASOURCE_CATES)[number], Partial<ITarget>>> = {
  elasticsearch: {
    query: {
      filter_language: 'lucene',
    },
  },
  opensearch: {
    query: {
      filter_language: 'lucene',
    },
  },
  'aliyun-sls': {
    query: {
      mode: 'timeSeries',
      power_sql: false,
      time_series: true,
      removeFirstAndLastPoints: false,
    },
  },
  'tencent-cls': {
    query: {
      mode: 'timeSeries',
      time_series: true,
      removeFirstAndLastPoints: false,
    },
  },
  'volc-tls': {
    query: {
      mode: 'timeSeries',
      removeFirstAndLastPoints: false,
    },
  },
  'huawei-lts': {
    query: {
      mode: 'timeSeries',
      removeFirstAndLastPoints: false,
    },
  },
  'bce-bls': {
    query: {
      mode: 'timeSeries',
    },
  },
  cloudwatchlogs: {
    query: {
      mode: 'timeSeries',
      query_language: 'CWLI',
    },
  },
};

const hasQueryText = (target: ITarget, key: 'query' | 'sql' = 'query') => {
  const value = target.query?.[key];
  return typeof value === 'string' && value.trim().length > 0;
};

const hasConfiguredValue = (value: unknown) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
};

const hasZabbixFilter = (target: ITarget, key: 'group' | 'host' | 'item') => {
  const value = target.query?.[key];
  return value !== null && typeof value === 'object' && !Array.isArray(value) && 'filter' in value && hasConfiguredValue(value.filter);
};

const hasESValueKey = (keys: unknown) => {
  if (!keys || typeof keys !== 'object' || Array.isArray(keys) || !('valueKey' in keys)) return false;
  const valueKey = keys.valueKey;
  return Array.isArray(valueKey) ? valueKey.length > 0 : typeof valueKey === 'string' && valueKey.trim().length > 0;
};

/**
 * The SQL editors for MySQL, ClickHouse and Doris keep their text in `query`
 * so they can share the log-query input component. Their datasource adapters,
 * however, decode the native `sql` field. Doris is the exception only when
 * the legacy query-builder strategy is explicitly selected: that branch is a
 * log-search query and its native field remains `query`.
 */
function serializeSQLQuery(payload: JsonObject, cate: DashboardDatasourceCate) {
  const isDorisLogQuery = cate === 'doris' && payload.queryStrategy === 'query';
  if (!isDorisLogQuery && typeof payload.query === 'string') {
    payload.sql = payload.query;
    delete payload.query;
  }
}

// 沿用旧版各数据源查询函数的静默短路条件：未就绪的 target 不进入 query-batch，且不触发表单校验提示。
const QUERY_READINESS: Partial<Record<DashboardDatasourceCate, (target: ITarget) => boolean>> = {
  elasticsearch: (target) => {
    const query = target.query ?? {};
    if (query.syntax === 'sql') {
      if (query.mode === 'raw') return Boolean(typeof query.sql === 'string' && query.sql.trim());
      return Boolean(typeof query.sql === 'string' && query.sql.trim() && hasESValueKey(query.keys));
    }
    return query.index_type === 'index_pattern' ? Boolean(query.index_pattern) : Boolean(query.index && query.date_field);
  },
  opensearch: (target) => {
    const query = target.query ?? {};
    return query.index_type === 'index_pattern' ? Boolean(query.index_pattern) : Boolean(query.index && query.date_field);
  },
  iotdb: (target) => hasQueryText(target),
  tdengine: (target) => hasQueryText(target),
  ck: (target) => hasQueryText(target),
  mysql: (target) => hasQueryText(target),
  // Doris 的新旧面板分别把 SQL 保存到 query.query / query.sql；两者均为空时
  // 不应触发 query-batch。queryStrategy === 'query' 的日志查询同样需要查询文本。
  doris: (target) => hasQueryText(target) || hasQueryText(target, 'sql'),
  pgsql: (target) => hasQueryText(target, 'sql'),
  oracle: (target) => hasQueryText(target, 'sql'),
  sqlserver: (target) => hasQueryText(target, 'sql'),
  redshift: (target) => hasQueryText(target, 'sql'),
  influxdb: (target) => hasQueryText(target, 'sql'),
  cloudwatchlogs: (target) => Boolean(target.query?.region && target.query?.log_group_names && target.query?.query_string),
  'aliyun-sls': (target) => Boolean(target.query?.project && target.query?.logstore && target.query?.mode),
  // 以下日志数据源的旧执行器均会在未选定日志主题/流时静默跳过；统一 query-batch
  // 也保持相同前置条件，避免刚选择数据源即发送空查询。
  'tencent-cls': (target) => Boolean(target.query?.topic_id),
  'volc-tls': (target) => Boolean(target.query?.topic_id || target.query?.topic),
  'huawei-lts': (target) => Boolean(target.query?.stream_id),
  'bce-bls': (target) => Boolean(target.query?.logstore),
  zabbix: (target) => {
    const query = target.query ?? {};
    if (query.mode === 'raw') return hasConfiguredValue(query.method);
    if (query.mode === 'timeseries' && query.subMode === 'itemIDs') return hasConfiguredValue(query.itemids);
    return hasZabbixFilter(target, 'group') && hasZabbixFilter(target, 'host') && hasZabbixFilter(target, 'item');
  },
  cloudwatch: (target) =>
    Array.isArray(target.queries) &&
    target.queries.some((query) => {
      if (query.query_type === 'metric_insights' || query.metric_editor_mode === 1) return hasConfiguredValue(query.expression);
      return hasConfiguredValue(query.namespace) && hasConfiguredValue(query.metric_name);
    }),
  gcm: (target) => {
    const query = target.query ?? {};
    if (query.query_type === 'promql') return hasConfiguredValue(query.promql);
    return hasConfiguredValue(query.project_id) && hasConfiguredValue(query.service) && hasConfiguredValue(query.metric_type);
  },
};

const serializeTarget = (target: ITarget, cate: DashboardDatasourceCate) => {
  const payload: JsonObject = {
    ...(target.query && typeof target.query === 'object' ? _.cloneDeep(target.query) : {}),
    ..._.omit(target, DASHBOARD_TARGET_META_FIELDS),
  };
  if (payload.keys && typeof payload.keys === 'object' && !Array.isArray(payload.keys)) {
    payload.keys = Object.entries(payload.keys).reduce<Record<string, unknown>>((keys, [key, value]) => {
      keys[key] = Array.isArray(value) ? value.join(' ') : value;
      return keys;
    }, {}) as unknown as JsonValue;
  }
  if (target.queries) {
    payload.queries = _.cloneDeep(target.queries);
  }
  // Builder configuration is editor state used to reopen the builder. The
  // datasource query APIs only need the generated query fields.
  delete payload.builderConfig;
  if (SQL_QUERY_DATASOURCE_CATES.has(cate)) {
    serializeSQLQuery(payload, cate);
  }
  if (_.includes(['elasticsearch', 'opensearch'], cate)) {
    if (payload.syntax !== 'sql') {
      payload.filter_language = payload.filter_language ?? (payload.syntax === 'kuery' || payload.syntax === 'kql' ? 'kql' : 'lucene');
      delete payload.syntax;
    }
  }
  return payload;
};

const dashboardDatasourceDefinitions = DASHBOARD_DATASOURCE_CATES.reduce<Record<string, DashboardDatasourceDefinition>>((registry, cate) => {
  registry[cate] = {
    cate,
    resultTypes: LOG_CAPABLE_DATASOURCES.has(cate) ? ['time_series', 'logs'] : ['time_series'],
    defaultTarget: DEFAULT_TARGETS[cate],
    isQueryReady: QUERY_READINESS[cate] ?? (() => true),
    serializeTarget: (target) => serializeTarget(target, cate),
  };
  return registry;
}, {});

export function getDashboardDatasourceDefinition(cate: string) {
  return dashboardDatasourceDefinitions[cate];
}

export function getDashboardDatasourceCates() {
  return Object.keys(dashboardDatasourceDefinitions);
}

export default dashboardDatasourceDefinitions;
