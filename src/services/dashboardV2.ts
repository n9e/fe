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
import { N9E_PATHNAME } from '@/utils/constant';

// 仪表盘列表
export const getDashboards = function (id: number | string) {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

// 多个业务组的仪表盘列表
export const getBusiGroupsDashboards = function (gids?: string) {
  return request('/api/n9e/busi-groups/boards', {
    method: RequestMethod.Get,
    params: {
      gids,
    },
  }).then((res) => {
    return res.dat;
  });
};

export const getBusiGroupsPublicDashboards = function () {
  return request('/api/n9e/busi-groups/public-boards', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const updateBoardPublic = function (id: number, data: any) {
  return request(`/api/n9e/board/${id}/public`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
};

interface Dashboard {
  name: string;
  ident?: string;
  tags: string;
  configs?: string;
}
// 创建仪表盘
export const createDashboard = function (id: number, data: Dashboard) {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

// 克隆仪表盘
export const cloneDashboard = function (busiId: number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/board/${id}/clone`, {
    method: RequestMethod.Post,
  });
};

// 删除仪表盘
export const removeDashboards = function (ids: number[]) {
  return request(`/api/n9e/boards`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

// 导出仪表盘
// 仪表盘迁移页面需要
export const exportDashboard = function (busiId: number | string, ids: number[]) {
  return request(`/api/n9e/busi-group/${busiId}/dashboards/export`, {
    method: RequestMethod.Post,
    data: { ids },
  }).then((res) => {
    return res.dat;
  });
};

// 获取仪表盘详情
export const getDashboard = function (id: string | number) {
  return request(`/api/n9e/board/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

// 更新仪表盘 - 只能更新 name 和 tags
export const updateDashboard = function (id: string | number, data: { name: string; ident?: string; tags: string }) {
  return request(`/api/n9e/board/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

// 更新仪表盘 - 只能更新 configs
export const updateDashboardConfigs = function (id: string | number, data: { configs: string }) {
  return request(`/api/n9e/board/${id}/configs`, {
    method: RequestMethod.Put,
    data,
  });
};

// 更新仪表盘 - 只能更新 public
export const updateDashboardPublic = function (id: string | number, data: { public: number }) {
  return request(`/api/n9e/board/${id}/public`, {
    method: RequestMethod.Put,
    data,
  });
};

// boards v2 api
export const migrateDashboard = function (id: number, data: { name: string; tags: string; configs: string }) {
  return request(`/api/n9e/dashboard/${id}/migrate`, {
    method: RequestMethod.Put,
    data,
  });
};

// 以下是非仪表盘相关的接口

export const getBuiltinDashboard = function (data) {
  return request('/api/n9e/builtin-boards-detail', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const getDashboardPure = function (id: string) {
  return request(`/api/n9e/board/${id}/pure`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

const signals = {};

export const fetchHistoryRangeBatch = (data, signalKey) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (signalKey && signals[signalKey] && signals[signalKey].abort) {
    signals[signalKey].abort();
  }
  signals[signalKey] = controller;
  return request(`/api/${N9E_PATHNAME}/query-range-batch`, {
    method: RequestMethod.Post,
    data,
    signal,
    silence: true,
  }).finally(() => {
    delete signals[signalKey];
  });
};

export const fetchHistoryInstantBatch = (data, signalKey) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (signalKey && signals[signalKey] && signals[signalKey].abort) {
    signals[signalKey].abort();
  }
  signals[signalKey] = controller;
  return request(`/api/${N9E_PATHNAME}/query-instant-batch`, {
    method: RequestMethod.Post,
    data,
    signal,
    silence: true,
  }).finally(() => {
    delete signals[signalKey];
  });
};

export const getLabelNames = function (data, datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/api/v1/labels`, {
    method: RequestMethod.Get,
    params: { ...data },
    silence: true,
  });
};

export const getLabelValues = function (label, data, datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/api/v1/label/${label}/values`, {
    method: RequestMethod.Get,
    params: { ...data },
    silence: true,
  });
};

export const getMetricSeries = function (data, datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/api/v1/series`, {
    method: RequestMethod.Get,
    params: { ...data },
    silence: true,
  });
};

export const getMetric = function (data = {}, datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/api/v1/label/__name__/values`, {
    method: RequestMethod.Get,
    params: { ...data },
    silence: true,
  });
};

export const getQueryResult = function (data, datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/api/v1/query`, {
    method: RequestMethod.Get,
    params: { ...data },
    silence: true,
  });
};

export function getESVariableResult(datasourceValue: number, index, requestBody) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/${index}/_search`, {
    method: RequestMethod.Post,
    data: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
    silence: true,
  }).then((res) => {
    const dat = _.map(_.get(res, 'aggregations.A.buckets'), 'key');
    return dat;
  });
}
