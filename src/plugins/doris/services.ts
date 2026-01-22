import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DorisDBParams, DorisDBTableParams } from './types';
import { Field, FieldSampleParams, FilterConfig, AggregateConfig } from './ExplorerNG/types';

export type { Field };

export const getDorisDatabases = (data: DorisDBParams): Promise<string[]> => {
  return request('/api/n9e/db-databases', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getDorisTables = (data: DorisDBTableParams): Promise<string[]> => {
  return request('/api/n9e/db-tables', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const logQuery = function (data: any) {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const dsQuery = function (data: any) {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export interface BaseParams {
  cate: string;
  datasource_id: number;
}

export function getDsQuery(
  data: BaseParams & {
    query: {
      sql: string;
      from: number;
      to: number;
      keys: {
        valueKey: string;
        labelKey: string;
      };
    }[];
  },
): Promise<any> {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getLogsQuery(data: {
  queries: {
    ds_cate: string;
    ds_id: number;
    ref: string;
    query: {
      ref: string;
      from: number;
      to: number;
      sql: string;
    };
  }[];
}): Promise<
  {
    ds_cate: string;
    ds_id: number;
    ref: string;
    data: { [index: string]: string | number }[];
  }[]
> {
  return request('/api/n9e/log-query-batch', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return res?.dat?.list || [];
  });
}

export function getDorisFields(data: BaseParams & { database: string; table: string }): Promise<string[]> {
  return request('/api/n9e-plus/doris-fields', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getDorisIndex(data: BaseParams & { database: string; table: string }): Promise<Field[]> {
  return request('/api/n9e-plus/doris-index', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getDorisHistogram(data: {
  cate: string;
  datasource_id: number;
  query: [
    {
      database: string;
      table: string;
      time_field: string;
      from: number;
      to: number;
      query: string;
      query_builder_filter?: FilterConfig[];
      group_by?: string;
      default_field?: string;
    },
  ];
}): Promise<any[]> {
  return request('/api/n9e-plus/doris-histogram', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getDorisLogsQuery(data: {
  cate: string;
  datasource_id: number;
  query: [
    {
      database: string;
      table: string;
      time_field: string;
      query: string;
      query_builder_filter?: FilterConfig[];
      from: number;
      to: number;
      lines: number;
      offset: number;
      reverse: boolean;
      default_field?: string;
    },
  ];
}): Promise<{
  list: { [index: string]: string }[];
  total: number;
}> {
  return request('/api/n9e-plus/doris-logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || { list: [], total: 0 });
}

export const getDsQuery2 = function (data: {
  queries: {
    ref: string;
    ds_id: number;
    ds_cate: string;
    query: {
      from: number;
      to: number;
      sql: string;
      keys: {
        valueKey: string;
        labelKey: string;
      };
    };
  }[];
  exps: {
    ref: string;
    expr: string;
  }[];
}): Promise<
  {
    metric: { [index: string]: string };
    values: [number, number][];
  }[]
> {
  return request('/api/n9e-plus/query-batch', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat);
};

export function getDorisSQLFormat(data: {
  cate: string;
  datasource_id: number;
  query: [
    {
      database: string;
      table: string;
      time_field: string;
      query: string;
      from: number;
      to: number;
      lines: number;
      offset: number;
      reverse: boolean;
      default_field?: string;
    },
  ];
}): Promise<string> {
  return request('/api/n9e-plus/doris-sql-format', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function getDorisSQLsPreview(data: {
  cate: string;
  datasource_id: number;
  query: [
    {
      database: string;
      table: string;
      time_field: string;
      query: string;
      from: number;
      to: number;
      default_field?: string;
      group_by?: string; // topn 变化趋势

      func: string; // 'unique_count' | 'ratio' | 'max' | 'min' | 'avg' 等
      field?: string; // func 作用的字段
      field_filter?: string; // 选择 topn 项时带上的过滤条件
      ref?: string; // topn，只用于 ration 查询范围
    },
  ];
}): Promise<{
  origin: string;
  table: {
    sql: string;
  };
  timeseries: {
    [func: string]: {
      sql: string;
      value_key: string[];
      label_key?: string[];
    };
  };
}> {
  return request('/api/n9e-plus/doris-sqls-preview', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function getFiledSample(
  data: FieldSampleParams & {
    field: string;
  },
): Promise<string[]> {
  return request('/api/n9e-plus/doris-field-sample', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function buildSql(data: {
  cate: string;
  datasource_id: number;
  query: [
    {
      database: string;
      table: string;
      time_field: string;
      from: number;
      to: number;
      filters: FilterConfig[];
      aggregates: AggregateConfig[];
      mode: string; // table | timeseries
      group_by: string[];
      order_by: {
        field: string;
        direction: string;
      };
      limit: number;
    },
  ];
}): Promise<{
  sql: string;
  mode: string;
  value_keys: string[];
  label_keys: string[];
}> {
  return request('/api/n9e-plus/doris-query-builder', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}
