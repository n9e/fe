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
import { RequestMethod, IBasePagingParams } from '@/store/common';
import { collectItem, collect_type, prefixType } from '@/store/businessInterface';

// 新建资源分组
export const addResourceGroup = function (params: { path: string; node: string }) {
  return request(`/api/n9e/classpaths`, {
    method: RequestMethod.Post,
    data: params,
  });
};

// 获取分组列表
export const getResourceGroups = function (query?: string, p = 1) {
  return request(`/api/n9e/classpaths`, {
    method: RequestMethod.Get,
    params: {
      query,
      limit: 30,
      p,
    },
  });
};
// 获取分组列表
export const getResourceAllGroups = function (limit, p = 1, query?: string) {
  return request(`/api/n9e/classpaths`, {
    method: RequestMethod.Get,
    params: {
      query,
      limit,
      p,
    },
  });
};

// 获取收藏分组
export const getFavoritesResourceGroups = function () {
  return request(`/api/n9e/classpaths/favorites`, {
    method: RequestMethod.Get,
  });
};

// 添加收藏分组
export const addFavoriteGroup = function (id: number) {
  return request(`/api/n9e/classpath/${id}/favorites`, {
    method: RequestMethod.Post,
    data: {
      id,
    },
  });
};

// 删除收藏分组
export const deleteFavoriteGroup = function (id: number) {
  return request(`/api/n9e/classpath/${id}/favorites`, {
    method: RequestMethod.Delete,
    data: {
      id,
    },
  });
};

// 删除分组
export const deleteResourceGroup = function (id: number) {
  return request(`/api/n9e/classpath/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 修改分组
export const updateResourceGroup = function (data: { path?: string; node?: string } & { id: number }) {
  return request(`/api/n9e/classpath/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//获取分组下资源列表
export const getResourceList = function (params: { id: number; prefix: prefixType } & IBasePagingParams) {
  return request(`/api/n9e/classpath/${params.id}/resources`, {
    method: RequestMethod.Get,
    params: {
      ...params,
      id: undefined,
    },
  });
};

//获取任意分组下所有资源列表
export const getResourceListAll = function (query?: string) {
  return request(`/api/n9e/resources`, {
    method: RequestMethod.Get,
    params: { qres: query },
  });
};

//分组删除资源
export const deleteResourceItem = function (id: number, ident: string[]) {
  return request(`/api/n9e/classpath/${id}/resources`, {
    method: RequestMethod.Delete,
    data: ident,
  });
};

//彻底删除资源
export const deleteResource = function (id: number) {
  return request(`/api/n9e/resource/${id}`, {
    method: RequestMethod.Delete,
  });
};

// 批量修改资源分组
export const updateResourceToGroup = function (params: { res_idents: string[]; classpath_ids: string[] }) {
  return request(`/api/n9e/resources/classpaths`, {
    method: RequestMethod.Put,
    data: params,
  });
};

//分组添加资源
export const addGroupResource = function (params: { id: number; data: Array<string> }) {
  return request(`/api/n9e/classpath/${params.id}/resources`, {
    method: RequestMethod.Post,
    data: params.data,
  });
};

//分组删除资源
export const deleteGroupResource = function (id: number, data: Array<string>) {
  return request(`/api/n9e/classpath/${id}/resources`, {
    method: RequestMethod.Delete,
    data,
  });
};

//获取分组详情
export const getResourceDetail = function (id: number) {
  return request(`/api/n9e/resource/${id}`, {
    method: RequestMethod.Get,
  });
};

//更新备注
export const updateResourceDetailNote = function (data: { ids: number[]; note: string }) {
  return request(`/api/n9e/resources/note`, {
    method: RequestMethod.Put,
    data,
  });
};

//更新tags
export const updateResourceDetailTags = function (data: { ids: number[]; tags: string }) {
  return request(`/api/n9e/resources/tags`, {
    method: RequestMethod.Put,
    data,
  });
};

//修改机器屏蔽时间
export const updateResourceMute = function (data: { ids: Array<number>; btime: number; etime: number }) {
  return request(`/api/n9e/resources/mute`, {
    method: RequestMethod.Put,
    data,
  });
};

//创建采集配置
export const createCollectSetting = function (data: Partial<collectItem>) {
  return request(`/api/n9e/collect-rules`, {
    method: RequestMethod.Post,
    data,
  });
};

//克隆采集配置
export const cloneCollectSetting = function (data: Partial<collectItem>) {
  return request(`/api/n9e/v2/collect-rules`, {
    method: RequestMethod.Post,
    data,
  });
};

//修改采集配置
export const updateCollectSetting = function (data: Partial<collectItem>) {
  return request(`/api/n9e/collect-rule/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
};

//查询采集配置
export const getCollectSettings = function (type: collect_type) {
  return function (params: { id: number } & IBasePagingParams) {
    return request(`/api/n9e/classpath/${params.id}/collect-rules`, {
      method: RequestMethod.Get,
      params: {
        ...params,
        type,
      },
    });
  };
};

//删除采集配置
export const deleteCollectSetting = function (ids: Array<number>) {
  return request(`/api/n9e/collect-rules`, {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

//删除采集配置
export const regCheck = function (data: { tags_pattern?: Object; func?: string; re?: string; log?: string; time?: string }) {
  return request(`/api/n9e/log/check`, {
    method: RequestMethod.Post,
    data,
  });
};

export const getHosts = (params) => {
  return request(`/api/n9e/targets`, {
    method: RequestMethod.Get,
    params,
  });
};
