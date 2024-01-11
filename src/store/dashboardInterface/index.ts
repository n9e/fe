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

import { IDashboardConfig } from '@/pages/dashboard/types';
export interface Dashboard {
  create_by: string;
  favorite: number;
  id: number;
  name: string;
  ident?: string;
  tags: string;
  update_at: number;
  update_by: string;
  configs: IDashboardConfig;
  public?: number;
  public_cate?: number; // 0 匿名访问 1 登录访问 2 可选用户访问
  bgids?: number[]; // 公开大盘授权的业务组
  group_id: number;
}

export interface Group {
  id: number;
  dashboard_id: number;
  name: string;
  weight: number;
  updateTime: number;
}

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  i: string;
}

type QLItem = {
  PromQL: string;
  Legend: string;
};

export interface HighLevelConfigType {
  shared: boolean;
  sharedSortDirection: 'desc' | 'asc';
  precision: 'short' | 'origin' | number;
  formatUnit: 1024 | 1000 | 'humantime';
}

export interface ChartConfig {
  highLevelConfig?: HighLevelConfigType;
  layout?: Layout;
  tags: object;
  QL: QLItem[];
  name: string;
  plotline?: number;
  link?: string;
  legend?: boolean;
  yplotline1?: number;
  yplotline2?: number;
  version?: number;
}
