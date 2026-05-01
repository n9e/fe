import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DatasourceCateEnum } from '@/utils/constant';
import { BaseParams } from './types';

const getDatasourceCate = (cate?: string) => encodeURIComponent(cate || DatasourceCateEnum.iotdb);

export function getDatabases(data: BaseParams): Promise<string[]> {
  return request(`/api/n9e/${getDatasourceCate(data.cate)}-databases`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getTables(
  data: BaseParams & {
    db: string;
  },
): Promise<string[]> {
  return request(`/api/n9e/${getDatasourceCate(data.cate)}-tables`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getColumns(
  data: BaseParams & {
    db: string;
    table: string;
  },
): Promise<
  {
    name: string;
    type: string;
    size: number;
  }[]
> {
  return request(`/api/n9e/${getDatasourceCate(data.cate)}-columns`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat || [];
  });
}

export function getDsQuery(
  data: BaseParams & {
    query: {
      query: string;
      from: string;
      to: string;
      keys: {
        metricKey: string;
        labelKey: string;
        timeKey?: string;
        timeFormat: string;
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

export function getLogsQuery(
  data: BaseParams & {
    query: {
      query: string;
      from: string;
      to: string;
      keys: {
        timeFormat: string;
      };
    }[];
  },
): Promise<any> {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function getSqlTemplate(cate?: string): Promise<{ [index: string]: string }> {
  return request(`/api/n9e/sql-template?cate=${getDatasourceCate(cate)}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}
