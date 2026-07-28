import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';

interface IItem {
  id: number;
  plugin_type_name: string;
  category: string;
  plugin_type: string;
  name: string;
  status: 'enabled';
}

const apiPrefix = '/api/n9e/datasource';

export const getDataSourcePluginList = (): Promise<IItem[]> => {
  return request(`${apiPrefix}/plugin/list`, {
    method: RequestMethod.Post,
    data: {},
  }).then((res) => res.data);
};

export const getDataSourceList = () => {
  return request(`${apiPrefix}/list`, {
    method: RequestMethod.Post,
    data: {},
  }).then((res) => res.data);
};

export const getDataSourceDetailById = (id: string | number) => {
  return request(`${apiPrefix}/desc`, {
    method: RequestMethod.Post,
    data: { id: Number(id) },
  }).then((res) => res.data);
};

export const submitRequest = (body) => {
  let url = `${apiPrefix}/upsert`;
  if (import.meta.env['VITE_IS_PRO']) {
    url = ' /api/n9e-plus/datasource/upsert';
  }
  return request(url, {
    method: RequestMethod.Post,
    data: body,
  }).then((res) => res.data);
};

export const updateDataSourceStatus = (body: { id: number; status: 'enabled' | 'disabled' }) => {
  return request(`${apiPrefix}/status/update`, {
    method: RequestMethod.Post,
    data: body,
  }).then((res) => res.data);
};

export const deleteDataSourceById = (id: string | number) => {
  return request(apiPrefix, {
    method: RequestMethod.Delete,
    data: [id],
  }).then((res) => res.data);
};

export const getServerClusters = () => {
  return request('/api/n9e/server-clusters', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const getDatasourceLabelMapping = (ds_id) => {
  return request('/api/n9e-plus/datasource-label-mapping', {
    method: RequestMethod.Get,
    params: { ds_id },
  }).then((res) => res.dat);
};

export const postDatasourceLabelMapping = (data) => {
  return request('/api/n9e-plus/datasource-label-mapping', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

// 拉取 Grafana 数据源预览（不写库）。返回 { items: [{ ...meta, duplicate, datasource }] }。
// 走 center 的 /api/n9e 路由（社区版与 Plus 版共用，Plus 二进制也挂了 center router）。
export const fetchGrafanaDatasources = (payload) => {
  return request(`${apiPrefix}/grafana/fetch`, {
    method: RequestMethod.Post,
    data: payload,
  }).then((res) => res.data);
};

// 批量导入选中的 Grafana 数据源。返回 { items: [{ name, status, reason }] }。
export const importGrafanaDatasources = (body) => {
  return request(`${apiPrefix}/grafana/import`, {
    method: RequestMethod.Post,
    data: body,
  }).then((res) => res.data);
};
