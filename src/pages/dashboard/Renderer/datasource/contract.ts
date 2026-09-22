import moment from 'moment';
import _ from 'lodash';

import type { IRawTimeRange } from '@/components/TimeRangePicker/types';
import { parseRange } from '@/components/TimeRangePicker/utils';
import type { ITarget, JsonObject, JsonValue } from '@/pages/dashboard/types';
import flatten from '@/utils/flatten';
import replaceTemplateVariables, { getBuiltInVariables, replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { getDashboardQueryStep } from './queryStep';
import { normalizeInterval } from './elasticsearch/utils';
import { completeBreakpoints } from './utils';
import type { DashboardQueryRequest, DashboardQueryResponse, DatasourceQuery, ExpressionQuery, NormalizedDashboardQueryResponse, DashboardSeries } from './types';
import { getTargetRefId, inferTargetResultType, isExpressionTarget } from './target';
import { DASHBOARD_TARGET_META_FIELDS, getDashboardDatasourceDefinition } from './registry';

import { getDashboardVariablePlugin } from '@/pages/dashboard/Variables/plugins';

export { inferTargetResultType, isExpressionTarget } from './target';

const FORBIDDEN_REQUEST_FIELDS = new Set(['timezone', 'max_data_points', 'interval_ms', 'request_id']);
const REF_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const REF_ID_REFERENCE_PATTERN = /\$([A-Za-z][A-Za-z0-9_]*)/g;
const ES_INTERVAL_UNITS = ['second', 'min', 'hour'] as const;

type EsIntervalUnit = (typeof ES_INTERVAL_UNITS)[number];

function getEsIntervalUnit(value: unknown): EsIntervalUnit {
  return ES_INTERVAL_UNITS.includes(value as EsIntervalUnit) ? (value as EsIntervalUnit) : 'min';
}

/** Recursively interpolates a datasource payload with the runtime variables supplied for this panel query. */
function interpolateQueryValue(
  value: unknown,
  range: IRawTimeRange,
  step: number | undefined,
  scopedVars: import('@/pages/dashboard/types').ScopedVariables | undefined,
  variables?: import('@/pages/dashboard/Variables/types').IVariable[],
): unknown {
  if (typeof value === 'string') {
    return replaceTemplateVariables(value, {
      range,
      step,
      scopedVars,
      variables,
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateQueryValue(item, range, step, scopedVars, variables));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce<Record<string, unknown>>((result, key) => {
      if (!FORBIDDEN_REQUEST_FIELDS.has(key)) {
        result[key] = interpolateQueryValue((value as Record<string, unknown>)[key], range, step, scopedVars, variables);
      }
      return result;
    }, {});
  }
  return value;
}

function getDatasourceQueryPayload(target: ITarget, cate: string, options: BuildDashboardQueryRequestOptions & { effectiveRange: IRawTimeRange }, value?: unknown) {
  const payload =
    getDashboardDatasourceDefinition(cate)?.serializeTarget(target) ??
    ({
      ...(target.query && typeof target.query === 'object' ? _.cloneDeep(target.query) : {}),
      ..._.omit(target, DASHBOARD_TARGET_META_FIELDS),
    } as JsonObject);

  const step = getDashboardQueryStep({
    time: options.effectiveRange,
    maxDataPoints: options.maxDataPoints,
    panelWidth: options.panelWidth,
    minStep: target.step,
  });
  if (cate === 'prometheus') {
    payload.expr = target.expr as JsonValue;
    payload.instant = !!target.instant;
    payload.step = step;
  }
  if (_.includes(['elasticsearch', 'opensearch'], cate) && value !== undefined) {
    payload.value = value as JsonValue;
    delete payload.values;
  }
  if (_.includes(['elasticsearch', 'opensearch'], cate)) {
    const interval = typeof payload.interval === 'number' ? payload.interval : null;
    const unit = getEsIntervalUnit(payload.interval_unit);
    payload.interval = normalizeInterval(parseRange(options.effectiveRange), interval, unit) ?? 60;
    delete payload.interval_unit;
  }

  const plugin = getDashboardVariablePlugin(cate);
  if (plugin) {
    return plugin.transformQuery(payload, {
      variables: [...(options.variables ?? []), ...getBuiltInVariables(options.effectiveRange, { step })],
      range: options.effectiveRange,
      step,
      scopedVars: options.scopedVars,
    });
  }
  return interpolateQueryValue(payload, options.effectiveRange, step, options.scopedVars, options.variables);
}

export interface BuildDashboardQueryRequestOptions {
  time: IRawTimeRange;
  queryOptionsTime?: IRawTimeRange;
  targets: ITarget[];
  datasourceList: import('@/pages/dashboard/types').DashboardDatasource[];
  panelWidth?: number;
  maxDataPoints?: number;
  scopedVars?: import('@/pages/dashboard/types').ScopedVariables;
  /** Variables read from the owning runtime instance instead of the legacy module store. */
  variables?: import('@/pages/dashboard/Variables/types').IVariable[];
  legacyDatasource?: {
    cate?: string;
    id?: number | string;
  };
}

export function buildDashboardQueryRequest(options: BuildDashboardQueryRequestOptions): DashboardQueryRequest {
  const effectiveRange = options.queryOptionsTime ?? options.time;
  const parsedRange = parseRange(effectiveRange);
  const buildOptions = {
    ...options,
    effectiveRange,
  };

  const reservedRefIds = new Set(options.targets.map((target, index) => target.refId || getTargetRefId(index)));
  const getValueRefId = (refId: string, valueIndex: number) => {
    let valueRefId = `${refId}__value_${valueIndex}`;
    while (reservedRefIds.has(valueRefId)) {
      valueRefId = `${valueRefId}_`;
    }
    reservedRefIds.add(valueRefId);
    return valueRefId;
  };

  const skippedQueryRefIds = new Set<string>();
  const queries = _.flatMap(options.targets, (target, index): Array<DatasourceQuery | ExpressionQuery> => {
    const refId = target.refId || getTargetRefId(index);
    if (isExpressionTarget(target)) {
      const expression = target.expression ?? target.expr ?? '';
      if (!expression.trim()) {
        return [];
      }
      return [{ kind: 'expression', ref_id: refId, expression }];
    }

    const datasource = target.datasource ?? {
      cate: options.legacyDatasource?.cate ?? 'prometheus',
      id: options.legacyDatasource?.id,
    };
    const resolvedDatasourceId = replaceDatasourceVariables(datasource.id as number | string, {
      datasourceList: options.datasourceList,
      variables: options.variables,
    });
    if (typeof resolvedDatasourceId !== 'number') {
      skippedQueryRefIds.add(refId);
      return [];
    }
    const datasourceDefinition = getDashboardDatasourceDefinition(datasource.cate);
    if (datasource.cate === 'prometheus' && !target.expr?.trim()) {
      skippedQueryRefIds.add(refId);
      return [];
    }
    if (datasourceDefinition && !datasourceDefinition.isQueryReady(target)) {
      skippedQueryRefIds.add(refId);
      return [];
    }

    const values = target.query?.values;
    const isElasticsearchQuery = _.includes(['elasticsearch', 'opensearch'], datasource.cate);
    if (isElasticsearchQuery && Array.isArray(values)) {
      const datasourceQueries = values.flatMap((value, valueIndex) => {
        const queryPayload = getDatasourceQueryPayload(target, datasource.cate, buildOptions, value);
        if (queryPayload === undefined) return [];
        return [
          {
            kind: 'query' as const,
            // 保留首个指标的 RefID，兼容表达式对该 target 的已有引用；其余指标使用唯一子 RefID。
            ref_id: valueIndex === 0 ? refId : getValueRefId(refId, valueIndex),
            datasource: {
              cate: datasource.cate,
              id: resolvedDatasourceId,
            },
            result_type: inferTargetResultType(target),
            query: queryPayload,
          },
        ];
      });
      if (!datasourceQueries.length) {
        skippedQueryRefIds.add(refId);
      }
      return datasourceQueries;
    }

    const queryPayload = getDatasourceQueryPayload(target, datasource.cate, buildOptions);
    if (queryPayload === undefined) {
      skippedQueryRefIds.add(refId);
      return [];
    }
    return [
      {
        kind: 'query',
        ref_id: refId,
        datasource: {
          cate: datasource.cate,
          id: resolvedDatasourceId,
        },
        result_type: inferTargetResultType(target),
        query: queryPayload,
      },
    ];
  });

  // 空查询条件会让对应的 source target 被静默跳过。表达式若继续引用它，
  // validateDashboardQueryRequest 会将整个面板视为非法，反而阻塞其他已就绪
  // 的混合数据源查询。仅移除这类受跳过 target 影响的表达式；真正拼错的
  // RefID、日志表达式和循环依赖仍保留给校验函数显式报错。
  let executableQueries = queries;
  let removedExpression = true;
  while (removedExpression) {
    removedExpression = false;
    executableQueries = executableQueries.filter((query) => {
      if (query.kind !== 'expression' || !getExpressionReferences(query.expression).some((refId) => skippedQueryRefIds.has(refId))) {
        return true;
      }
      skippedQueryRefIds.add(query.ref_id);
      removedExpression = true;
      return false;
    });
  }

  const request = {
    from: moment(parsedRange.start).unix(),
    to: moment(parsedRange.end).unix(),
    queries: executableQueries,
  };
  validateDashboardQueryRequest(request);
  return request;
}

function getExpressionReferences(expression: string) {
  return Array.from(expression.matchAll(REF_ID_REFERENCE_PATTERN), (match) => match[1]);
}

export function validateDashboardQueryRequest(request: DashboardQueryRequest) {
  if (request.to < request.from) {
    throw new Error('Query end time must not be earlier than start time');
  }
  const queriesByRefId = new Map<string, DatasourceQuery | ExpressionQuery>();
  request.queries.forEach((query) => {
    if (!REF_ID_PATTERN.test(query.ref_id)) {
      throw new Error(`Invalid RefID: ${query.ref_id}`);
    }
    if (queriesByRefId.has(query.ref_id)) {
      throw new Error(`Duplicate RefID: ${query.ref_id}`);
    }
    queriesByRefId.set(query.ref_id, query);
  });

  const visitState = new Map<string, 'visiting' | 'visited'>();
  const visitExpression = (refId: string) => {
    const state = visitState.get(refId);
    if (state === 'visiting') throw new Error(`Expression dependency cycle: ${refId}`);
    if (state === 'visited') return;
    visitState.set(refId, 'visiting');
    const query = queriesByRefId.get(refId);
    if (query?.kind === 'expression') {
      getExpressionReferences(query.expression).forEach((dependencyRefId) => {
        const dependency = queriesByRefId.get(dependencyRefId);
        if (!dependency) throw new Error(`Expression dependency not found: ${dependencyRefId}`);
        if (dependency.kind === 'query' && dependency.result_type === 'logs') {
          throw new Error(`Expression cannot reference log query: ${dependencyRefId}`);
        }
        if (dependency.kind === 'expression') visitExpression(dependencyRefId);
      });
    }
    visitState.set(refId, 'visited');
  };

  request.queries.filter((query): query is ExpressionQuery => query.kind === 'expression').forEach((query) => visitExpression(query.ref_id));
}

function getLabelsKey(labels: Record<string, string>) {
  return Object.keys(labels)
    .sort()
    .map((key) => `${key}=${labels[key]}`)
    .join(',');
}

function stableIdentityHash(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function getEsBucketInterval(refId: string, request?: DashboardQueryRequest) {
  const query = request?.queries.find((item) => item.ref_id === refId);
  if (!query || query.kind !== 'query' || !_.includes(['elasticsearch', 'opensearch'], query.datasource.cate)) return undefined;
  const interval = query.query && typeof query.query === 'object' ? (query.query as Record<string, unknown>).interval : undefined;
  return typeof interval === 'number' && interval > 0 ? interval : undefined;
}

interface PrometheusLineage {
  isPrometheus: boolean;
  steps: number[];
}

function getPrometheusLineage(refId: string, request?: DashboardQueryRequest, visitingRefIds = new Set<string>()): PrometheusLineage | undefined {
  if (!request || visitingRefIds.has(refId)) return undefined;
  const query = request.queries.find((item) => item.ref_id === refId);
  if (!query) return undefined;

  if (query.kind === 'query') {
    if (query.datasource.cate !== 'prometheus') return { isPrometheus: false, steps: [] };
    const step = query.query && typeof query.query === 'object' ? (query.query as Record<string, unknown>).step : undefined;
    return {
      isPrometheus: true,
      steps: typeof step === 'number' && step > 0 ? [step] : [],
    };
  }

  const dependencyRefIds = getExpressionReferences(query.expression);
  if (!dependencyRefIds.length) return undefined;
  const nextVisitingRefIds = new Set(visitingRefIds);
  nextVisitingRefIds.add(refId);
  const dependencies = dependencyRefIds.map((dependencyRefId) => getPrometheusLineage(dependencyRefId, request, nextVisitingRefIds));
  if (dependencies.some((dependency) => !dependency?.isPrometheus)) return { isPrometheus: false, steps: [] };
  return {
    isPrometheus: true,
    steps: dependencies.flatMap((dependency) => dependency?.steps ?? []),
  };
}

function getPrometheusStep(lineage: PrometheusLineage | undefined) {
  if (!lineage?.isPrometheus) return undefined;
  const steps = _.uniq(lineage.steps);
  // 多个 Prom 依赖的 step 不同，不能安全地为表达式假定单一采样间隔。
  return steps.length === 1 ? steps[0] : undefined;
}

function getAlignmentDatasourceCate(lineage: PrometheusLineage | undefined, target: ITarget | undefined) {
  if (lineage?.isPrometheus) return 'prometheus';
  // 表达式 target 不携带数据源，混合依赖不得回退为 Prometheus 对齐语义。
  return isExpressionTarget(target) ? undefined : target?.datasource?.cate;
}

export function normalizeDashboardQueryResponse(
  response: DashboardQueryResponse,
  targets: ITarget[],
  request?: DashboardQueryRequest,
  options: { spanNulls?: boolean } = {},
): NormalizedDashboardQueryResponse {
  const series: DashboardSeries[] = [];
  const errorsByRef: NormalizedDashboardQueryResponse['errorsByRef'] = {};

  (response.results ?? []).forEach((result) => {
    const refId = result.ref_id;
    const getRefId = (item: ITarget, index: number) => item.refId || getTargetRefId(index);
    // 独立 target 的 RefID 优先于 ES/OpenSearch 多 value 查询生成的子 RefID，避免 A 抢占 A__value_1。
    const target = _.find(targets, (item, index) => getRefId(item, index) === refId) ?? _.find(targets, (item, index) => refId.startsWith(`${getRefId(item, index)}__value_`));

    if (result.status !== 'success') {
      errorsByRef[refId] = result.error;
      return;
    }
    if (target?.hide) return;

    if (result.result_type === 'time_series') {
      const bucketInterval = getEsBucketInterval(refId, request);
      // 同一条 lineage 只解析一次：表达式依赖链可能较深，避免重复递归。
      const prometheusLineage = getPrometheusLineage(refId, request);
      const prometheusStep = options.spanNulls ? undefined : getPrometheusStep(prometheusLineage);
      const datasourceCate = getAlignmentDatasourceCate(prometheusLineage, target);
      result.series.forEach((item) => {
        const labels = item.labels ?? {};
        series.push({
          id: item.id || `${refId}:series:${stableIdentityHash(`${item.name ?? ''}\u0000${getLabelsKey(labels)}`)}`,
          refId,
          name: item.name,
          metric: labels,
          // 仅在唯一 Prom step 可推导时补缺点；非 Prom 与多 step 表达式保持原样。
          data: prometheusStep ? completeBreakpoints(prometheusStep, item.samples) : item.samples,
          mode: 'timeSeries',
          target,
          datasourceCate,
          isExp: isExpressionTarget(target),
          bucketInterval,
        });
      });
      return;
    }

    result.records.forEach((record) => {
      const fields = record.fields ?? {};
      const locationKey = JSON.stringify(fields);
      series.push({
        id: record.id || `${refId}:log:${stableIdentityHash(locationKey)}`,
        refId,
        metric: flatten(fields),
        data: [],
        mode: 'raw',
        target,
      });
    });
  });

  return {
    series,
    errorsByRef,
  };
}
