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

export interface Tpl {
  id: number;
  title: string;
  batch: number; // 并发度，页面填充的默认值是0,
  tolerance: number; // 容忍度，页面填充的默认值是0,
  timeout: number; // 单机超时时间，页面填充的默认值是30,
  pause: number; // 暂停点，默认值为空,
  script: string; // 脚本内容，默认值参看之前四维的版本,
  args: string; // 脚本参数，默认值为空,
  tags: string; // 自愈脚本的标签,
  account: string; // 运行账号,
  hosts: string[];
  create_by: string;
  create_at: number;
  update_by: string;
  update_at: number;
  group_id: number;
  // grp: Group,
}
