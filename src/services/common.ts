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

// 获取数据源列表
export function getDatasourceList(pluginTypes?: string[]): Promise<{ name: string; id: number }[]> {
  let url = '/api/n9e/datasource/list';
  if (import.meta.env.VITE_IS_COMMON_DS === 'true') {
    url = '/api/v1/datasource/list';
  }
  return request(url, {
    method: RequestMethod.Post,
    data: {
      p: 1,
      limit: 100, // TODO: 假设 n9e 里面需要选择的数据源不会超过 100 个
    },
  })
    .then((res) => {
      return _.map(
        _.filter(res.data.items || res.data, (item) => {
          return pluginTypes ? _.includes(pluginTypes, item.plugin_type) : true;
        }),
        (item) => {
          return {
            ...item,
            // 兼容 common ds
            plugin_type: item.category ? _.replace(item.plugin_type, `.${item.category}`, '') : item.plugin_type,
          };
        },
      );
    })
    .catch(() => {
      return [];
    });
}

export function getBusiGroups(query = '', limit: number = 200) {
  return request(`/api/n9e/busi-groups`, {
    method: RequestMethod.Get,
    params: Object.assign(
      {
        limit,
      },
      query ? { query } : {},
    ),
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
