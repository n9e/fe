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
  victorialogs_resource?: VictoriaLogsResource;
  clickhouse_resource?: ClickHouseResource;
  cls_resource?: ClsResource;
  lts_resource?: LtsResource;
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

export interface VictoriaLogsResource {
  field_filters: {
    key: string;
    op: string;
    values: string[];
  }[];
}

export interface ClickHouseResource {
  database: string;
  table: string;
}

export interface ClsResource {
  logset_id: string;
  topic_id: string;
  logset_name?: string;
  topic_name?: string;
}

export interface LtsResource {
  group_id: string;
  stream_id: string;
  group_name?: string;
  stream_name?: string;
}
