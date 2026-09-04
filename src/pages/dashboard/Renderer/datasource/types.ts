import type { ITarget } from '@/pages/dashboard/types';
import type { IRawTimeRange } from '@/components/TimeRangePicker';

export type DashboardQueryResultType = 'time_series' | 'logs';

export interface DatasourceQuery<TQuery = unknown> {
  kind: 'query';
  ref_id: string;
  datasource: {
    cate: string;
    id: number;
  };
  result_type: DashboardQueryResultType;
  query: TQuery;
}

export interface ExpressionQuery {
  kind: 'expression';
  ref_id: string;
  expression: string;
}

export interface DashboardQueryRequest {
  from: number;
  to: number;
  queries: Array<DatasourceQuery | ExpressionQuery>;
}

export interface TimeSeriesResult {
  ref_id: string;
  status: 'success';
  result_type: 'time_series';
  series: Array<{
    id?: string;
    name?: string;
    labels?: Record<string, string>;
    samples: Array<[timestampSeconds: number, value: number | null]>;
  }>;
}

export interface LogsResult {
  ref_id: string;
  status: 'success';
  result_type: 'logs';
  records: Array<{
    id?: string;
    fields?: Record<string, unknown>;
  }>;
}

export interface FailedResult {
  ref_id: string;
  status: 'error' | 'skipped';
  error: {
    code: string;
    message: string;
    retryable: boolean;
    dependency_ref_ids?: string[];
  };
}

export type DashboardQueryResult = TimeSeriesResult | LogsResult | FailedResult;

export interface DashboardQueryResponse {
  results: DashboardQueryResult[];
}

export interface NormalizedDashboardQueryResponse {
  series: DashboardSeries[];
  errorsByRef: Record<string, FailedResult['error']>;
}

export interface DashboardTimeSeries {
  id: string;
  refId: string;
  name?: string;
  metric: Record<string, string>;
  data: Array<[timestampSeconds: number, value: number | null]>;
  mode: 'timeSeries';
  target?: ITarget;
  isExp: boolean;
  bucketInterval?: number;
}

export interface DashboardLogSeries {
  id: string;
  refId: string;
  metric: Record<string, unknown>;
  data: [];
  mode: 'raw';
  target?: ITarget;
}

export type DashboardSeries = DashboardTimeSeries | DashboardLogSeries;

export interface DashboardInspectQuery {
  type: 'Dashboard Query';
  request: {
    url: string;
    method: 'POST';
    data: DashboardQueryRequest;
  };
  response: DashboardQueryResponse;
}

export interface DashboardQueryState {
  query: DashboardInspectQuery[];
  series: DashboardSeries[];
  errorsByRef: Record<string, FailedResult['error']>;
  error: string;
  loading: boolean;
  loaded: boolean;
  range: IRawTimeRange;
  revision: number;
}

export type DashboardPanelTarget = ITarget;
