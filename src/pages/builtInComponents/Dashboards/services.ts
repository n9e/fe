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

// 创建仪表盘
export const createDashboard = function (id: number, data: any) {
  return request(`/api/n9e/busi-group/${id}/boards`, {
    method: RequestMethod.Post,
    data,
    silence: true,
  })
    .then((res) => {
      return res.dat;
    })
    .catch((res) => {
      return {
        err: res.message,
      };
    });
};
