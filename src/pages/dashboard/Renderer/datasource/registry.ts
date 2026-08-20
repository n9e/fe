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

// 沿用旧版各数据源查询函数的静默短路条件：未就绪的 target 不进入 query-batch，且不触发表单校验提示。
const QUERY_READINESS: Partial<Record<(typeof DASHBOARD_DATASOURCE_CATES)[number], (target: ITarget) => boolean>> = {
  elasticsearch: (target) => {
    const query = target.query ?? {};
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
  pgsql: (target) => hasQueryText(target, 'sql'),
  oracle: (target) => hasQueryText(target, 'sql'),
  sqlserver: (target) => hasQueryText(target, 'sql'),
  redshift: (target) => hasQueryText(target, 'sql'),
  influxdb: (target) => hasQueryText(target, 'sql'),
  cloudwatchlogs: (target) => Boolean(target.query?.region && target.query?.log_group_names && target.query?.query_string),
  'aliyun-sls': (target) => Boolean(target.query?.project && target.query?.logstore && target.query?.mode),
};

const serializeTarget = (target: ITarget, cate: string) => {
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
  if (_.includes(['elasticsearch', 'opensearch'], cate)) {
    payload.filter_language = payload.filter_language ?? (payload.syntax === 'kuery' || payload.syntax === 'kql' ? 'kql' : 'lucene');
    delete payload.syntax;
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
