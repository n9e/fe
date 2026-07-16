import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { AggregateConfig, Field, FieldSampleParams, FilterConfig } from './ExplorerNG/types';
import { BaseParams } from './types';

export type { Field };

export const getCKDatabases = (data: BaseParams): Promise<string[]> => {
  return request('/api/n9e/db-databases', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
};

export const getCKTables = (data: BaseParams & { query: string[] }): Promise<string[]> => {
  return request('/api/n9e/db-tables', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
};

// Keep the existing ClickHouse dashboard/alert/metadata API surface intact.
export const getDatabases = getCKDatabases;
export const getTables = getCKTables;

export function getColumns(
  data: BaseParams & {
    query: {
      database: string;
      table: string;
    }[];
  },
): Promise<{ field: string; type: string; type2: string }[]> {
  return request('/api/n9e/db-desc-table', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export const logQuery = function (data: any) {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export function getDsQuery(
  data: BaseParams & {
    query: {
      sql: string;
      from: number;
      to: number;
      keys: {
        valueKey: string[] | string;
        labelKey: string[] | string;
        timeKey?: string;
      };
    }[];
  },
): Promise<any> {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getLogsQuery(data: any): Promise<any[]> {
  return request('/api/n9e/log-query-batch', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res?.dat?.list || []);
}

export function getDsQuery2(data: any): Promise<any[]> {
  return request('/api/n9e-plus/query-batch', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat || []);
}

export function getCKFields(data: BaseParams & { database: string; table: string }): Promise<string[]> {
  return request('/api/n9e-plus/ck-fields', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getCKIndex(data: BaseParams & { database: string; table: string }): Promise<Field[]> {
  return request('/api/n9e-plus/ck-index', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

type CKQueryEnvelope<T> = BaseParams & { query: T[] };

export function getCKHistogram(
  data: CKQueryEnvelope<{
    database: string;
    table: string;
    time_field: string;
    from: number;
    to: number;
    query_builder_filter?: FilterConfig[];
    group_by?: string;
  }>,
): Promise<any[]> {
  return request('/api/n9e-plus/ck-histogram', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getCKLogsQuery(
  data: CKQueryEnvelope<{
    database: string;
    table: string;
    time_field: string;
    query_builder_filter?: FilterConfig[];
    from: number;
    to: number;
    lines?: number;
    offset?: number;
    reverse?: boolean;
    highlight?: boolean;
    field?: string;
    func?: string;
    ref?: string;
    group_by?: string;
    field_filter?: unknown;
  }>,
): Promise<{ list: Record<string, any>[]; total: number }> {
  return request('/api/n9e-plus/ck-logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || { list: [], total: 0 });
}

export function getCKSQLFormat(
  data: CKQueryEnvelope<{
    database: string;
    table: string;
    time_field: string;
    query_builder_filter?: FilterConfig[];
    from: number;
    to: number;
    lines?: number;
    offset?: number;
    reverse?: boolean;
  }>,
): Promise<string> {
  return request('/api/n9e-plus/ck-sql-format', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

/** Query-mode「SQL预览」— mirrors Doris getDorisSQLsPreview / /doris-sqls-preview. */
export function getCKSQLsPreview(
  data: CKQueryEnvelope<{
    database: string;
    table: string;
    time_field: string;
    query_builder_filter?: FilterConfig[];
    from: number;
    to: number;
    default_field?: string;
    func: string;
    field?: string;
    group_by?: string;
    field_filter?: unknown;
    ref?: string;
  }>,
): Promise<{
  origin: string;
  table: {
    sql: string;
    value_key?: string;
  };
  timeseries: {
    [func: string]: {
      sql: string;
      value_key: string[];
      label_key?: string[];
      type?: string;
      time_key?: string;
    };
  };
}> {
  return request('/api/n9e-plus/ck-sqls-preview', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function getFiledSample(data: FieldSampleParams & { field: string }): Promise<string[]> {
  const { filters, ...rest } = data;
  return request('/api/n9e-plus/ck-field-sample', {
    method: RequestMethod.Post,
    data: {
      ...rest,
      query_builder_filter: filters,
    },
  }).then((res) => (res.dat || []).map((value) => (value === null ? '' : String(value))));
}

export function buildSql(
  data: CKQueryEnvelope<{
    database: string;
    table: string;
    time_field: string;
    from: number;
    to: number;
    filters: FilterConfig[];
    aggregates: AggregateConfig[];
    mode: 'table' | 'timeseries';
    group_by: string[];
    order_by: {
      field: string;
      direction: string;
    }[];
    limit: number;
  }>,
): Promise<{
  sql: string;
  mode: string;
  value_key: string[];
  time_key?: string;
  label_key: string[];
}> {
  return request('/api/n9e-plus/ck-query-builder', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
}

export function getCKTableConfig(data: BaseParams & { database: string; table: string }): Promise<{
  histogram_stack_field?: string;
  default_time_field?: string;
}> {
  return request('/api/n9e-plus/ck-table-config', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || {});
}
