/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { Record, PostRecord, Filter } from './types';

export type { Record, PostRecord, Filter } from './types';

export const getMetrics = function (
  params: Filter & {
    limit: number;
    p: number;
  },
): Promise<{
  list: Record[];
  total: number;
}> {
  return request('/api/n9e/builtin-metrics', {
    method: RequestMethod.Get,
    params: {
      ...params,
      unit: _.join(params.unit, ','),
    },
  }).then((res) => res.dat);
};

export const postMetrics = function (data): Promise<{
  [key: string]: string;
}> {
  return request('/api/n9e/builtin-metrics', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const putMetric = function (data: Record) {
  return request('/api/n9e/builtin-metrics', {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteMetrics = function (ids: number[]): Promise<any> {
  return request('/api/n9e/builtin-metrics', {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const getTypes = function (params?: { collector?: string; query?: string }): Promise<string[]> {
  return request('/api/n9e/builtin-metrics/types', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const getDefaultTypes = function (params?: { collector?: string; query?: string }): Promise<string[]> {
  return request('/api/n9e/builtin-metrics/types/default', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const getCollectors = function (params?: { typ?: string; query?: string }): Promise<string[]> {
  return request('/api/n9e/builtin-metrics/collectors', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const getFilters = function (): Promise<any[]> {
  return request('/api/n9e/builtin-metric-filters', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postFilter = function (data): Promise<any> {
  return request('/api/n9e/builtin-metric-filters', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const putFilter = function (data): Promise<any> {
  return request('/api/n9e/builtin-metric-filters', {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

export const deleteFilter = function (data): Promise<any> {
  return request('/api/n9e/builtin-metric-filters', {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res.dat);
};

export const buildLabelFilterAndExpression = function (data): Promise<any> {
  return request('/api/n9e/builtin-metric-promql', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
