import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';
import { BaseParams } from './types';

export function getDatabases(data: BaseParams): Promise<string[]> {
  return request('/api/n9e/db-databases', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getTables(
  data: BaseParams & {
    query: string[];
  },
): Promise<string[]> {
  return request('/api/n9e/db-tables', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getColumns(
  data: BaseParams & {
    query: {
      database: string;
      table: string;
    }[];
  },
): Promise<
  {
    field: string;
    type: string;
    type2: string;
  }[]
> {
  return request('/api/n9e/db-desc-table', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
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
  return request('/api/n9e/query-batch', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat);
};
