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
import { RuleCateType, RuleType } from './types';

export const getRuleCates = function (): Promise<RuleCateType[]> {
  return request('/api/n9e/alert-rules/builtin/list', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const createRule = function (id: number, data: RuleType[]) {
  return request(`/api/n9e/busi-group/${id}/alert-rules/import`, {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return res.dat;
  });
};

export const postBuiltinCateFavorite = function (name: string): Promise<any[]> {
  return request('/api/n9e/builtin-cate-favorite', {
    method: RequestMethod.Post,
    data: { name },
  }).then((res) => {
    return res.dat;
  });
};

export const deleteBuiltinCateFavorite = function (name: string): Promise<any[]> {
  return request(`/api/n9e/builtin-cate-favorite/${name}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    return res.dat;
  });
};
