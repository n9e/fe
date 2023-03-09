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
import { RoleType, RolePostType, OperationType } from './types';

export const getRoles = function (): Promise<RoleType[]> {
  return request('/api/n9e/roles', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postRoles = function (params: RolePostType) {
  return request('/api/n9e/roles', {
    method: RequestMethod.Post,
    data: params,
  });
};

export const putRoles = function (params: RoleType) {
  return request('/api/n9e/roles', {
    method: RequestMethod.Put,
    data: params,
  });
};

export const deleteRoles = function (id: number) {
  return request(`/api/n9e/role/${id}`, {
    method: RequestMethod.Delete,
  });
};

export const getOperations = function (): Promise<OperationType[]> {
  return request('/api/n9e/operation', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const getOperationsByRole = function (roleId: number): Promise<string[]> {
  return request(`/api/n9e/role/${roleId}/ops`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const putOperationsByRole = function (roleId: number, ops: string[]) {
  return request(`/api/n9e/role/${roleId}/ops`, {
    method: RequestMethod.Put,
    data: ops,
  });
};
