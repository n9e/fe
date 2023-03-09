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
export enum ChartType {
  Line = 'line',
  Pie = 'pie',
  Bar = 'bar',
}

export interface DataSource {
  name: string;
  data: Array<number | PieDataSource>;
  sampling?: string;
}

export interface PieDataSource {
  value: number;
  name: string;
}

export function isNumberArray(s: any): s is number[] {
  if (s.length) {
    return typeof s[0] === 'number';
  } else {
    return true;
  }
}

export function isPieArray(s: any): s is PieDataSource[] {
  if (s.length) {
    return typeof s[0] !== 'number';
  } else {
    return true;
  }
}

export interface ChartProps {
  title?: string; // 图表标题
  id?: string; //  图表唯一id
  type: ChartType; // 图表类型
  dataSource: Array<DataSource> | []; // 图表的数据源
  xAxis?: Array<string | number> | []; // 图表的x轴
  search?: any;
}

export interface LineData {
  name?: string;
  type: ChartType.Line;
  data: Array<number>;
}

export interface BarData {
  name?: string;
  type: ChartType.Bar;
  data: Array<number>;
}

interface PieSeriesItem {
  value: number;
  name: string;
}

export interface PieData {
  name?: string;
  type: ChartType.Pie;
  data: PieSeriesItem[];
}

export interface Tag {
  key: string;
  value: string;
}

export interface TagForVariable extends Tag {
  metric: string;
}

export interface ChartComponentProps {
  range: any;
  limit: number;
  metric: string | string[];
  idents?: string[];
  description?: string;
  tags?: Tag[];
  classpath_id?: number;
  classpath_prefix?: Boolean;
  prome_ql?: string[] | string;
  yplotline?: number;
  xplotline?: number; //秒
  step?: number | null;
}

export interface ChartFilterProps {
  start: number;
  end: number;
  limit: number;
  metric?: string | string[];
  description?: string;
  tags?: Tag[];
  idents?: string[];
}
