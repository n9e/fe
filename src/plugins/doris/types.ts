import { Field as BaseField } from '@/pages/logExplorer/types';

export interface BaseParams {
  cate: string;
  datasource_id: number;
}

export interface DorisDBParams extends BaseParams {}

export interface DorisDBTableParams extends DorisDBParams {
  query: string[];
}

export interface ITreeSelect {
  db: string;
  table: string;
  field?: string;
}
