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
import { N9E_PATHNAME } from '@/utils/constant';
import { SearchTraceType, SearchTraceIDType } from './type';

export const getTraceServices = (data_source_id) => {
  return request(`/api/${N9E_PATHNAME}/proxy/${data_source_id}/api/services`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.data;
  });
};

export const getTraceOperation = (data_source_id, service) => {
  return request(`/api/${N9E_PATHNAME}/proxy/${data_source_id}/api/services/${service}/operations`, {
    method: RequestMethod.Get,
  }).then((res) => res.data);
};

export const getTraceSearch = (data: SearchTraceType) => {
  return request(`/api/${N9E_PATHNAME}/proxy/${data.data_source_id}/api/traces`, {
    method: RequestMethod.Get,
    params: _.omit(data, 'data_source_id'),
  }).then((res) => res.data);
};

export const getTraceByID = (data: SearchTraceIDType) => {
  return request(`/api/${N9E_PATHNAME}/proxy/${data.data_source_id}/api/traces/${data.traceID}`, {
    method: RequestMethod.Get,
  }).then((res) => res.data);
};

export const getTraceDependencies = (id) => {
  return request(`/api/${N9E_PATHNAME}/proxy/${id}/api/dependencies`, {
    method: RequestMethod.Get,
    params: {
      endTs: Date.now(),
      lookback: 86400000,
    },
  }).then((res) => res.data);
};
