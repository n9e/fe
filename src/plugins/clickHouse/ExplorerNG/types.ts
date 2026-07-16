import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import { Field as BaseField } from '@/pages/logExplorer/types';

export type HandleValueFilterParams = (params: OnValueFilterParams) => void;

export interface FilterConfig {
  logic?: 'and' | 'or';
  field?: string;
  operator?: string;
  value?: string | number | boolean | null | Array<string | number | boolean | null>;
  not?: boolean;
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
