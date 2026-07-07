import { Field as BaseField } from '@/pages/logExplorer/types';

export interface Field extends BaseField {
  normalized_type?: string;
}

export interface LokiLabelMatcher {
  id: string;
  label: string;
  op: '=' | '!=' | '=~' | '!~';
  value?: string;
}

export interface LokiLineFilter {
  id: string;
  op: '|=' | '!=' | '|~' | '!~';
  value?: string;
}

export interface LokiParser {
  type?: 'json' | 'logfmt' | 'regexp' | 'pattern';
  expression?: string;
}

export interface LokiParsedFieldFilter {
  id: string;
  field: string;
  op: '=' | '!=' | '=~' | '!~' | '>' | '>=' | '<' | '<=';
  value?: string | number;
}

export interface LokiRawBuilderState {
  labels: LokiLabelMatcher[];
  lineFilters?: LokiLineFilter[];
  parser?: LokiParser;
  parsedFieldFilters?: LokiParsedFieldFilter[];
  limit?: number;
}

export interface LokiMetricBuilderState extends LokiRawBuilderState {
  rangeFunc?: 'count_over_time' | 'rate' | 'bytes_over_time' | 'bytes_rate' | 'sum_over_time' | 'avg_over_time' | 'min_over_time' | 'max_over_time' | 'quantile_over_time';
  range?: string;
  rangeParam?: number;
  unwrapField?: string;
  vectorAgg?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'topk' | 'bottomk';
  vectorParam?: number;
  groupBy?: string[];
  vizType: 'table' | 'timeseries';
}

export interface LokiLogRow {
  timestamp: number;
  __timestamp__?: string;
  line: string;
  stream: Record<string, string>;
  ___id___?: string;
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
  inferred_type?: string;
  values?: string[];
}

export interface FieldValueSuggestion {
  value: string;
}
