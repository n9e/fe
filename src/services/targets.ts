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

// 获取监控对象列表
export function getMonObjectList(params) {
  let url = '/api/n9e/targets';
  if (import.meta.env.VITE_IS_PRO === 'true') {
    url = '/api/n9e-plus/targets';
  }
  return request(url, {
    method: RequestMethod.Get,
    params,
  });
}

export function bindTags(data) {
  return bindOrUnbindTags(true, data);
}

export function unbindTags(data) {
  return bindOrUnbindTags(false, data);
}

// 获取监控对象标签列表
export function getTargetTags(params) {
  return request(`/api/n9e/targets/tags`, {
    method: RequestMethod.Get,
    params,
  });
}

// 绑定/解绑标签
export function bindOrUnbindTags(isBind, data) {
  return request(`/api/n9e/targets/tags`, {
    method: isBind ? RequestMethod.Post : RequestMethod.Delete,
    data,
  });
}

// 修改/移出业务组
export function moveTargetBusi(data) {
  return request(`/api/n9e/targets/bgid`, {
    method: RequestMethod.Put,
    data: Object.assign({ bgid: 0 }, data),
  });
}

// 修改对象备注
export function updateTargetNote(data) {
  return request(`/api/n9e/targets/note`, {
    method: RequestMethod.Put,
    data,
  });
}

// 删除对象
export function deleteTargets(data) {
  return request(`/api/n9e/targets`, {
    method: RequestMethod.Delete,
    data,
  });
}

export function getTargetList(data) {
  return request(`/api/n9e/target/list`, {
    method: RequestMethod.Post,
    data,
  });
}
