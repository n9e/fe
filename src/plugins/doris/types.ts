export interface InfluxDBBaseParams {
  cate: string;
  datasource_id: number;
}

export interface DorisDBParams extends InfluxDBBaseParams {}

export interface DorisDBTableParams extends DorisDBParams {
  query: string[];
}

export interface DorisDBTableDescParams extends DorisDBParams {
  query: { database: string; table: string }[];
}

export interface ITreeSelect {
  db: string;
  table: string;
  field?: string;
}

export enum IStatCalcMethod {
  count = 'count',
  max = 'max',
  min = 'min',
  avg = 'avg',
  sum = 'sum',
  p75 = 'p75',
}
