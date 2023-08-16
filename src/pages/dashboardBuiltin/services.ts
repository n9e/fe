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
import { BoardCateType, BoardType, BoardCateIconType } from './types';

export const getDashboardCates = function (): Promise<BoardCateType[]> {
  return request('/api/n9e/builtin-boards-cates', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const getDashboardDetail = function (data: BoardType): Promise<BoardType[]> {
  return request(`/api/n9e/builtin-boards-detail`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const getIntegrationsIcon = function (): Promise<BoardCateIconType[]> {
  return request('/api/n9e/integrations/icon', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

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

export const getInstructionsByName = function (name: string): Promise<string> {
  return request(`/api/n9e/integrations/makedown/${name}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};
