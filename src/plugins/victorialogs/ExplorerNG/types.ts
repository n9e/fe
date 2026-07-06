import { Field as BaseField } from '@/pages/logExplorer/types';

export interface Field extends BaseField {
  normalized_type?: string;
}

export type ExplorerMode = 'raw' | 'metric';
export type BuilderStatus = 'synced' | 'stale' | 'unavailable';
export type QuerySource = 'builder' | 'code';

export interface VictoriaLogsFilter {
  id: string;
  field: string;
  op: 'eq' | 'neq' | 'contains' | 'not_contains' | 'regex' | 'not_regex' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'not_exists';
  value?: string | number | boolean;
  valueType?: 'string' | 'number' | 'boolean' | 'unknown';
  fieldSource?: 'stream' | 'log' | 'inferred';
}

export interface VictoriaLogsRawBuilderState {
  filters: VictoriaLogsFilter[];
}

export interface VictoriaLogsAggregation {
  id: string;
  func: 'count' | 'count_uniq' | 'sum' | 'avg' | 'min' | 'max' | 'quantile';
  field?: string;
  alias?: string;
  params?: {
    quantile?: number;
  };
}

export interface VictoriaLogsOrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

export interface VictoriaLogsMetricBuilderState {
  filters: VictoriaLogsFilter[];
  aggregations: VictoriaLogsAggregation[];
  groupBy?: string[];
  orderBy?: VictoriaLogsOrderBy[];
  limit?: number;
  vizType: 'table' | 'timeseries';
}

export interface VictoriaLogsBuilderState {
  raw?: VictoriaLogsRawBuilderState;
  metric?: VictoriaLogsMetricBuilderState;
}

export interface VictoriaLogsQuery {
  mode?: ExplorerMode;
  query?: string;
  range?: any;
  builder?: VictoriaLogsBuilderState;
  builderStatus?: BuilderStatus;
  querySource?: QuerySource;
  vizType?: 'table' | 'timeseries';
  keys?: {
    valueKey?: string[];
    labelKey?: string[];
  };
}

export interface HistogramValue {
  ref?: string;
  metric?: Record<string, string>;
  values: [number, number | null][];
}

export interface DataResp {
  ref?: string;
  refId?: string;
  metric?: Record<string, string>;
  values?: [number, number | string | null][];
}

export interface FieldNameSuggestion {
  field: string;
  type?: 'string' | 'number' | 'boolean' | 'unknown';
  builtin?: boolean;
}

export interface FieldValueSuggestion {
  value: string;
  count?: number;
}
