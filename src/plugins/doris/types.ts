export interface InfluxDBBaseParams {
  cate: string;
  datasource_id: number;
}

export interface DorisDBParams extends InfluxDBBaseParams {}

export interface DorisDBTableParams extends DorisDBParams {
  query: string[];
}

export interface ITreeSelect {
  db: string;
  table: string;
  field?: string;
}

export interface Field {
  field: string;
  indexable: boolean;
  type: string;
  type2?: string;
}
