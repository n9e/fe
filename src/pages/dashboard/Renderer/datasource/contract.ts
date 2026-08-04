import moment from 'moment';
import _ from 'lodash';

import type { IRawTimeRange } from '@/components/TimeRangePicker/types';
import { parseRange } from '@/components/TimeRangePicker/utils';
import type { ITarget } from '@/pages/dashboard/types';
import flatten from '@/utils/flatten';
import replaceTemplateVariables, { replaceDatasourceVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { getRealStep } from './prometheus';
import type { DashboardQueryRequest, DashboardQueryResponse, DatasourceQuery, ExpressionQuery, NormalizedDashboardQueryResponse } from './types';
import { getTargetRefId, inferTargetResultType, isExpressionTarget } from './target';
import { DASHBOARD_TARGET_META_FIELDS, getDashboardDatasourceDefinition } from './registry';

export { inferTargetResultType, isExpressionTarget } from './target';

const FORBIDDEN_REQUEST_FIELDS = new Set(['timezone', 'max_data_points', 'interval_ms', 'request_id']);
const REF_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const REF_ID_REFERENCE_PATTERN = /\$([A-Za-z][A-Za-z0-9_]*)/g;

function interpolateQueryValue(value: unknown, range: IRawTimeRange, step: number | undefined, scopedVars: any): unknown {
  if (typeof value === 'string') {
    return replaceTemplateVariables(value, {
      range,
      step,
      scopedVars,
    });
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateQueryValue(item, range, step, scopedVars));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce<Record<string, unknown>>((result, key) => {
      if (!FORBIDDEN_REQUEST_FIELDS.has(key)) {
        result[key] = interpolateQueryValue((value as Record<string, unknown>)[key], range, step, scopedVars);
      }
      return result;
    }, {});
  }
  return value;
}

function getDatasourceQueryPayload(target: ITarget, cate: string, options: BuildDashboardQueryRequestOptions & { effectiveRange: IRawTimeRange }) {
  const payload =
    getDashboardDatasourceDefinition(cate)?.serializeTarget(target) ??
    ({
      ...(target.query && typeof target.query === 'object' ? _.cloneDeep(target.query) : {}),
      ..._.omit(target, DASHBOARD_TARGET_META_FIELDS),
    } as Record<string, any>);

  const step = getRealStep({
    time: options.effectiveRange,
    maxDataPoints: options.maxDataPoints,
    panelWidth: options.panelWidth,
    minStep: target.step,
  });
  if (cate === 'prometheus') {
    payload.expr = target.expr;
    payload.instant = !!target.instant;
    payload.step = step;
  }

  return interpolateQueryValue(payload, options.effectiveRange, step, options.scopedVars);
}

export interface BuildDashboardQueryRequestOptions {
  time: IRawTimeRange;
  queryOptionsTime?: IRawTimeRange;
  targets: ITarget[];
  datasourceList: any[];
  panelWidth?: number;
  maxDataPoints?: number;
  scopedVars?: any;
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

  const queries = _.map(options.targets, (target, index): DatasourceQuery | ExpressionQuery | undefined => {
    const refId = target.refId || getTargetRefId(index);
    if (isExpressionTarget(target)) {
      const expression = target.expression ?? target.expr ?? '';
      if (!expression.trim()) {
        return undefined;
      }
      return {
        kind: 'expression',
        ref_id: refId,
        expression,
      };
    }

    const datasource = target.datasource ?? {
      cate: options.legacyDatasource?.cate ?? 'prometheus',
      id: options.legacyDatasource?.id,
    };
    const resolvedDatasourceId = replaceDatasourceVariables(datasource.id as number | string, {
      datasourceList: options.datasourceList,
    });
    if (typeof resolvedDatasourceId !== 'number') {
      return undefined;
    }
    const datasourceDefinition = getDashboardDatasourceDefinition(datasource.cate);
    if (datasource.cate === 'prometheus' && !target.expr?.trim()) {
      return undefined;
    }
    if (datasourceDefinition && !datasourceDefinition.isQueryReady(target)) {
      return undefined;
    }

    return {
      kind: 'query',
      ref_id: refId,
      datasource: {
        cate: datasource.cate,
        id: resolvedDatasourceId,
      },
      result_type: inferTargetResultType(target),
      query: getDatasourceQueryPayload(target, datasource.cate, buildOptions),
    };
  }).filter((item): item is DatasourceQuery | ExpressionQuery => item !== undefined);

  const request = {
    from: moment(parsedRange.start).unix(),
    to: moment(parsedRange.end).unix(),
    queries,
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

export function normalizeDashboardQueryResponse(response: DashboardQueryResponse, targets: ITarget[]): NormalizedDashboardQueryResponse {
  const series: any[] = [];
  const errorsByRef: NormalizedDashboardQueryResponse['errorsByRef'] = {};

  (response.results ?? []).forEach((result) => {
    const refId = result.ref_id;
    const target = _.find(targets, (item, index) => (item.refId || getTargetRefId(index)) === refId);

    if (result.status !== 'success') {
      errorsByRef[refId] = result.error;
      return;
    }
    if (target?.hide) return;

    if (result.result_type === 'time_series') {
      result.series.forEach((item) => {
        const labels = item.labels ?? {};
        series.push({
          id: item.id || `${refId}:series:${stableIdentityHash(`${item.name ?? ''}\u0000${getLabelsKey(labels)}`)}`,
          refId,
          name: item.name,
          metric: labels,
          data: item.samples,
          mode: 'timeSeries',
          target,
          isExp: isExpressionTarget(target),
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
