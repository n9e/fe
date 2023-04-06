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
import { mappingsToFields, flattenHits } from './utils';

export function getIndices(datasourceValue: number) {
  return request(`/api/n9e/proxy/${datasourceValue}/_cat/indices`, {
    method: RequestMethod.Get,
    params: {
      format: 'json',
    },
  }).then((res) => {
    return _.compact(_.map(res, 'index'));
  });
}

export function getFields(datasourceValue: number, index?: string, type?: string) {
  const url = index ? `/${index}/_mapping` : '/_mapping';
  return request(`/api/n9e/proxy/${datasourceValue}${url}?pretty=true`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => {
    return mappingsToFields(res, type);
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
