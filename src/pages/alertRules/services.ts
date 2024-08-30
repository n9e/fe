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

export const getAlertRulePure = (id: number) => {
  return request(`/api/n9e/alert-rule/${id}/pure`, {
    method: RequestMethod.Get,
    silence: true,
  }).then((res) => res.dat);
};

export const rulesClone = (gid, data) => {
  return request(`/api/n9e/busi-group/${gid}/alert-rules/clone`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
