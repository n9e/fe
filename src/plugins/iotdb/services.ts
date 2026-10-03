import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
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
