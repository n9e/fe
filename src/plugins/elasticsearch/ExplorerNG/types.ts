import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import { Field as BaseField } from '@/pages/logExplorer/types';

export type HandleValueFilterParams = (params: OnValueFilterParams) => void;

export interface Field extends BaseField {
  searchable?: boolean;
  operators?: string[];
  aggregatable?: boolean;
  normalized_type?: string;
}

export interface Filter {
  key: string;
  value: string;
  operator: string;
}

export interface Interval {
  value: number;
  unit: 'second' | 'min' | 'hour' | 'day';
}

export interface FilterConfig {
  field?: string;
  operator?: string;
  value?: string | number | Array<string | number>;
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

export interface FieldSampleParams {
  datasource_id: number;
  index: string;
  date_field: string;
  filters: FilterConfig[];
  from: number;
  to: number;
  limit: number;
}

export interface ClusterInfo {
  supportsSQL: boolean;
  version?: string;
}
