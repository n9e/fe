import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DorisDBParams, DorisDBTableParams, Field } from './types';

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
  }).then((res) => res.dat || []);
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
      from: number;
      to: number;
      lines: number;
      offset: number;
      reverse: boolean;
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
