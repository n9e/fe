import _ from 'lodash';

import { DASHBOARD_DATASOURCE_CATES } from '@/pages/dashboard/Renderer/datasource/registry';
import type { LegacyDashboard, LegacyPanel } from '@/pages/dashboard/Detail/utils/dashboardMigrator';

/** cloudwatch 面板默认查询项（对应 src/plus/datasource/cloudwatch/constants.ts 的 DASHBOARD_QUERY_ITEM_DEFAULT_VALUE） */
const CLOUDWATCH_QUERY_ITEM = {
  query_type: 'metric_search',
  statistic: 'Average',
  match_exact: false,
  metric_editor_mode: 0,
  return_data: true,
} as const;

/**
 * 每种受支持数据源 cate 的最小合法「老版本 3.4.0」target。
 * 旧形态：target 无 refId / kind / datasource / resultType，数据源挂在 panel 级。
 * 覆盖 registry.ts 中 DASHBOARD_DATASOURCE_CATES 的全部 22 个 cate。
 */
export const LEGACY_TARGET_BY_CATE = {
  prometheus: [{ expr: 'up' }],
  elasticsearch: [{ query: { index: 'logs-*', date_field: '@timestamp', syntax: 'kuery', values: [{ func: 'count' }, { func: 'avg', field: 'duration' }] } }],
  opensearch: [{ query: { index: 'logs-*', date_field: '@timestamp', syntax: 'kuery', values: [{ func: 'count' }, { func: 'avg', field: 'duration' }] } }],
  iotdb: [{ query: { query: 'SELECT time, value FROM root.test' } }],
  tdengine: [{ query: { query: 'SELECT _wstart, avg(value) FROM meters' } }],
  ck: [{ query: { query: 'SELECT toDateTime(ts) AS time, value FROM metrics' } }],
  mysql: [{ query: { query: 'SELECT ts, value, host FROM service_qps', keys: { valueKey: ['value', 'count'], labelKey: ['host'], timeKey: 'ts' } } }],
  pgsql: [{ query: { sql: 'SELECT ts, value, host FROM service_qps' } }],
  doris: [{ query: { sql: 'SELECT ts, value, host FROM service_qps' } }],
  'aliyun-sls': [
    {
      query: {
        project: 'n9e-prod',
        logstore: 'app-access',
        query: '(request_method:GET or request_method:POST) and status in [200 299]',
        mode: 'timeSeries',
        power_sql: false,
        time_series: true,
        removeFirstAndLastPoints: false,
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      },
    },
  ],
  'tencent-cls': [
    {
      query: {
        logset_id: 'cls-8f3c2b',
        topic_id: 'topic-app',
        query: 'status:200 | select count(*) as cnt',
        mode: 'timeSeries',
        time_series: true,
        removeFirstAndLastPoints: false,
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      },
    },
  ],
  'volc-tls': [
    {
      query: {
        project: 'volc-prod',
        topic: 'nginx-log',
        query: 'status:200',
        mode: 'timeSeries',
        removeFirstAndLastPoints: false,
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      },
    },
  ],
  'huawei-lts': [
    {
      query: {
        group_id: 'lts-group-1',
        stream_id: 'lts-stream-1',
        query: 'status:200',
        mode: 'timeSeries',
        removeFirstAndLastPoints: false,
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      },
    },
  ],
  'bce-bls': [
    {
      query: {
        project: 'bce-prod',
        logstore: 'bls-log',
        logstream: 'bls-stream',
        query: 'status:200',
        mode: 'timeSeries',
        values: [{ func: 'count' }],
        date_field: '@timestamp',
        interval: 1,
        interval_unit: 'min',
      },
    },
  ],
  cloudwatchlogs: [{ query: { region: 'us-east-1', log_group_names: ['app'], query_string: 'fields @message', query_language: 'CWLI' } }],
  oracle: [{ query: { sql: 'SELECT ts, value FROM service_qps' } }],
  sqlserver: [{ query: { sql: 'SELECT ts, value FROM service_qps' } }],
  redshift: [{ query: { sql: 'SELECT ts, value FROM service_qps' } }],
  influxdb: [{ query: { sql: 'SELECT mean("value") FROM "cpu" GROUP BY time(1m)' } }],
  zabbix: [{ query: { mode: 'timeseries', subMode: 'metrics' } }],
  cloudwatch: [{ queries: [CLOUDWATCH_QUERY_ITEM] }],
  gcm: [{ query: { query_type: 'builder' } }],
} as const;

/**
 * 日志类 cate 的「原始日志」变体（期望迁移后 resultType 推断为 logs）。
 * ES/opensearch 用 values[].func === 'rawData'，其余用 query.mode === 'raw'。
 */
export const LEGACY_LOGS_TARGET_BY_CATE = {
  elasticsearch: [{ query: { index: 'logs-*', date_field: '@timestamp', syntax: 'kuery', values: [{ func: 'rawData' }] } }],
  opensearch: [{ query: { index: 'logs-*', date_field: '@timestamp', values: [{ func: 'rawData' }] } }],
  ck: [{ query: { query: 'SELECT * FROM logs', mode: 'raw' } }],
  mysql: [{ query: { query: 'SELECT * FROM logs', mode: 'raw' } }],
  pgsql: [{ query: { sql: 'SELECT * FROM logs', mode: 'raw' } }],
  doris: [{ query: { sql: 'SELECT * FROM logs', mode: 'raw' } }],
  oracle: [{ query: { sql: 'SELECT * FROM logs', mode: 'raw' } }],
  sqlserver: [{ query: { sql: 'SELECT * FROM logs', mode: 'raw' } }],
  redshift: [{ query: { sql: 'SELECT * FROM logs', mode: 'raw' } }],
  'aliyun-sls': [{ query: { project: 'n9e-prod', logstore: 'app-access', query: 'status in [400 599]', mode: 'raw' } }],
  'tencent-cls': [{ query: { logset_id: 'cls-8f3c2b', topic_id: 'topic-app', query: 'status:500', mode: 'raw' } }],
  'volc-tls': [{ query: { project: 'volc-prod', topic: 'nginx-log', query: 'status:500', mode: 'raw' } }],
  'huawei-lts': [{ query: { group_id: 'lts-group-1', stream_id: 'lts-stream-1', query: 'status:500', mode: 'raw' } }],
  'bce-bls': [{ query: { project: 'bce-prod', logstore: 'bls-log', logstream: 'bls-stream', query: 'status:500', mode: 'raw' } }],
  cloudwatchlogs: [{ query: { region: 'us-east-1', log_group_names: ['app'], query_string: 'fields @message', mode: 'raw' } }],
} as const;

export interface LegacyPanelSpec {
  cate: string;
  panelType: 'timeseries' | 'tableNG';
  datasourceValue: number;
  targets: ReadonlyArray<unknown>;
}

/** 把老版本 target 组装为 3.4.0 面板（panel 级 datasource，target 保持旧形态） */
export function buildLegacyPanel(spec: LegacyPanelSpec): LegacyPanel {
  return {
    id: `panel-${spec.cate}`,
    version: '3.4.0',
    type: spec.panelType,
    datasourceCate: spec.cate,
    datasourceValue: spec.datasourceValue,
    targets: spec.targets.map((target) => _.cloneDeep(target)) as LegacyPanel['targets'],
    custom: {},
    options: {},
  } as LegacyPanel;
}

/** 把老版本 target 组装为 3.4.0 dashboard（单面板） */
export function buildLegacyDashboard(spec: LegacyPanelSpec): LegacyDashboard {
  return {
    version: '3.4.0',
    panels: [buildLegacyPanel(spec)],
  };
}

const buildSpecs = (targetsByCate: Record<string, ReadonlyArray<unknown>>, panelType: 'timeseries' | 'tableNG') => {
  const specs: Record<string, LegacyPanelSpec> = {};
  DASHBOARD_DATASOURCE_CATES.forEach((cate, index) => {
    const targets = targetsByCate[cate];
    if (targets) {
      specs[cate] = { cate, panelType, datasourceValue: index + 1, targets };
    }
  });
  return specs;
};

/** 全部 22 个 cate 的时序面板规格（datasourceValue 取 cate 在注册表数组中的序号，稳定不随手写漂移） */
export const legacyPanelSpecByCate = buildSpecs(LEGACY_TARGET_BY_CATE, 'timeseries');

/** 15 个日志类 cate 的 raw 面板规格 */
export const legacyLogsPanelSpecByCate = buildSpecs(LEGACY_LOGS_TARGET_BY_CATE, 'timeseries');

export const catesUnderTest = [...DASHBOARD_DATASOURCE_CATES];

export const logsCatesUnderTest = Object.keys(legacyLogsPanelSpecByCate).sort();
