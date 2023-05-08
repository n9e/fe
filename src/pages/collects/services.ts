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
import { CollectCateType, CollectType, PostCollectType, PutCollectType } from './types';

export const getCollectCates = function (): Promise<CollectCateType[]> {
  return request('/api/n9e-plus/builtin-collect-cates', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat || [];
  });
};

export const getCollects = function (groupID: number): Promise<CollectType[]> {
  return request('/api/n9e-plus/collects', {
    method: RequestMethod.Get,
    params: {
      group_id: groupID,
    },
  }).then((res) => {
    return res.dat || [];
  });
};

export const getCollect = function (id: number): Promise<CollectType> {
  return request(`/api/n9e-plus/collect/${id}`, {
    method: RequestMethod.Get,
    params: {
      id,
    },
  }).then((res) => {
    return res.dat;
  });
};

export const postCollect = function (data: PostCollectType) {
  return request('/api/n9e-plus/collect', {
    method: RequestMethod.Post,
    data,
  });
};

export const putCollect = function (id: number, data: PutCollectType) {
  return request(`/api/n9e-plus/collect/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const putCollectStatus = function (
  id: number,
  data: {
    id: number;
    disabled: number;
  },
) {
  return request(`/api/n9e-plus/collect/${id}/status`, {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteCollects = function (ids: number[]) {
  return request('/api/n9e-plus/collects', {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
};

export const getCollectsByIdent = function (ident: string): Promise<CollectType[]> {
  return request('/api/n9e-plus/ident-collects', {
    method: RequestMethod.Get,
    params: {
      agent_hostname: ident,
    },
  }).then((res) => {
    return res.dat || [];
  });
};
