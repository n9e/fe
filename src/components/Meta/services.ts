import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

export interface BaseParams {
  cate: string;
  datasource_id: number;
}

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
