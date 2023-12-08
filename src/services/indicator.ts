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

export const getIndicatorList = function (data: object) {
  return request(`/api/n9e/metric-descriptions`, {
    method: RequestMethod.Get,
    params: data,
  });
};

export const editIndicator = function (id: number, data: { description?: string | undefined; metric?: string | undefined }) {
  return request(`/api/n9e/metric-description/${id}`, {
    method: RequestMethod.Put,
    data: data,
  });
};

export const addIndicator = function (data: string) {
  return request(`/api/n9e/metric-descriptions`, {
    method: RequestMethod.Post,
    data: { data },
  });
};
export const deleteIndicator = function (id: number[]) {
  return request(`/api/n9e/metric-descriptions`, {
    method: RequestMethod.Delete,
    data: {
      ids: id,
    },
  });
};
