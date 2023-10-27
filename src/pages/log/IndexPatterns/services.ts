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
import { N9E_PATHNAME } from '@/utils/constant';

export const getESIndexPatterns = function (datasource_id?: number) {
  return request(`/api/${N9E_PATHNAME}/es-index-pattern-list`, {
    method: RequestMethod.Get,
    params: {
      datasource_id,
    },
  }).then((res) => res.dat);
};

export const getESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Get,
    params: {
      id,
    },
  }).then((res) => res.dat);
};

export const postESIndexPattern = function (data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Post,
    data,
  });
};

export const putESIndexPattern = function (id, data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Put,
    params: {
      id,
    },
    data,
  });
};

export const deleteESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Delete,
    data: { ids: [id] },
  });
};
