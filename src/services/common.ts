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
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 匿名获取数据源列表
export function getDatasourceBriefList(): Promise<{ name: string; id: number; plugin_type: string }[]> {
  const url = '/api/n9e/datasource/brief';
  return request(url, {
    method: RequestMethod.Get,
  })
    .then((res) => {
      return res.dat || [];
    })
    .catch(() => {
      return [];
    });
}

export function getBusiGroups(query = '', limit: number = 5000) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
    ),
  }).then((res) => {
    return {
      dat: _.sortBy(res.dat, 'name'),
    };
  });
}

export function getPerm(busiGroup: string, perm: 'ro' | 'rw') {
  return request(`/api/n9e/busi-group/${busiGroup}/perm/${perm}`, {
    method: RequestMethod.Get,
  });
}

export function getMenuPerm() {
  return request(`/api/n9e/self/perms`, {
    method: RequestMethod.Get,
  });
}
