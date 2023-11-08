import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

interface objectItem {
  object_type: string;
  object_name?: string;
  business_id?: number;
}

interface assignItem {
  type: string;
  id: number;
  name?: string;
}

export interface IAaccess {
  uuid?: string;
  objects: objectItem[];
  operation: string;
  assigns: assignItem[];
}



/**
 *
 * @param params
 * @returns 获取用户列表
 */
export const getUserInfoList = function (params?: { p?: number; limit?: number }) {
  return request(`/api/n9e/users`, {
    method: RequestMethod.Get,
    params,
  });
};

/**
 *
 * @param params
 * @returns 获取团队列表
 */
export const getTeamInfoList = function (params?: { query?: string; limit?: number }) {
  const data = params ? (params.limit ? params : { ...params, limit: 200 }) : { limit: 200 };
  return request(`/api/n9e/user-groups`, {
    method: RequestMethod.Get,
    params: data,
  });
};

export const getBusiGroupList = function (params?: { p?: number; limit?: number }) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params,
  });
};

export const getDataSourcePerm = (ds_id) => {
  return request(`/api/n9e-plus/datasource-perms?ds_id=${ds_id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const upsertDataSourcePerm = (data) => {
  return request(`/api/n9e-plus/datasource-perm`, {
    method: !data.id ? RequestMethod.Post : RequestMethod.Put,
    data,
  });
};

export const delDataSourcePerm = (ids: number[]) => {
  return request(`/api/n9e-plus/datasource-perm`, {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
};
