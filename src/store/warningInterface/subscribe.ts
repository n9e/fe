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
export interface subscribeItem {
  tags: any[];
  user_groups: IuserItem[];
  rule_name: string;
  rule_id: number;
  rule_ids: number[]; // 2024-01-12 支持订阅多个告警规则
  rule_names: string[]; // 2024-01-12 支持订阅多个告警规则
  busi_groups: {
    key: string;
    func: string;
    value: string; // TODO in 和 not in 时将 array 转为 string 以空格分隔。这里存在问题业务组名称中可能包含空格，后端让保持现在后面有时间再解决
  }[];
  create_at?: number;
  create_by?: string;
  update_by: string;
  etime: number;
  btime: number;
  id: number;
  group_id: number;
  datasource_ids: number[];
  redefine_severity?: number;
  redefine_channels?: number;
  redefine_webhooks?: number;
  user_group_ids?: string;
  new_channels: string;
  prod: string;
  severities?: number[];
  note: string;
}

interface IuserItem {
  id: number;
  name: string;
  note?: string;
  create_at?: number;
  create_by?: string;
  update_at?: number;
  update_by?: string;
}

// export interface shieldDetail {
//   cause: string;
//   create_at?: number;
//   create_by?: string;
//   etime: number;
//   id: number;
//   btime: number;
//   tags: any[];
// }

export interface IState {
  curShieldData: subscribeItem;
}
