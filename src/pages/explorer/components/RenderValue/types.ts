import { DatasourceCateEnum } from '@/utils/constant';
export interface IFieldSearch {
  cate?: DatasourceCateEnum;
  datasource_id?: number;
  /**
   * loki没有resource的检索参数
   */
  resource?: Resource;
  query?: string;
  [key: string]: any;
}

/**
 * loki没有resource的检索参数
 */
export interface Resource {
  es_resource?: EsResource;
  sls_resource?: SlsResource;
  doris_resource?: DorisResource;
  bls_resource?: BlsResource;
}

export interface EsResource {
  index: string;
}

export interface SlsResource {
  logstore: string;
  project: string;
}

export interface DorisResource {
  database: string;
  table: string;
}

export interface BlsResource {
  project: string;
  logstore: string;
  logstream: string;
}
