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
import { VariableConfig, RASConfig } from './types';

export type { VariableConfig, RASConfig } from './types';

export const getVariableConfigs = function (): Promise<VariableConfig[]> {
  return request('/api/n9e/user-variable-configs', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postVariableConfigs = function (data: VariableConfig) {
  return request('/api/n9e/user-variable-config', {
    method: RequestMethod.Post,
    data,
  });
};

export const putVariableConfigs = function (id: number, data: VariableConfig) {
  return request(`/api/n9e/user-variable-config/${id}`, {
    method: RequestMethod.Put,
    data,
  });
};

export const deleteVariableConfigs = function (id: number) {
  return request(`/api/n9e/user-variable-config/${id}`, {
    method: RequestMethod.Delete,
  });
};

export const getRSAConfig = function (): Promise<RASConfig> {
  return request('/api/n9e/auth/rsa-config', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};
