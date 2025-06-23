import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DorisDBParams, DorisDBTableParams, DorisDBTableDescParams, IStatCalcMethod } from './types';
import moment from 'moment';

export const getDorisDatabases = (data: DorisDBParams): Promise<string[]> => {
  return request('/api/n9e-plus/db-databases', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getDorisTables = (data: DorisDBTableParams): Promise<string[]> => {
  return request('/api/n9e-plus/db-tables', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getDorisTableDesc = (data: DorisDBTableDescParams): Promise<{ field: string; type: string; type2: string }[]> => {
  return request('/api/n9e-plus/db-desc-table', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const generateSQL = ({
  table,
  time_field,
  from,
  to,
  condition,
  limit,
  offset,
}: {
  table: string;
  time_field: string;
  from: string;
  to: string;
  condition?: string;
  offset: number;
  limit: number;
}) => {
  return `SELECT * from ${table} WHERE ${time_field} BETWEEN '${from}' AND '${to}' ${
    condition ? `AND ${condition}` : ''
  } ORDER by ${time_field} DESC LIMIT ${limit} OFFSET ${offset};`;
};

export const generateCount = ({ table, time_field, from, to, condition }: { table: string; time_field: string; from: number; to: number; condition?: string }) => {
  const base = `SELECT count() as cnt from ${table}
	WHERE ${time_field} BETWEEN FROM_UNIXTIME(${from}) AND FROM_UNIXTIME(${to})
       `;
  return condition ? base + `AND ${condition};` : base + ';';
};

export const generateHistogram = ({ table, time_field, from, to, condition }: { table: string; time_field: string; from: number; to: number; condition?: string }) => {
  let max = 60; // 最多60个柱子
  let interval = (to - from) / max;
  interval = interval - (interval % 10);
  if (interval <= 0) {
    interval = 60;
  }
  return `SELECT count() as cnt,
	FLOOR(UNIX_TIMESTAMP(${time_field}) / ${interval}) * ${interval} AS __ts__
		FROM ${table}
	WHERE ${time_field} BETWEEN FROM_UNIXTIME(${from}) AND FROM_UNIXTIME(${to})
    ${condition ? `AND ${condition}` : ''}
	GROUP BY __ts__;`;
};

export const statisticsGraphSQl = ({ table, calcMethod, field, time_field }: { table: string; calcMethod: IStatCalcMethod; field: string; time_field: string }) => {
  const from = moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
  const to = moment().format('YYYY-MM-DD HH:mm:ss');
  switch (calcMethod) {
    case IStatCalcMethod.count:
      return `SELECT COUNT() AS value, DATE_FORMAT(date, '%Y-%m-%d %H:%i:00') AS __ts__ FROM nginx_access_log WHERE ${time_field} BETWEEN '${from}' AND '${to}' GROUP BY __ts__`;
    case IStatCalcMethod.max:
    case IStatCalcMethod.min:
    case IStatCalcMethod.avg:
    case IStatCalcMethod.sum:
      return `SELECT ${calcMethod}(${field}) AS value, DATE_FORMAT(date, '%Y-%m-%d %H:%i:00') AS __ts__ FROM ${table} WHERE ${time_field} BETWEEN '${from}' AND '${to}' GROUP BY __ts__`;
    case IStatCalcMethod.p75:
      return `SELECT percentile(${field}, 0.75) AS value, DATE_FORMAT(date, '%Y-%m-%d %H:%i:00') AS __ts__ FROM ${table} WHERE ${time_field} BETWEEN '${from}' AND '${to}' GROUP BY __ts__`;
  }
};

export const logQuery = function (data: any) {
  return request('/api/n9e-plus/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const dsQuery = function (data: any) {
  return request('/api/n9e-plus/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
