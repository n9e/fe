import type { ReferenceData } from '../fixture';
import type { AlertRuleConfig, NormalizedAlertRuleConfig } from './types';

const MATCH_TYPE_LABEL_MAP: Record<number, string> = {
  0: '精确匹配',
  1: '模糊匹配',
  2: '全部数据源',
};

const OP_LABEL_MAP: Record<string, string> = {
  in: '包含',
  'not in': '不包含',
};

const RULE_VERSION_LABEL_MAP: Record<string, string> = {
  v1: '普通模式',
  v2: '高级模式',
};

const SEVERITY_LABEL_MAP: Record<number, string> = {
  1: '一级报警（Critical）',
  2: '二级报警（Warning）',
  3: '三级报警（Info）',
};

const CATE_LABEL_MAP: Record<string, string> = {
  prometheus: 'Prometheus',
  loki: 'Loki',
  elasticsearch: 'Elasticsearch',
  opensearch: 'OpenSearch',
  tdengine: 'TDengine',
  ck: 'ClickHouse',
  mysql: 'MySQL',
  pgsql: 'PostgreSQL',
  doris: 'Doris',
  victorialogs: 'VictoriaLogs',
  'aliyun-sls': '阿里云 SLS',
  'tencent-cls': '腾讯云 CLS',
  'volc-tls': '火山引擎 TLS',
  'huawei-lts': '华为云 LTS',
  'bce-bls': '百度云 BLS',
  cloudwatchlogs: 'CloudWatch Logs',
  gcm: 'Google Cloud Monitoring',
  cloudwatch: 'CloudWatch',
  oracle: 'Oracle',
  sqlserver: 'SQL Server',
  redshift: 'Redshift',
  influxdb: 'InfluxDB',
};

function requiredMapValue<T extends string | number>(map: Record<string, string> | Record<number, string>, key: T, fieldName: string) {
  const value = (map as Record<string, string>)[String(key)];
  if (!value) {
    throw new Error(`Missing reference data for ${fieldName}: ${String(key)}`);
  }
  return value;
}

function getCateName(config: AlertRuleConfig, refs: ReferenceData) {
  const datasource = refs.datasources.find((item) => item.plugin_type === config.cate);
  return CATE_LABEL_MAP[config.cate] || datasource?.plugin_type_name || config.cate;
}

function isDefaultEffectiveConfig(config: AlertRuleConfig) {
  return (
    config.time_zone === 'Local' &&
    config.enable_in_bg === 0 &&
    JSON.stringify(config.enable_days_of_weeks) === JSON.stringify([['0', '1', '2', '3', '4', '5', '6']]) &&
    JSON.stringify(config.enable_stimes) === JSON.stringify(['00:00']) &&
    JSON.stringify(config.enable_etimes) === JSON.stringify(['00:00'])
  );
}

function isDefaultNotifyConfig(config: AlertRuleConfig) {
  return (
    config.notify_version === 1 &&
    config.notify_recovered === 1 &&
    config.recover_duration === 0 &&
    config.notify_repeat_step === 60 &&
    config.notify_max_number === 0 &&
    config.notify_rule_ids.length === 0
  );
}

function getSeverityName(severity: number | undefined, fieldName: string) {
  if (severity === undefined) return undefined;
  return requiredMapValue(SEVERITY_LABEL_MAP, severity, fieldName);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlainObject);
}

function normalizeQuery(query: Record<string, unknown>, index: number) {
  return {
    ...query,
    promQl: typeof query.prom_ql === 'string' ? query.prom_ql : undefined,
    severityName: getSeverityName(typeof query.severity === 'number' ? query.severity : undefined, `rule_config.queries[${index}].severity`),
  };
}

function normalizeTrigger(trigger: Record<string, unknown>, index: number) {
  return {
    ...trigger,
    severityName: getSeverityName(typeof trigger.severity === 'number' ? trigger.severity : undefined, `rule_config.triggers[${index}].severity`),
  };
}

export function normalizeAlertRuleForUi(config: AlertRuleConfig, refs: ReferenceData): NormalizedAlertRuleConfig {
  const ruleVersion = typeof config.rule_config.version === 'string' ? config.rule_config.version : undefined;

  return {
    name: `${config.name}-${Date.now().toString(36)}`,
    note: config.note,
    groupName: requiredMapValue(refs.busiGroupNameMap, config.group_id, 'group_id'),
    cate: config.cate,
    cateName: getCateName(config, refs),
    ruleVersionName: ruleVersion ? requiredMapValue(RULE_VERSION_LABEL_MAP, ruleVersion, 'rule_config.version') : undefined,
    queryHandlerKey: config.cate,
    datasourceQueries: config.datasource_queries.map((query) => ({
      matchTypeName: requiredMapValue(MATCH_TYPE_LABEL_MAP, query.match_type, 'datasource_queries.match_type'),
      opName: requiredMapValue(OP_LABEL_MAP, query.op, 'datasource_queries.op'),
      datasourceNames: (query.values || []).map((id) => requiredMapValue(refs.datasourceNameMap, id, 'datasource_queries.values')),
    })),
    queries: toRecordArray(config.rule_config.queries).map(normalizeQuery),
    triggers: toRecordArray(config.rule_config.triggers).map(normalizeTrigger),
    ruleConfig: config.rule_config,
    promForDuration: config.prom_for_duration,
    cronPattern: config.cron_pattern,
    effectiveIsDefault: isDefaultEffectiveConfig(config),
    notifyIsDefault: isDefaultNotifyConfig(config),
    notifyRuleNames: config.notify_rule_ids.map((id) => requiredMapValue(refs.notificationRuleNameMap, id, 'notify_rule_ids')),
    notifyGroupNames: config.notify_groups.map((id) => requiredMapValue(refs.teamNameMap, Number(id), 'notify_groups')),
    notifyChannelLabels: config.notify_channels.map((key) => requiredMapValue(refs.notifyChannelLabelMap, key, 'notify_channels')),
  };
}

export function buildExpectedAlertRule(config: AlertRuleConfig, uiConfig: NormalizedAlertRuleConfig) {
  const expected = JSON.parse(JSON.stringify(config)) as AlertRuleConfig;
  expected.name = uiConfig.name;
  delete (expected as Partial<AlertRuleConfig>).datasource_ids;
  if (expected.cate === 'prometheus' && expected.rule_config?.version === 'v1') {
    expected.rule_config.queries = toRecordArray(expected.rule_config.queries).map((query) => {
      const { ref, ...persistedQuery } = query;
      return persistedQuery;
    });
  }
  if (expected.cate !== 'prometheus') {
    expected.prom_for_duration = 0;
  }
  if (expected.extra_config?.network_device_config === null) {
    delete expected.extra_config.network_device_config;
  }
  return expected;
}
