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
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 大盘列表
export const getDashboards = function (id: number | string) {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Get,
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
// 创建大盘
export const createDashboard = function (id: number, data: Dashboard) {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

// 克隆大盘
export const cloneDashboard = function (busiId: number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/board/${id}/clone`, {
    method: RequestMethod.Post,
  });
};

// 删除大盘
export const removeDashboards = function (ids: number[]) {
  return request(`/api/n9e/boards`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

// 导出大盘
// 大盘迁移页面需要
export const exportDashboard = function (busiId: number | string, ids: number[]) {
  return request(`/api/n9e/busi-group/${busiId}/dashboards/export`, {
    method: RequestMethod.Post,
    data: { ids },
  }).then((res) => {
    return res.dat;
  });
};

// 获取大盘详情
export const getDashboard = function (id: string | number) {
  return request(`/api/n9e/board/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

// 更新大盘 - 只能更新 name 和 tags
export const updateDashboard = function (id: string | number, data: { name: string; ident?: string; tags: string }) {
  return request(`/api/n9e/board/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

// 更新大盘 - 只能更新 configs
export const updateDashboardConfigs = function (id: string | number, data: { configs: string }) {
  return request(`/api/n9e/board/${id}/configs`, {
    method: RequestMethod.Put,
    data,
  });
};

// 更新大盘 - 只能更新 public
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

// 一下是非大盘相关的接口

// 告警策略 or 大盘 内置模版
export const getTemplate = function (type: 'alert_rule' | 'dashboard') {
  return request(`/api/n9e/tpl/list?tpl_type=${type}`, {
    method: RequestMethod.Get,
  });
};

export const getTemplateContent = function (type: 'alert_rule' | 'dashboard', name: string) {
  return request(`/api/n9e/tpl/content?tpl_type=${type}&tpl_name=${name}`, {
    method: RequestMethod.Get,
  });
};

export const getLabelNames = function (data) {
  return request(`/api/n9e/prometheus/api/v1/labels`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getLabelValues = function (label, data) {
  return request(`/api/n9e/prometheus/api/v1/label/${label}/values`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getMetricSeries = function (data) {
  return request(`/api/n9e/prometheus/api/v1/series`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getMetric = function (data = {}) {
  return request(`/api/n9e/prometheus/api/v1/label/__name__/values`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getQueryResult = function (data) {
  return request(`/api/n9e/prometheus/api/v1/query`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getBuiltinDashboards = function () {
  return request('/api/n9e/dashboards/builtin/list', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

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

export const fetchHistoryBatch = (data, signalKey) => {
  const controller = new AbortController();
  const { signal } = controller;
  if (signalKey && signals[signalKey] && signals[signalKey].abort) {
    signals[signalKey].abort();
  }
  signals[signalKey] = controller;
  return request(`/api/n9e/query-range-batch`, {
    method: RequestMethod.Post,
    data,
    signal,
  }).finally(() => {
    delete signals[signalKey];
  });
};
