import _ from 'lodash';
import queryString from 'query-string';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { AccessTokenKey } from '@/utils/constant';

import { jsonLinesToJson } from './utils';

export type HitResult = {
  fields: {
    [index: string]: string;
  };
  timestamps: Date[];
  values: number[];
  total: number;
};

export const getHistogram = function (
  datasourceValue,
  params: {
    query: string;
    step: string;
    start: string;
    end: string;
    fields_limit: number; // 5
    field: string; // _stream
  },
): Promise<{
  hits: HitResult[];
}> {
  return request(`/api/n9e-plus/proxy/${datasourceValue}/select/logsql/hits`, {
    method: RequestMethod.Get,
    params,
  }).then(
    (res) =>
      res ?? {
        hits: [],
      },
  );
};

export const getLogsQuery = function (
  datasourceValue: number,
  params: {
    query: string;
    limit: number;
    start: string;
    end: string;
  },
): Promise<
  {
    [index: string]: string;
  }[]
> {
  return fetch(`/api/n9e-plus/proxy/${datasourceValue}/select/logsql/query?${queryString.stringify(params)}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`,
    },
  })
    .then((res) => {
      return res ?? [];
    })
    .then((res) => {
      return res.text();
    })
    .then((res) => {
      return jsonLinesToJson(res);
    });
};
