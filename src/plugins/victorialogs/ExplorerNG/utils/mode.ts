import _ from 'lodash';

import { METRIC_DEFAULT_QUERY, RAW_DEFAULT_QUERY } from '../constants';
import { classifyExplorerMode } from './logsQL';

/**
 * Resolve the view and query text that an Execute click should apply.
 *
 * - An aggregation query must open the statistical-chart view: raw logs cannot
 *   render pipes such as `stats`.
 * - Otherwise the view explicitly selected by the user wins. The previous code
 *   always overwrote it with the auto-classified mode, so switching to the chart
 *   view with an empty query silently jumped back to raw logs.
 * - An empty query in the chart view is filled with the default aggregation.
 */
export function resolveExecutedQuery(queryValues: Record<string, any> | undefined): {
  mode: 'raw' | 'metric';
  query: string | undefined;
} {
  const userQL = _.trim(queryValues?.query || '');
  const detected = classifyExplorerMode(userQL);
  const mode: 'raw' | 'metric' = detected === 'metric' ? 'metric' : queryValues?.mode || detected;
  const query = mode === 'metric' && !userQL ? METRIC_DEFAULT_QUERY : queryValues?.query;
  return { mode, query };
}

/**
 * Query text to use when switching to the statistical-chart view.
 *
 * - empty query / `*`: use the default aggregation so a chart appears immediately;
 * - already an aggregation: keep it;
 * - a plain filter query: keep the filters and append a default aggregation,
 *   otherwise the query becomes empty and the next Execute flips back to raw logs.
 */
export function buildMetricQueryOnSwitch(currentQL: string | undefined): string {
  const ql = (currentQL || '').trim();
  if (!ql || ql === RAW_DEFAULT_QUERY) return METRIC_DEFAULT_QUERY;
  if (classifyExplorerMode(ql) === 'metric') return ql;
  return `${ql} | stats count() as count`;
}
