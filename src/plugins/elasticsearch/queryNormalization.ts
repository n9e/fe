type QueryConfig = Record<string, unknown>;

const DSL_ONLY_FIELDS = [
  'index_type',
  'index',
  'index_pattern',
  'filter',
  'filter_language',
  'date_field',
  'date_format',
  'limit',
  'value',
  'values',
  'group_by',
  'offset',
] as const;

const SQL_ONLY_FIELDS = ['sql', 'keys', 'editMode'] as const;

function isQueryConfig(value: unknown): value is QueryConfig {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function omitFields<T extends QueryConfig>(value: T, fields: readonly string[]): T {
  const next = { ...value };
  fields.forEach((field) => {
    delete next[field];
  });
  return next as T;
}

export function isElasticsearchLike(cate: unknown): cate is 'elasticsearch' | 'opensearch' {
  return cate === 'elasticsearch' || cate === 'opensearch';
}

/**
 * 清理 ES/OpenSearch 查询中与当前语法无关的表单字段。
 * 表单态仍保留两套配置，只有提交内容调用此函数收敛为单一语法。
 */
export function normalizeElasticsearchQueryConfigForPersist<T extends QueryConfig>(config: T, isDashboard = false): T {
  const withoutBuilderConfig = omitFields(config, ['builderConfig']);
  if (withoutBuilderConfig.syntax === 'sql') {
    return omitFields(withoutBuilderConfig, DSL_ONLY_FIELDS);
  }
  const withoutSQLFields = omitFields(withoutBuilderConfig, [...SQL_ONLY_FIELDS, ...(isDashboard ? ['mode'] : [])]);
  return withoutSQLFields.index_type === 'index_pattern' ? omitFields(withoutSQLFields, ['index']) : omitFields(withoutSQLFields, ['index_pattern']);
}

export function normalizeElasticsearchAlertRuleQueryForPersist<T extends QueryConfig>(query: T): T {
  return normalizeElasticsearchQueryConfigForPersist(query);
}

export function normalizeElasticsearchRecordingRuleQueryForPersist<T extends Record<string, unknown>>(query: T): T {
  if (!isQueryConfig(query.config)) return query;
  return {
    ...query,
    config: normalizeElasticsearchQueryConfigForPersist(query.config),
  } as T;
}

export function normalizeElasticsearchDashboardTargetForPersist<T extends { query?: unknown }>(target: T): T {
  if (!isQueryConfig(target.query)) return target;
  return {
    ...target,
    query: normalizeElasticsearchQueryConfigForPersist(target.query, true),
  };
}
