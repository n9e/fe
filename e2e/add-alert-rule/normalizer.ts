import type { ReferenceData } from './reference-data';
import type { AlertRuleConfig, NormalizedAlertRuleConfig, NormalizedRelabelConfig, NormalizedTimeRange, NormalizedServiceCalConfig } from './types';
import { processAlertRuleFormValuesForE2E, processAlertRuleInitialValuesForE2E } from './form-values';

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
  iotdb: 'IoTDB',
  tdengine: 'TDengine',
  ck: 'ClickHouse',
  mysql: 'MySQL',
  pgsql: 'PostgreSQL',
  doris: 'Doris',
  victorialogs: 'VictoriaLogs',
  'aliyun-sls': '阿里云SLS',
  'tencent-cls': '腾讯云CLS',
  'volc-tls': '火山云TLS',
  'huawei-lts': '华为云LTS',
  'bce-bls': '百度云BLS',
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

function normalizeRelabelConfigs(raw: unknown): NormalizedRelabelConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item: Record<string, unknown>) => ({
    action: String(item.action || ''),
    regex: String(item.regex || ''),
    replacement: String(item.replacement || ''),
    separator: String(item.separator || ';'),
    sourceLabels: Array.isArray(item.source_labels) ? item.source_labels.map(String) : [],
    targetLabel: String(item.target_label || ''),
  }));
}

function normalizeEffectiveTimeRanges(stimes: string[], etimes: string[], daysOfWeeks: string[][]): NormalizedTimeRange[] {
  const count = Math.max(stimes.length, etimes.length, daysOfWeeks.length);
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    start: stimes[i] || '00:00',
    end: etimes[i] || '00:00',
    daysOfWeek: daysOfWeeks[i] || ['0', '1', '2', '3', '4', '5', '6'],
  }));
}

function normalizeServiceCalConfigs(raw: unknown, refs: ReferenceData): NormalizedServiceCalConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((cfg: Record<string, unknown>) => {
    const ids = Array.isArray(cfg.service_cal_ids) ? cfg.service_cal_ids.map(Number) : [];
    const timeRangeRaw = isPlainObject(cfg.time_range) ? (cfg.time_range as Record<string, string>) : {};
    return {
      serviceCalNames: ids.map((id: number) => requiredMapValue(refs.serviceCalNameMap, id, 'extra_config.service_cal_configs.service_cal_ids')),
      timeRange: {
        start: timeRangeRaw.start || '00:00',
        end: timeRangeRaw.end || '00:00',
      },
    };
  });
}

function normalizeAnnotations(raw: unknown) {
  if (!isPlainObject(raw)) return {};
  return Object.entries(raw).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = String(value ?? '');
    return acc;
  }, {});
}

const DELETE_META_KEYS = ['id', 'create_at', 'create_by', 'update_at', 'update_by', 'uuid', 'cur_event_count', 'update_by_nickname'];

function normalizeQuery(query: Record<string, unknown>, index: number, refs: ReferenceData) {
  const indexPattern = typeof query.index_pattern === 'number' ? query.index_pattern : undefined;
  return {
    ...query,
    indexPatternName: indexPattern !== undefined ? requiredMapValue(refs.indexPatternNameMap, indexPattern, `rule_config.queries[${index}].index_pattern`) : undefined,
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
  const formValues = processAlertRuleInitialValuesForE2E(config);
  const ruleVersion = typeof config.rule_config.version === 'string' ? config.rule_config.version : undefined;
  const annotations = normalizeAnnotations(config.annotations);
  const serviceCalConfigs = config.extra_config?.service_cal_configs ? normalizeServiceCalConfigs(config.extra_config.service_cal_configs, refs) : [];

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
      datasourceIds: query.values || [],
    })),
    queries: toRecordArray(formValues.rule_config.queries).map((query, index) => normalizeQuery(query, index, refs)),
    triggers: toRecordArray(config.rule_config.triggers).map(normalizeTrigger),
    ruleConfig: config.rule_config,
    promForDuration: config.prom_for_duration,
    cronPattern: config.cron_pattern,
    effectiveIsDefault: isDefaultEffectiveConfig(config),
    notifyIsDefault: isDefaultNotifyConfig(config),
    notifyRuleNames: config.notify_rule_ids.map((id) => requiredMapValue(refs.notificationRuleNameMap, id, 'notify_rule_ids')),
    notifyGroupNames: config.notify_groups.map((id) => requiredMapValue(refs.teamNameMap, Number(id), 'notify_groups')),
    notifyChannelLabels: config.notify_channels.map((key) => requiredMapValue(refs.notifyChannelLabelMap, key, 'notify_channels')),

    // Pipeline / Event processing
    pipelineNames: (config.pipeline_configs || [])
      .filter((pc: Record<string, unknown>) => Number(pc.pipeline_id) > 0)
      .map((pc: Record<string, unknown>) => requiredMapValue(refs.pipelineNameMap, Number(pc.pipeline_id), 'pipeline_configs.pipeline_id')),
    pipelineConfigs: (config.pipeline_configs || [])
      .filter((pc: Record<string, unknown>) => Number(pc.pipeline_id) > 0)
      .map((pc: Record<string, unknown>) => ({
        pipelineId: Number(pc.pipeline_id),
        enable: pc.enable !== false,
      })),
    eventRelabelConfigs: normalizeRelabelConfigs(config.rule_config?.event_relabel_config),

    // Annotations & tags
    annotations,
    annotationEntries: Object.entries(annotations).map(([key, value]) => ({ key, value })),
    appendTagStrings: (config.append_tags || []).map(String),

    // Effective config
    timeZoneName: config.time_zone === 'Local' ? undefined : config.time_zone,
    enableInBg: config.enable_in_bg === 1,
    effectiveTimeRanges: normalizeEffectiveTimeRanges(config.enable_stimes || [], config.enable_etimes || [], config.enable_days_of_weeks || []),

    // Service calendar
    serviceCalNames: serviceCalConfigs.flatMap((sc) => sc.serviceCalNames),
    serviceCalConfigs,

    // Notify config
    notifyRecovered: config.notify_recovered === 1,
    recoverDuration: config.recover_duration,
    notifyRepeatStep: config.notify_repeat_step,
    notifyMaxNumber: config.notify_max_number,
  };
}

/**
 * @param refs 可选的引用数据，用于将 uiConfig 中的名称映射回 UI 实际保存的 ID。
 *   当 datasource 名称在测试环境中对应的 ID 与 config 中的原始 ID 不同时，提供此参数可避免断言失败。
 */
export function buildExpectedAlertRule(config: AlertRuleConfig, uiConfig: NormalizedAlertRuleConfig, refs?: ReferenceData) {
  const expected = processAlertRuleFormValuesForE2E(processAlertRuleInitialValuesForE2E(config)) as AlertRuleConfig;
  expected.name = uiConfig.name;

  // Remove export/list metadata fields
  for (const key of DELETE_META_KEYS) {
    delete (expected as Record<string, unknown>)[key];
  }

  // datasource_ids is not returned or set during creation
  delete (expected as Partial<AlertRuleConfig>).datasource_ids;
  delete (expected as Record<string, unknown>).enable_status;
  // The add form does not expose a disabled/enable toggle.
  // New rules are always created as enabled (disabled: 0).
  expected.disabled = 0;

  // 使用引用数据中的 name→ID 映射替换 datasource_queries 中的 ID，
  // 使其与实际 UI 选中的 ID 一致（UI 通过名称选择 datasource，最终 ID 可能与 config 原始值不同）
  if (refs && uiConfig.datasourceQueries.length > 0) {
    expected.datasource_queries = expected.datasource_queries.map((dq, dqIdx) => {
      const uiDq = uiConfig.datasourceQueries[dqIdx];
      if (!uiDq) return dq;
      const newValues = uiDq.datasourceNames.map((name) => {
        const id = refs!.datasourceIdByNameMap[name];
        if (id === undefined) {
          throw new Error(`Cannot find datasource ID for name "${name}" in datasource_queries[${dqIdx}]`);
        }
        return id;
      });
      return { ...dq, values: newValues };
    });
  }

  // Top-level event_relabel_config is populated by backend from rule_config;
  // UI writes to rule_config.event_relabel_config, so drop the top-level copy
  // to avoid mismatch on non-form fields (RegexCompiled, IfRegex, modulus, etc.)
  delete (expected as Partial<AlertRuleConfig>).event_relabel_config;

  if (expected.cate === 'prometheus' && expected.rule_config?.version === 'v1') {
    expected.rule_config.queries = toRecordArray(expected.rule_config.queries).map((query) => {
      const { ref, ...persistedQuery } = query;
      return persistedQuery;
    });
  }
  if (expected.cate === 'elasticsearch') {
    expected.rule_config.queries = toRecordArray(expected.rule_config.queries).map((query) => {
      if (Array.isArray(query.group_by) && query.group_by.length === 0) {
        const { group_by, ...persistedQuery } = query;
        return persistedQuery;
      }
      return query;
    });
  }
  if (expected.extra_config?.network_device_config === null) {
    delete expected.extra_config.network_device_config;
  }

  // FormNG add page does not expose prom_eval_interval. New rules keep the
  // default form value even when an exported config contains a different value.
  expected.prom_eval_interval = 30;

  // rule_config.task_tpls 不是表单字段，后端可能不返回
  if (expected.rule_config && 'task_tpls' in expected.rule_config) {
    delete (expected.rule_config as Record<string, unknown>).task_tpls;
  }

  // FormNG add page only renders PipelineConfigsNG Relabel when initialValues
  // already contains rule_config.event_relabel_config; default add values do not.
  if (expected.rule_config && 'event_relabel_config' in expected.rule_config) {
    delete (expected.rule_config as Record<string, unknown>).event_relabel_config;
  }

  // FormNG only renders anomaly_trigger for prometheus with fcBrain, and only
  // submits its fields when the trigger is explicitly enabled.
  if (
    expected.rule_config &&
    'anomaly_trigger' in expected.rule_config &&
    (expected.cate !== 'prometheus' || (expected.rule_config.anomaly_trigger as Record<string, unknown>)?.enable !== true)
  ) {
    delete (expected.rule_config as Record<string, unknown>).anomaly_trigger;
  }

  // NodataTrigger hides resolve_after controls while the trigger is disabled;
  // processFormValues does not persist resolve_after in that state.
  if (expected.rule_config?.nodata_trigger && expected.rule_config.nodata_trigger.enable !== true) {
    delete (expected.rule_config.nodata_trigger as Record<string, unknown>).resolve_after;
  }

  // Joins are not rendered for single-query trigger configs, so join_ref is not persisted.
  const queryCount = Array.isArray(expected.rule_config?.queries) ? expected.rule_config.queries.length : 0;
  if (queryCount <= 1 && Array.isArray(expected.rule_config?.triggers)) {
    expected.rule_config.triggers = expected.rule_config.triggers.map((trigger) => {
      if (!isPlainObject(trigger)) return trigger;
      const { join_ref, ...persistedTrigger } = trigger;
      return persistedTrigger;
    });
  }

  // GCM fields that are dynamically filtered by metricDescriptor — skip UI interaction
  if (expected.cate === 'gcm' && expected.rule_config?.queries) {
    const queries = expected.rule_config.queries as Record<string, unknown>[];
    for (const query of queries) {
      delete (query as Record<string, unknown>).group_bys;
      delete (query as Record<string, unknown>).reducer;
      delete (query as Record<string, unknown>).aligner;
      delete (query as Record<string, unknown>).alignment_period;
    }
  }

  // CloudWatch sub-query alias is not persisted by the backend
  if (expected.cate === 'cloudwatch' && expected.rule_config?.queries) {
    const queries = expected.rule_config.queries as Record<string, unknown>[];
    for (const query of queries) {
      const subQueries = query.queries as Record<string, unknown>[] | undefined;
      if (subQueries) {
        for (const subQuery of subQueries) {
          delete (subQuery as Record<string, unknown>).period;
          delete (subQuery as Record<string, unknown>).query_id;
          delete (subQuery as Record<string, unknown>).offset;
          delete (subQuery as Record<string, unknown>).return_data;
          delete (subQuery as Record<string, unknown>).alias;
          delete (subQuery as Record<string, unknown>).dimensions;
        }
      }
    }
  }

  return expected;
}
