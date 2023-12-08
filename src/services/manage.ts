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

// 修改个人信息
export const getUserInfoList = function (params = {}) {
  return request(`/api/n9e/users`, {
    method: RequestMethod.Get,
    params,
  });
};
export const getTeamInfoList = function (params?: { query: string; limit?: number }) {
  const data = params ? (params.limit ? params : { ...params, limit: 200 }) : { limit: 200 };
  return request(`/api/n9e/user-groups`, {
    method: RequestMethod.Get,
    params: data,
  });
};
export const getBusinessTeamList = function (params = {}) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params,
  });
};
export const getBusinessTeamInfo = function (id: string) {
  return request(`/api/n9e/busi-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const createBusinessTeam = function (data: object) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const changeBusinessTeam = function (id: string, data: object) {
  return request(`/api/n9e/busi-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};

export const deleteBusinessTeamMember = function (id: string, data: object) {
  return request(`/api/n9e/busi-group/${id}/members`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res && res.dat);
};

export const deleteBusinessTeam = function (id: string) {
  return request(`/api/n9e/busi-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};

export const addBusinessMember = function (id: string, data: object) {
  return request(`/api/n9e/busi-group/${id}/members`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};

export const createUser = function (data: object) {
  return request(`/api/n9e/users`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const createTeam = function (data: object) {
  return request(`/api/n9e/user-groups`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getUserInfo = function (id: string) {
  return request(`/api/n9e/user/${id}/profile`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const getTeamInfo = function (id: string) {
  return request(`/api/n9e/user-group/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
export const changeUserInfo = function (id: string, data: object) {
  return request(`/api/n9e/user/${id}/profile`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeStatus = function (id: string, data: object) {
  return request(`/api/n9e/user/${id}/status`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeTeamInfo = function (id: string, data: object) {
  return request(`/api/n9e/user-group/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const changeUserPassword = function (id: string, data: object) {
  return request(`/api/n9e/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const disabledUser = function (id: string, data: object) {
  return request(`/api/n9e/user/${id}/password`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res && res.dat);
};
export const deleteUser = function (id: string) {
  return request(`/api/n9e/user/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteTeam = function (id: string) {
  return request(`/api/n9e/user-group/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res && res.dat);
};
export const deleteMember = function (id: string, data: object) {
  return request(`/api/n9e/user-group/${id}/members`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res && res.dat);
};
export const addTeamUser = function (id: string, data: object) {
  return request(`/api/n9e/user-group/${id}/members`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res && res.dat);
};
export const getNotifiesList = function () {
  return request(`/api/n9e/notify-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getContactsList = function () {
  return request(`/api/n9e/contact-channels`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getNotifyChannels = function () {
  return request(`/api/n9e/contact-keys`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};

export const getRoles = function () {
  return request(`/api/n9e/roles`, {
    method: RequestMethod.Get,
  }).then((res) => res && res.dat);
};
