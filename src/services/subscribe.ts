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

export const getSubscribeList = function (params: { id: number }) {
  return request(`/api/n9e/busi-group/${params.id}/alert-subscribes`, {
    method: RequestMethod.Get,
  });
};

export const getBusiGroupsAlertSubscribes = function (gids?: string) {
  return request('/api/n9e/busi-groups/alert-subscribes', {
    method: RequestMethod.Get,
    params: { gids },
  });
};

export const getSubscribeData = function (subscribeId: number) {
  return request(`/api/n9e/alert-subscribe/${subscribeId}`, {
    method: RequestMethod.Get,
  });
};

export const addSubscribe = function (data: any, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-subscribes`, {
    method: RequestMethod.Post,
    data,
  });
};

export const editSubscribe = function (data: any, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-subscribes`, {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteSubscribes = function (data: { ids: number[] }, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-subscribes`, {
    method: RequestMethod.Delete,
    data,
  });
};
