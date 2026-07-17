import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import { Field as BaseField } from '@/pages/logExplorer/types';

export type HandleValueFilterParams = (params: OnValueFilterParams) => void;

// Negation is expressed via the operator (`!=`, `NOT IN`, `IS NOT NULL`,
// `NOT LIKE`, `NOT ILIKE`, `NOT BETWEEN AND`, `NOT match`) — there is no
// separate `not` flag. Mirrors the CK BE contract in
// plus/datasource/ck/ck.go:QueryBuilderFilterItem.
export interface FilterConfig {
  logic?: 'and' | 'or';
  field?: string;
  operator?: string;
  value?: string | number | boolean | null | Array<string | number | boolean | null>;
  disabled?: boolean;
}

export interface AggregateConfig {
  func?: string;
  field?: string;
  percentile?: number;
  precision?: number;
  n?: number;
  alias?: string;
}

export interface OrderByConfig {
  field?: string;
  direction?: 'asc' | 'desc';
}

export interface Field extends BaseField {
  normalized_type?: string;
}

export interface FieldSampleParams {
  cate: string;
  datasource_id: number;
  database: string;
  table: string;
  time_field: string;
  filters: FilterConfig[];
  from: number;
  to: number;
  limit: number;
}
