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
import _ from 'lodash';
import { mappingsToFields, mappingsToFullFields, flattenHits } from './utils';

export function getIndices(datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/_cat/indices`, {
    method: RequestMethod.Get,
    params: {
      format: 'json',
    },
  }).then((res) => {
    return _.sortBy(_.compact(_.map(res, 'index')));
  });
}

export function getFullIndices(datasourceValue: number, target = '*', hide_system_indices = false) {
  const params: any = {
    format: 'json',
    s: 'index',
  };
  if (hide_system_indices) {
    params.expand_wildcards = 'all';
  }
  return request(`/api/n9e/proxy/${datasourceValue}/_cat/indices/${target}`, {
    method: RequestMethod.Get,
    params,
    silence: true,
  }).then((res) => {
    return res;
  });
}

export function getFields(datasourceValue: number, index?: string, type?: string) {
  const url = index ? `/${index}/_mapping` : '/_mapping';
  return request(`/api/n9e/proxy/${datasourceValue}${url}?pretty=true`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => {
    return {
      allFields: mappingsToFields(res),
      fields: type ? mappingsToFields(res, type) : [],
    };
  });
}

export function getFullFields(datasourceValue: number, index?: string, type?: string) {
  const url = index ? `/${index}/_mapping` : '/_mapping';
  return request(`/api/n9e/proxy/${datasourceValue}${url}?pretty=true`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => {
    return {
      allFields: _.unionBy(mappingsToFullFields(res), (item) => {
        return item.name + item.type;
      }),
      fields: type
        ? _.unionBy(mappingsToFullFields(res, type), (item) => {
            return item.name + item.type;
          })
        : [],
    };
  });
}

export function getLogsQuery(datasourceValue: number, requestBody) {
  return request(`/api/n9e/proxy/${datasourceValue}/_msearch`, {
    method: RequestMethod.Post,
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    const dat = _.get(res, 'responses[0].hits');
    const { docs } = flattenHits(dat.hits);
    return {
      total: dat.total.value,
      list: docs,
    };
  });
}

export function getDsQuery(datasourceValue: number, requestBody) {
  return request(`/api/n9e/proxy/${datasourceValue}/_msearch`, {
    method: RequestMethod.Post,
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    const dat = _.get(res, 'responses[0].aggregations.A.buckets');
    return dat;
  });
}

export function getESVersion(datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    const dat = _.get(res, 'version.number');
    return dat;
  });
}
