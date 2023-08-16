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
