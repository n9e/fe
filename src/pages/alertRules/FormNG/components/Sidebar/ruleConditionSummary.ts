import { mapRelativeTimeRangeToOption } from '@/components/TimeRangePicker/RelativeTimeRangePicker/utils';
import { describeTimeRange } from '@/components/TimeRangePicker/utils';
import type { LogQLVendor } from '@fc-components/monaco-editor';

export interface ConditionSummaryItem {
  key: string;
  title: string;
  meta: string[];
  queryText?: string;
  queryFullText?: string;
  queryPreviewType?: QueryPreviewType;
  queryPreviewVendor?: LogQLVendor;
  valueTags?: string[];
  details?: string;
}

export type QueryPreviewType = 'promql' | 'sql' | 'loki' | 'logql' | 'text';

export interface ConditionSummaryResult {
  queries: ConditionSummaryItem[];
  triggers: ConditionSummaryItem[];
}

export interface HostMachinePreviewSummary {
  names: string[];
  extraCount: number;
}

export interface BuildRuleConditionSummaryParams {
  cate?: string;
  queries?: any[];
  triggers?: any[];
  version?: string;
  nodataTrigger?: any;
  labels?: Partial<ConditionSummaryLabels>;
}

const QUERY_TEXT_KEYS = ['query', 'prom_ql', 'sql', 'promql', 'query_string', 'expression'];
const MAX_META_ITEMS = 9;

export interface ConditionSummaryLabels {
  normalMode: string;
  advancedMode: string;
  builderMode: string;
  expressionMode: string;
  range: string;
  interval: string;
  subqueries: string;
  logGroups: string;
  groupBy: string;
  step: string;
  fields: string;
  nodata: string;
  autoRecoverAfter: string;
  seconds: string;
  hostThan: string;
  hostPctTargetMissText: string;
  hostSecond: string;
  hostMillisecond: string;
  hostTriggerNames: Record<string, string>;
}

const defaultLabels: ConditionSummaryLabels = {
  normalMode: 'Normal',
  advancedMode: 'Advanced',
  builderMode: 'Builder',
  expressionMode: 'Expression',
  range: 'Range',
  interval: 'Interval',
  subqueries: 'subqueries',
  logGroups: 'log groups',
  groupBy: 'Group by',
  step: 'Step',
  fields: 'fields',
  nodata: 'No data',
  autoRecoverAfter: 'Auto recover after',
  seconds: 's',
  hostThan: '>',
  hostPctTargetMissText: 's, pct target miss >',
  hostSecond: 's',
  hostMillisecond: 'ms',
  hostTriggerNames: {
    target_miss: 'Target miss',
    pct_target_miss: 'Pct target miss',
    offset: 'Offset',
  },
};

export function normalizeSummaryText(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

export function buildHostMachinePreviewSummary(list: any[] = [], total = 0, limit = 3): HostMachinePreviewSummary {
  const names = list
    .slice(0, limit)
    .map((item) => normalizeSummaryText(item?.ident))
    .filter(Boolean);
  return {
    names,
    extraCount: Math.max(total - names.length, 0),
  };
}

function compactList(values: unknown[]): string[] {
  return values.map(normalizeSummaryText).filter(Boolean);
}

function getQueryRef(query: any, index: number): string {
  return normalizeSummaryText(query?.ref) || String.fromCharCode(65 + index);
}

function stringifyDetails(value: any): string | undefined {
  if (value === undefined || value === null) return undefined;
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return normalizeSummaryText(value);
  }
}

function findRawText(query: any): string {
  for (const key of QUERY_TEXT_KEYS) {
    const text = query?.[key];
    if (normalizeSummaryText(text)) return String(text);
  }
  return '';
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds)) return '';
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function formatInterval(value: unknown, unit?: unknown): string {
  const normalizedValue = Number(value);
  if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) return '';
  const normalizedUnit = normalizeSummaryText(unit);
  if (normalizedUnit === 'second') return `${normalizedValue}s`;
  if (normalizedUnit === 'min') return `${normalizedValue}min`;
  if (normalizedUnit === 'hour') return `${normalizedValue}h`;
  return formatSeconds(normalizedValue);
}

function getRangeLabel(query: any): string {
  const range = query?.range;
  if (range?.start && range?.end) {
    const start = normalizeSummaryText(range.start);
    const end = normalizeSummaryText(range.end);
    const text = start && end ? describeTimeRange({ start, end }, '') : '';
    if (text) return normalizeSummaryText(text);
  }
  if (range?.display) return normalizeSummaryText(range.display);
  if (range?.label) return normalizeSummaryText(range.label);
  if (Number.isFinite(query?.from) && Number.isFinite(query?.to)) {
    const option = mapRelativeTimeRangeToOption({ start: query.from, end: query.to });
    const text = describeTimeRange({ start: option.start, end: option.end }, '');
    if (text) return normalizeSummaryText(text);
    if (query.to === 0 && query.from > 0) return formatSeconds(query.from);
    return `${formatSeconds(query.from)} ~ ${formatSeconds(query.to)}`;
  }
  return '';
}

function getLabels(labels?: Partial<ConditionSummaryLabels>): ConditionSummaryLabels {
  return {
    ...defaultLabels,
    ...labels,
  };
}

function getTitleParts(query: any, labels: ConditionSummaryLabels, options?: { showRange?: boolean; showInterval?: boolean }): string[] {
  const showRange = options?.showRange !== false;
  const showInterval = options?.showInterval !== false;
  const rangeLabel = showRange ? getRangeLabel(query) : '';
  if (rangeLabel) return [`${labels.range} ${rangeLabel}`];
  const intervalLabel = showInterval ? formatInterval(query?.interval, query?.interval_unit) : '';
  if (intervalLabel) return [`${labels.interval} ${intervalLabel}`];
  return [];
}

function createQueryItem(
  index: number,
  query: any,
  titleParts: unknown[],
  meta: unknown[],
  queryText?: unknown,
  previewType?: QueryPreviewType,
  previewVendor?: LogQLVendor,
): ConditionSummaryItem {
  const details = stringifyDetails(query);
  const queryFullText = queryText === undefined || queryText === null ? '' : String(queryText).trim();
  return {
    key: `query-${index}`,
    title: compactList([getQueryRef(query, index), ...titleParts]).join(' · '),
    meta: compactList(meta).slice(0, MAX_META_ITEMS),
    queryText: normalizeSummaryText(queryText),
    queryFullText,
    queryPreviewType: previewType,
    queryPreviewVendor: previewVendor,
    details,
  };
}

function buildCloudWatchQuery(index: number, query: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const subQueries = Array.isArray(query?.queries) ? query.queries : [];
  const first = subQueries[0] || {};
  if (subQueries.length > 1) {
    return createQueryItem(index, query, getTitleParts(query, labels), [first.region, `${subQueries.length} ${labels.subqueries}`]);
  }
  if (first.query_type === 'metric_insights') {
    return createQueryItem(index, query, getTitleParts(query, labels), [first.region], first.expression || first.sql, 'sql');
  }
  if (first.query_type === 'metric_search' && first.metric_editor_mode === 1) {
    return createQueryItem(index, query, getTitleParts(query, labels), [first.region], first.expression, 'text');
  }
  return createQueryItem(index, query, getTitleParts(query, labels), [first.region, first.namespace, first.metric_name]);
}

function buildCloudWatchLogsQuery(index: number, query: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const logGroupNames = Array.isArray(query?.log_group_names) ? query.log_group_names : [];
  return createQueryItem(
    index,
    query,
    getTitleParts(query, labels),
    [query?.region, logGroupNames.length ? `${logGroupNames.length} ${labels.logGroups}` : undefined, query?.query_language],
    query?.query_string,
    'text',
  );
}

function buildGcmQuery(index: number, query: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const isPromql = query?.query_type === 'promql';
  if (isPromql) {
    return createQueryItem(index, query, getTitleParts(query, labels), [], query?.promql, 'promql');
  }
  return createQueryItem(index, query, getTitleParts(query, labels), [query?.metric_type]);
}

function buildElasticsearchQuery(index: number, query: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const isIndexPattern = query?.index_type === 'index_pattern';
  const indexLabel = isIndexPattern ? query?.index_pattern_name || query?.index_pattern : query?.index;
  return createQueryItem(
    index,
    query,
    getTitleParts(query, labels),
    [indexLabel, query?.filter],
  );
}

function buildLogServiceQuery(index: number, query: any, labels: ConditionSummaryLabels, cate?: string): ConditionSummaryItem {
  const vendorMap: Record<string, LogQLVendor> = {
    'aliyun-sls': 'sls',
    'tencent-cls': 'cls',
    'volc-tls': 'tls',
    'bce-bls': 'bls',
    'huawei-lts': 'lts',
  };
  return createQueryItem(
    index,
    query,
    getTitleParts(query, labels),
    [query?.project || query?.project_id, query?.logstore || query?.logset_id, query?.topic_id || query?.logstream],
    query?.query,
    'logql',
    cate ? vendorMap[cate] : undefined,
  );
}

function buildGenericQuery(index: number, query: any, labels: ConditionSummaryLabels, cate?: string): ConditionSummaryItem {
  const text = findRawText(query);
  const visibleKeys = Object.keys(query || {}).filter((key) => !['ref', 'unit', 'keys'].includes(key));
  const sqlCates = ['ck', 'mysql', 'pgsql', 'oracle', 'redshift', 'doris', 'influxdb'];
  const previewType: QueryPreviewType | undefined = cate === 'loki' ? 'loki' : sqlCates.includes(cate || '') ? 'sql' : undefined;
  return createQueryItem(index, query, getTitleParts(query, labels), [!text && visibleKeys.length ? `${visibleKeys.length} ${labels.fields}` : undefined], text, previewType);
}

function buildPrometheusQuery(index: number, query: any, version: string | undefined, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const versionText = version === 'v2' ? labels.advancedMode : labels.normalMode;
  const severityText = version !== 'v2' && query?.severity !== undefined ? `P${query.severity}` : undefined;
  return createQueryItem(index, query, [versionText, severityText, ...getTitleParts(query, labels)], [], version === 'v2' ? query?.query : query?.prom_ql, 'promql');
}

export function stringifyExpressions(expressions: any[]): string {
  if (!Array.isArray(expressions) || expressions.length === 0) return '';
  const logicalOperator = normalizeSummaryText(expressions[0]?.logicalOperator) || '&&';
  return expressions
    .map((expression) => {
      const ref = normalizeSummaryText(expression?.ref) || 'A';
      const label = normalizeSummaryText(expression?.label);
      const operator = normalizeSummaryText(expression?.comparisonOperator) || '>';
      const value = normalizeSummaryText(expression?.value);
      return `$${ref}${label ? `.${label}` : ''} ${operator} ${value}`;
    })
    .join(` ${logicalOperator} `);
}

function buildTrigger(index: number, trigger: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const exp = normalizeSummaryText(trigger?.exp) || stringifyExpressions(trigger?.expressions);
  return {
    key: `trigger-${index}`,
    title: `#${index + 1} · P${trigger?.severity ?? '-'}`,
    meta: [],
    valueTags: exp ? [exp] : [],
    details: stringifyDetails(trigger),
  };
}

function buildNodataTrigger(nodataTrigger: any, labels: ConditionSummaryLabels): ConditionSummaryItem | undefined {
  if (nodataTrigger?.enable !== true) return undefined;
  return {
    key: 'nodata-trigger',
    title: `${labels.nodata} · P${nodataTrigger?.severity ?? '-'}`,
    meta: [
      nodataTrigger?.resolve_after_enable === true && nodataTrigger?.resolve_after !== undefined ? `${labels.autoRecoverAfter} ${nodataTrigger.resolve_after}${labels.seconds}` : undefined,
    ].filter(Boolean) as string[],
    valueTags: [],
    details: stringifyDetails(nodataTrigger),
  };
}

function buildHostTrigger(index: number, trigger: any, labels: ConditionSummaryLabels): ConditionSummaryItem {
  const type = normalizeSummaryText(trigger?.type);
  const unit = type === 'pct_target_miss' ? labels.hostPctTargetMissText : type === 'offset' ? labels.hostMillisecond : labels.hostSecond;
  const valueTags = [`${labels.hostThan} ${trigger?.duration ?? '-'}${unit}`];
  if (type === 'pct_target_miss' && trigger?.percent !== undefined) {
    valueTags.push(`${trigger.percent}%`);
  }
  return {
    key: `host-trigger-${index}`,
    title: `${labels.hostTriggerNames[type] || type || `#${index + 1}`} · P${trigger?.severity ?? '-'}`,
    meta: [],
    valueTags,
    details: stringifyDetails(trigger),
  };
}

export function buildRuleConditionSummary({ cate, queries, triggers, version, nodataTrigger, labels: labelOverrides }: BuildRuleConditionSummaryParams): ConditionSummaryResult {
  const labels = getLabels(labelOverrides);
  const normalizedQueries = Array.isArray(queries) ? queries : [];
  const normalizedTriggers = Array.isArray(triggers) ? triggers : [];
  const queryItems = cate === 'host' ? [] : normalizedQueries.map((query, index) => {
    if (cate === 'prometheus') return buildPrometheusQuery(index, query, version, labels);
    if (cate === 'cloudwatch') return buildCloudWatchQuery(index, query, labels);
    if (cate === 'cloudwatchlogs') return buildCloudWatchLogsQuery(index, query, labels);
    if (cate === 'gcm') return buildGcmQuery(index, query, labels);
    if (cate === 'elasticsearch' || cate === 'opensearch') return buildElasticsearchQuery(index, query, labels);
    if (['aliyun-sls', 'tencent-cls', 'volc-tls', 'bce-bls', 'huawei-lts'].includes(cate || '')) return buildLogServiceQuery(index, query, labels, cate);
    return buildGenericQuery(index, query, labels, cate);
  });
  const triggerItems = cate === 'host' ? normalizedTriggers.map((trigger, index) => buildHostTrigger(index, trigger, labels)) : cate === 'prometheus' && version !== 'v2' ? [] : normalizedTriggers.map((trigger, index) => buildTrigger(index, trigger, labels));
  const nodataItem = buildNodataTrigger(nodataTrigger, labels);

  return {
    queries: queryItems.filter((item) => item.title || item.queryText || item.meta.length > 0),
    triggers: [...triggerItems.filter((item) => item.title || item.valueTags?.length || item.meta.length > 0), ...(nodataItem ? [nodataItem] : [])],
  };
}
