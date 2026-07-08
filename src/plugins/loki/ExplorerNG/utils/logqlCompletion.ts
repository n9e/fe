import moment from 'moment';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';

import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';

import { getLabelNames, getLabelValues } from '../services';
import { getLogQLCompletionContext, LokiCompletionContext } from './logqlCompletionContext';
import { buildCompletionCacheKey, LokiCompletionCache, normalizeCompletionQuery } from './logqlCompletionCache';

const REMOTE_DEBOUNCE_WAIT = 500;
const completionCache = new LokiCompletionCache<any[]>({ ttlMs: 60 * 1000, maxSize: 300 });
const remoteSequences = new Map<string, number>();
const lastCompletionOptions = new Map<string, Completion[]>();

const staticItems: Completion[] = [
  'count_over_time',
  'rate',
  'bytes_rate',
  'bytes_over_time',
  'absent_over_time',
  'sum_over_time',
  'avg_over_time',
  'min_over_time',
  'max_over_time',
  'quantile_over_time',
  'sum',
  'avg',
  'min',
  'max',
  'count',
  'topk',
  'bottomk',
].map((label) => ({ label, type: 'function', detail: 'LogQL' }));

const keywordItems: Completion[] = ['by', 'without', 'unwrap'].map((label) => ({ label, type: 'keyword', detail: 'LogQL' }));
const parserItems: Completion[] = ['json', 'logfmt', 'pattern', 'regexp'].map((label) => ({ label, type: 'constant', detail: 'parser' }));
const operatorItems: Completion[] = ['|=', '|~', '!=', '!~'].map((label) => ({ label, type: 'operator', detail: 'pipeline' }));
const allStaticItems = [...staticItems, ...keywordItems, ...parserItems, ...operatorItems];

export interface LokiCompletionSourceParams {
  datasourceValue?: number;
  range?: any;
}

function getRangeMs(range: any) {
  if (!range) return undefined;
  const parsed = parseRange(range);
  return {
    start: moment(parsed.start).valueOf(),
    end: moment(parsed.end).valueOf(),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function debounceRemote(scope: string) {
  const next = (remoteSequences.get(scope) || 0) + 1;
  remoteSequences.set(scope, next);
  await delay(REMOTE_DEBOUNCE_WAIT);
  return remoteSequences.get(scope) === next;
}

function toResult(context: LokiCompletionContext, options: Completion[]): CompletionResult | null {
  if (context.type === 'none') return null;
  return {
    from: context.from,
    to: context.to,
    options,
    span: /^[A-Za-z0-9_:.|!~=-]*$/,
  } as CompletionResult;
}

function normalizeQueryForRequest(query?: string) {
  const normalized = normalizeCompletionQuery(query);
  return normalized === '{}' ? undefined : normalized;
}

function labelFieldsToCompletions(fields: any[]) {
  return fields.map((item) => ({ label: item.field, type: 'variable', detail: 'label' }));
}

function labelValuesToCompletions(values: any[], label: string) {
  return values.map((item) => ({ label: item.value, apply: item.value, type: 'constant', detail: label }));
}

async function getLabelNameCompletions(params: LokiCompletionSourceParams, context: Extract<LokiCompletionContext, { type: 'label_name' | 'grouping_label' }>) {
  const range = getRangeMs(params.range);
  if (!params.datasourceValue || !range) return [];

  const cacheKey = buildCompletionCacheKey({ datasourceId: params.datasourceValue, type: context.type, query: context.selectorQuery, keyword: context.keyword });
  const scope = buildCompletionCacheKey({ datasourceId: params.datasourceValue, type: context.type, query: context.selectorQuery });
  const cachedFields = completionCache.get(cacheKey);
  if (cachedFields) {
    const options = labelFieldsToCompletions(cachedFields);
    lastCompletionOptions.set(scope, options);
    return options;
  }

  const shouldContinue = await debounceRemote(scope);
  if (!shouldContinue) return lastCompletionOptions.get(scope) || [];

  const fields = await completionCache.getOrFetch(cacheKey, () =>
    getLabelNames({
      cate: DatasourceCateEnum.loki,
      datasource_id: params.datasourceValue!,
      query: normalizeQueryForRequest(context.selectorQuery),
      start: range.start,
      end: range.end,
      filter: context.keyword,
      limit: 100,
    }),
  );
  const options = labelFieldsToCompletions(fields);
  lastCompletionOptions.set(scope, options);
  return options;
}

async function getLabelValueCompletions(params: LokiCompletionSourceParams, context: Extract<LokiCompletionContext, { type: 'label_value' }>) {
  const range = getRangeMs(params.range);
  if (!params.datasourceValue || !range || !context.label) return [];

  const cacheKey = buildCompletionCacheKey({
    datasourceId: params.datasourceValue,
    type: context.type,
    query: context.selectorQuery,
    label: context.label,
    keyword: context.keyword,
  });
  const scope = buildCompletionCacheKey({ datasourceId: params.datasourceValue, type: context.type, query: context.selectorQuery, label: context.label });
  const cachedValues = completionCache.get(cacheKey);
  if (cachedValues) {
    const options = labelValuesToCompletions(cachedValues, context.label);
    lastCompletionOptions.set(scope, options);
    return options;
  }

  const shouldContinue = await debounceRemote(scope);
  if (!shouldContinue) return lastCompletionOptions.get(scope) || [];

  const values = await completionCache.getOrFetch(cacheKey, () =>
    getLabelValues({
      cate: DatasourceCateEnum.loki,
      datasource_id: params.datasourceValue!,
      query: normalizeQueryForRequest(context.selectorQuery),
      start: range.start,
      end: range.end,
      label: context.label,
      filter: context.keyword,
      limit: 100,
    }),
  );
  const options = labelValuesToCompletions(values, context.label);
  lastCompletionOptions.set(scope, options);
  return options;
}

function getStaticCompletions(keyword: string) {
  const lower = keyword.toLowerCase();
  if (!lower) return allStaticItems;
  return allStaticItems.filter((item) => item.label.toLowerCase().includes(lower));
}

export function createLokiLogQLCompletionSource(getParams: () => LokiCompletionSourceParams) {
  return async (completionContext: CompletionContext): Promise<CompletionResult | null> => {
    const doc = completionContext.state.doc.toString();
    const context = getLogQLCompletionContext(doc, completionContext.pos);
    if (context.type === 'none') return null;

    if (context.type === 'static') {
      return toResult(context, getStaticCompletions(context.keyword));
    }

    const params = getParams();
    try {
      if (context.type === 'label_name' || context.type === 'grouping_label') {
        const options = await getLabelNameCompletions(params, context);
        return options ? toResult(context, options) : null;
      }
      if (context.type === 'label_value') {
        const options = await getLabelValueCompletions(params, context);
        return options ? toResult(context, options) : null;
      }
    } catch (e) {
      return toResult(context, []);
    }

    return null;
  };
}
