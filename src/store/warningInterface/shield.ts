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
export interface shieldItem {
  tags: any[];
  cause: string;
  create_at?: number;
  create_by?: string;
  etime: number;
  btime: number;
  id: number;
  group_id?: number;
  cate: string;
  datasource_ids: number[];
  mute_time_type: 0 | 1;
  periodic_mutes: any[];
}

export interface IshieldState {
  curShieldData: shieldItem;
}
