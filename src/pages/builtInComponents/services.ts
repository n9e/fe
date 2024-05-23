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
import { Record, PayloadQuery, TypeEnum, PayloadPost, PayloadPut } from './types';

export type { Record, TypeEnum };

export const getComponents = function (): Promise<Record[]> {
  return request('/api/n9e/builtin-components', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const getPayloads = <T>(params: PayloadQuery): Promise<{ [index: string]: T }> => {
  return request('/api/n9e/builtin-payloads', {
    method: RequestMethod.Get,
    params,
  }).then((res) => {
    return res.dat;
  });
};

export const getPayload = (id: number): Promise<{ content: string }> => {
  return request(`/api/n9e/builtin-payload/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const postPayloads = (data: PayloadPost[]): Promise<any> => {
  return request('/api/n9e/builtin-payloads', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const putPayload = (data: PayloadPut): Promise<any> => {
  return request('/api/n9e/builtin-payloads', {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const deletePayloads = (ids: number[]): Promise<any> => {
  return request('/api/n9e/builtin-payloads', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => {
    return res.dat;
  });
};
