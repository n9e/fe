import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';
import { Field as BaseField } from '@/pages/logExplorer/types';

export type HandleValueFilterParams = (params: OnValueFilterParams) => void;

export interface Field extends BaseField {}

export interface Filter {
  key: string;
  value: string;
  operator: string;
}

export interface Interval {
  value: number;
  unit: 'second' | 'min' | 'hour' | 'day';
}
