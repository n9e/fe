import _ from 'lodash';
import { Span, TraceProcess, TraceSortItem, INanoSecond, TraceResponse, Trace, TraceSpan, TraceKeyValuePair } from '../type';
import TreeNode from './TreeNode';
import { getTraceSpanIdsAsTree } from './trace';

export function _getTraceNameImpl(spans: Span[]) {
  let candidateSpan: Span | undefined;
  const allIDs: Set<string> = new Set(spans.map(({ spanID }) => spanID));

  for (let i = 0; i < spans.length; i++) {
    const hasInternalRef = spans[i].references && spans[i].references.some(({ traceID, spanID }) => traceID === spans[i].traceID && allIDs.has(spanID));
    if (hasInternalRef) continue;

    if (!candidateSpan) {
      candidateSpan = spans[i];
      continue;
    }

    const thisRefLength = (spans[i].references && spans[i].references.length) || 0;
    const candidateRefLength = (candidateSpan.references && candidateSpan.references.length) || 0;

    if (thisRefLength < candidateRefLength || (thisRefLength === candidateRefLength && spans[i].startTime < candidateSpan.startTime)) {
      candidateSpan = spans[i];
    }
  }
  return candidateSpan ? `${candidateSpan.process.serviceName}: ${candidateSpan.operationName}` : '';
}

export const getTraceName = _.memoize(_getTraceNameImpl, (spans: Span[]) => {
  if (!spans.length) return 0;
  return spans[0].traceID;
});

export const getStartTime = (spans: Span[]): INanoSecond => {
  return Math.min.apply(
    null,
    spans.map((span) => span.start_time_unix_nano),
  );
};

export function transformTraceData(data?: TraceResponse): Trace | null {
  if (!data?.traceID) {
    return null;
  }
  const traceID = data.traceID.toLowerCase();

  let traceEndTime = 0;
  let traceStartTime = Number.MAX_SAFE_INTEGER;
  const spanIdCounts = new Map();
  const spanMap = new Map<string, TraceSpan>();
  // filter out spans with empty start times
  // eslint-disable-next-line no-param-reassign
  data.spans = data.spans.filter((span) => Boolean(span.startTime));

  // Sort process tags
  data.processes = Object.entries(data.processes).reduce<Record<string, TraceProcess>>((processes, [id, process]) => {
    processes[id] = {
      ...process,
      tags: orderTags(process.tags),
    };
    return processes;
  }, {});

  const max = data.spans.length;
  for (let i = 0; i < max; i++) {
    const span: TraceSpan = data.spans[i] as TraceSpan;
    const { startTime, duration, processID } = span;

    let spanID = span.spanID;
    // check for start / end time for the trace
    if (startTime < traceStartTime) {
      traceStartTime = startTime;
    }
    if (startTime + duration > traceEndTime) {
      traceEndTime = startTime + duration;
    }
    // make sure span IDs are unique
    const idCount = spanIdCounts.get(spanID);
    if (idCount != null) {
      // eslint-disable-next-line no-console
      console.warn(`Dupe spanID, ${idCount + 1} x ${spanID}`, span, spanMap.get(spanID));
      if (_.isEqual(span, spanMap.get(spanID))) {
        // eslint-disable-next-line no-console
        console.warn('\t two spans with same ID have `isEqual(...) === true`');
      }
      spanIdCounts.set(spanID, idCount + 1);
      spanID = `${spanID}_${idCount}`;
      span.spanID = spanID;
    } else {
      spanIdCounts.set(spanID, 1);
    }
    span.process = data.processes[processID];
    spanMap.set(spanID, span);
  }
  // tree is necessary to sort the spans, so children follow parents, and
  // siblings are sorted by start time
  const tree = getTraceSpanIdsAsTree(data);
  const spans: TraceSpan[] = [];
  const svcCounts: Record<string, number> = {};

  // Eslint complains about number type not needed but then TS complains it is implicitly any.
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  tree.walk((spanID: string | number | undefined, node: TreeNode, depth: number = 0) => {
    if (spanID === '__root__') {
      return;
    }
    if (typeof spanID !== 'string') {
      return;
    }
    const span = spanMap.get(spanID) as TraceSpan;
    if (!span) {
      return;
    }
    const { serviceName } = span.process;
    svcCounts[serviceName] = (svcCounts[serviceName] || 0) + 1;
    span.relativeStartTime = span.startTime - traceStartTime;
    span.depth = depth - 1;
    span.hasChildren = node.children.length > 0;
    span.childSpanCount = node.children.length;
    span.warnings = span.warnings || [];
    span.tags = span.tags || [];
    span.references = span.references || [];
    const tagsInfo = deduplicateTags(span.tags);
    span.tags = orderTags(tagsInfo.tags);
    span.warnings = span.warnings.concat(tagsInfo.warnings);
    span.references.forEach((ref, index) => {
      const refSpan = spanMap.get(ref.spanID) as TraceSpan;
      if (refSpan) {
        // eslint-disable-next-line no-param-reassign
        ref.span = refSpan;
        if (index > 0) {
          // Don't take into account the parent, just other references.
          refSpan.subsidiarilyReferencedBy = refSpan.subsidiarilyReferencedBy || [];
          refSpan.subsidiarilyReferencedBy.push({
            spanID,
            traceID,
            span,
            refType: ref.refType,
          });
        }
      }
    });
    spans.push(span);
  });
  const traceName = getTraceName(spans as any);
  const services = Object.keys(svcCounts).map((name) => ({ name, numberOfSpans: svcCounts[name] }));
  return {
    services,
    spans,
    traceID,
    traceName,
    // can't use spread operator for intersection types
    // repl: https://goo.gl/4Z23MJ
    // issue: https://github.com/facebook/flow/issues/1511
    processes: data.processes,
    duration: traceEndTime - traceStartTime,
    startTime: traceStartTime,
    endTime: traceEndTime,
  };
}

export function deduplicateTags(spanTags: TraceKeyValuePair[]) {
  const warningsHash: Map<string, string> = new Map<string, string>();
  const tags: TraceKeyValuePair[] = spanTags.reduce<TraceKeyValuePair[]>((uniqueTags, tag) => {
    if (!uniqueTags.some((t) => t.key === tag.key && t.value === tag.value)) {
      uniqueTags.push(tag);
    } else {
      warningsHash.set(`${tag.key}:${tag.value}`, `Duplicate tag "${tag.key}:${tag.value}"`);
    }
    return uniqueTags;
  }, []);
  const warnings = Array.from(warningsHash.values());
  return { tags, warnings };
}

export function orderTags(spanTags: TraceKeyValuePair[], topPrefixes?: string[]) {
  const orderedTags: TraceKeyValuePair[] = spanTags?.slice() ?? [];
  const tp = (topPrefixes || []).map((p: string) => p.toLowerCase());

  orderedTags.sort((a, b) => {
    const aKey = a.key.toLowerCase();
    const bKey = b.key.toLowerCase();

    for (let i = 0; i < tp.length; i++) {
      const p = tp[i];
      if (aKey.startsWith(p) && !bKey.startsWith(p)) {
        return -1;
      }
      if (!aKey.startsWith(p) && bKey.startsWith(p)) {
        return 1;
      }
    }

    if (aKey > bKey) {
      return 1;
    }
    if (aKey < bKey) {
      return -1;
    }
    return 0;
  });

  return orderedTags;
}

const comparators: Record<keyof typeof TraceSortItem, (a: Trace, b: Trace) => number> = {
  MOST_RECENT: (a, b) => +(b.startTime > a.startTime) || +(a.startTime === b.startTime) - 1,
  SHORTEST_FIRST: (a, b) => +(a.duration > b.duration) || +(a.duration === b.duration) - 1,
  LONGEST_FIRST: (a, b) => +(b.duration > a.duration) || +(a.duration === b.duration) - 1,
  MOST_SPANS: (a, b) => +(b.spans.length > a.spans.length) || +(a.spans.length === b.spans.length) - 1,
  LEAST_SPANS: (a, b) => +(a.spans.length > b.spans.length) || +(a.spans.length === b.spans.length) - 1,
};

export function sortTraces(traces: Trace[], sortBy: keyof typeof TraceSortItem): Trace[] {
  const comparator = comparators[sortBy] || comparators[TraceSortItem.LONGEST_FIRST];
  return traces.sort(comparator);
}

export type ViewedBoundsFunctionType = (start: number, end: number) => { start: number; end: number };
/**
 * Given a range (`min`, `max`) and factoring in a zoom (`viewStart`, `viewEnd`)
 * a function is created that will find the position of a sub-range (`start`, `end`).
 * The calling the generated method will return the result as a `{ start, end }`
 * object with values ranging in [0, 1].
 *
 * @param  {number} min       The start of the outer range.
 * @param  {number} max       The end of the outer range.
 * @param  {number} viewStart The start of the zoom, on a range of [0, 1],
 *                            relative to the `min`, `max`.
 * @param  {number} viewEnd   The end of the zoom, on a range of [0, 1],
 *                            relative to the `min`, `max`.
 * @returns {(number, number) => Object} Created view bounds function
 */
export function createViewedBoundsFunc(viewRange: { min: number; max: number; viewStart: number; viewEnd: number }) {
  const { min, max, viewStart, viewEnd } = viewRange;
  const duration = max - min;
  const viewMin = min + viewStart * duration;
  const viewMax = max - (1 - viewEnd) * duration;
  const viewWindow = viewMax - viewMin;

  /**
   * View bounds function
   * @param  {number} start     The start of the sub-range.
   * @param  {number} end       The end of the sub-range.
   * @return {Object}           The resultant range.
   */
  return (start: number, end: number) => ({
    start: (start - viewMin) / viewWindow,
    end: (end - viewMin) / viewWindow,
  });
}
