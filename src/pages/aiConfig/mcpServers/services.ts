import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, FormValues, Tool } from './types';

export type { Item, FormValues, Tool };

export const getList = function (): Promise<Item[]> {
  return request('/api/n9e/mcp-servers', {
    method: RequestMethod.Get,
  }).then((res) => res.dat ?? []);
};

export const getItem = function (id: number): Promise<Item> {
  return request(`/api/n9e/mcp-server/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postItem = function (data: Item) {
  return request('/api/n9e/mcp-servers', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const putItem = function (id: number, data: Item) {
  return request(`/api/n9e/mcp-server/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

export const deleteItem = function (id: number) {
  return request(`/api/n9e/mcp-server/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res.dat);
};

export const testConnection = function (data: Item): Promise<{ duration_ms: number; success: boolean; error?: string }> {
  return request('/api/n9e/mcp-server/test', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const getTools = function (id: number): Promise<Tool[]> {
  return request(`/api/n9e/mcp-server/${id}/tools`, {
    method: RequestMethod.Get,
    silence: true, // 如果 mcp server 无效，这个接口会请求失败，设置 silence: true 来避免全局错误提示
  }).then((res) => res.dat);
};
