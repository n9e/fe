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

// 大盘列表
export const getDashboard = function () {
  return request(`/api/n9e/dashboards`, {
    method: RequestMethod.Get,
  });
};
interface Dashboard {
  name: string;
  tags: string;
  pure?: boolean;
  configs?: string;
}
// 创建大盘
export const createDashboard = function (id: number, data: Dashboard) {
  return request(`/api/n9e/busi-group/${id}/dashboards`, {
    method: RequestMethod.Post,
    data,
  });
};

// 克隆大盘
export const cloneDashboard = function (busiId: number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}/clone`, {
    method: RequestMethod.Post,
  });
};

// 删除大盘
export const removeDashboard = function (busiId: number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 导出大盘
export const exportDashboard = function (busiId: number, ids: number[]) {
  return request(`/api/n9e/busi-group/${busiId}/dashboards/export`, {
    method: RequestMethod.Post,
    data: { ids },
  });
};

// 导入大盘
export const importDashboard = function (busiId: number, data: any[]) {
  return request(`/api/n9e/busi-group/${busiId}/dashboards/import`, {
    method: RequestMethod.Post,
    data,
  });
};

// 获取大盘详情
export const getSingleDashboard = function (busiId: string, id: string | number) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}`, {
    method: RequestMethod.Get,
  });
};

// 更新大盘
export const updateSingleDashboard = function (busiId: string | number, id: string, data: Dashboard) {
  return request(`/api/n9e/busi-group/${busiId}/dashboard/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

interface Group {
  id?: number;
  dashboard_id: number;
  name: string;
  weight: number;
}
// 创建分组
export const createChartGroup = function (busiId: string, data: Group) {
  return request(`/api/n9e/busi-group/${busiId}/chart-groups`, {
    method: RequestMethod.Post,
    data,
  });
};

// 获取分组
export const getChartGroup = function (busiId: string, id: string) {
  return request(`/api/n9e/busi-group/${busiId}/chart-groups?did=${id}`, {
    method: RequestMethod.Get,
  });
};

// 删除分组
export const delChartGroup = function (busiId: string, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/chart-groups`, {
    method: RequestMethod.Delete,
    data: { ids: [id] },
  });
};

// 更新分组
export const updateChartGroup = function (busiId: string, data: Group[]) {
  return request(`/api/n9e/busi-group/${busiId}/chart-groups`, {
    method: RequestMethod.Put,
    data,
  });
};

interface Chart {
  configs: string | object;
  weight: number;
  group_id: number;
  id?: number | string;
}

// 创建Chart
export const createChart = function (busiId: string, data: Chart) {
  return request(`/api/n9e/busi-group/${busiId}/charts`, {
    method: RequestMethod.Post,
    data,
  });
};

// 编辑Chart
export const updateChart = function (chartId: number, data: Chart) {
  return request(`/api/n9e/chart/${chartId}`, {
    method: RequestMethod.Put,
    data,
  });
};

// 批量更新Chart
export const updateCharts = function (busiId: string, data: Chart[]) {
  const transformedData = data.map((item) => {
    return { ...item, configs: JSON.stringify(item.configs) };
  });
  return request(`/api/n9e/busi-group/${busiId}/charts`, {
    method: RequestMethod.Put,
    data: transformedData,
  });
};

// 移动Chart
export const moveChart = function (id: string, data: { id: number; weight: number; group_id: number }[]) {
  return request(`/api/n9e/charts/weights`, {
    method: RequestMethod.Put,
    data,
  });
};

// 获取某图表分组下面的所有chart
export const getCharts = function (busiId: string | number, id: number) {
  return request(`/api/n9e/busi-group/${busiId}/charts?cgid=${id}`, {
    method: RequestMethod.Get,
  });
};

// 删除Chart
export const removeChart = function (busiId: string | number, id: number | string) {
  return request(`/api/n9e/busi-group/${busiId}/charts`, {
    method: RequestMethod.Delete,
    data: { ids: [id] },
  });
};

// 删除Chart
export const checkPromql = function (promql: string) {
  return request(`/api/n9e/check-promql`, {
    method: RequestMethod.Get,
    params: { promql },
  });
};

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

export const getLabelNames = function (data, datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/labels`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getLabelValues = function (label, data, datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/label/${label}/values`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getMetricSeries = function (data, datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/series`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getMetric = function (data = {}, datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/label/__name__/values`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getQueryResult = function (data, datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/api/v1/query`, {
    method: RequestMethod.Get,
    params: { ...data },
  });
};

export const getBuiltinDashboards = function () {
  return request('/api/n9e/dashboards/builtin/list', {
    method: RequestMethod.Get,
  });
};

export const createBuiltinDashboards = function (name: string, cluster: string, id: number) {
  return request(`/api/n9e/busi-group/${id}/dashboards/builtin`, {
    method: RequestMethod.Post,
    data: { name, cluster },
  });
};

// boards v2 api
export const migrateDashboard = function (id: number, data: { name: string; tags: string; configs: string }) {
  return request(`/api/n9e/dashboard/${id}/migrate`, {
    method: RequestMethod.Put,
    data,
  });
};

export function getESVariableResult(datasourceValue: number, index, requestBody) {
  return request(`/api/n9e/proxy/${datasourceValue}/${index}/_search`, {
    method: RequestMethod.Post,
    data: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    const dat = _.map(_.get(res, 'aggregations.A.buckets'), 'key');
    return dat;
  });
}
