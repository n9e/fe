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

export const getShieldList = function (params: { id: number }) {
  return request(`/api/n9e/busi-group/${params.id}/alert-mutes`, {
    method: RequestMethod.Get,
  });
};

export const getBusiGroupsAlertMutes = function (gids?: string) {
  return request('/api/n9e/busi-groups/alert-mutes', {
    method: RequestMethod.Get,
    params: { gids },
  });
};

export const addShield = function (data: any, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes`, {
    method: RequestMethod.Post,
    data,
  });
};

export const deleteShields = function (data: { ids: number[] }, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes`, {
    method: RequestMethod.Delete,
    data,
  });
};

export const editShield = function (data: any[], busiId: number, shiedId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mute/${shiedId}`, {
    method: RequestMethod.Put,
    data: data,
  });
};

export const updateShields = function (data: { ids: React.Key[]; fields: any }, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes/fields`, {
    method: RequestMethod.Put,
    data: data,
  });
};

export const previewMutedEvents = function (data: any, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/alert-mutes/preview`, {
    method: RequestMethod.Post,
    data: data,
  });
};
