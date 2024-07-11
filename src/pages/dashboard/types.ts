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
import { IRawTimeRange } from '@/components/TimeRangePicker';
export interface IGridPos {
  h: number;
  w: number;
  x: number;
  y: number;
  i: string;
}

// query interface
export interface ITarget {
  refId: string;
  __mode__: '__expr__' | '__query__';
  expr: string; // promQL
  legendFormat: string;
  time?: IRawTimeRange; // 固定时间范围
  step?: number; // 2024-01-24 从固定 step 改成 min step (v7)
  maxDataPoints?: number; // 2024-01-24 新增 maxDataPoints 用于计算默认的 step (v7)
  query?: {
    index: string;
    filters: string;
    values: {
      func: string;
    }[];
  };
  legend?: string;
  instant?: boolean;
  hide?: boolean;
}

export type IType = 'row' | 'timeseries' | 'stat' | 'table' | 'pie' | 'hexbin' | 'barGauge' | 'text' | 'gauge' | 'iframe';

export interface IValueMapping {
  match: {
    special?: string | number;
    specialValue?: string | number;
    from?: number;
    to?: number;
  };
  result: {
    color: string;
    text: string;
  };
  type: 'range' | 'special' | 'specialValue'; // TODO: 历史原因 special 是固定值，specialValue 是特殊值
}

export interface IThresholds {
  steps: {
    color: string;
    value: number;
    type?: 'base';
  }[];
  // mode: 'absolute' | 'percent'; 目前不支持
  style: 'line'; // 目前只支持 line
}

// 一些通用的配置，不同类型的图表可选择性使用配置
export interface IOptions {
  valueMappings?: IValueMapping[];
  thresholds?: IThresholds;
  xThresholds?: IThresholds;
  standardOptions?: {
    util?: string;
    min?: number;
    max?: number;
    decimals?: number;
    dateFormat?: string;
    displayName?: string;
  };
  legend?: {
    // TODO: 目前不支持这么复杂的自定义
    calcs: string[];
    displayMode: 'list' | 'table' | 'hidden';
    placement: 'right' | 'bottom';
    heightInPercentage?: number;
    columns?: string[];
    detailName: string;
    detailUrl: string;
    behaviour: 'showItem' | 'hideItem';
  };
  tooltip?: {
    mode: 'single' | 'all';
    sort: 'none' | 'asc' | 'desc';
  };
  colors?: {
    scheme: string;
  };
}

export interface IOverride {
  matcher: {
    type: 'byName'; // 目前只支持 byName
    value: string;
  };
  properties: {
    [key: string]: any; // standardOptions | valueMappings
  };
}

export interface ILink {
  title: string;
  url: string;
  targetBlank?: boolean;
}

export interface ITimeseriesStyles {
  version: string;
  drawStyle: 'lines' | 'bars';
  lineInterpolation: 'linear' | 'smooth';
  fillOpacity: number;
  stack: 'off' | 'noraml'; // off 关闭；normal 开启，此结构未后期其他模式预留
  scaleDistribution: {
    type: 'linear' | 'log';
    log?: 10 | 2;
  };
  spanNulls: boolean;
}

export interface IStatStyles {
  version: string;
  textMode: 'valueAndName' | 'value';
  textSize: {
    title: number;
    value: number;
  };
  calc: string;
  colorMode: 'value' | 'background';
  graphMode?: 'none' | 'area';
}

export interface ITableStyles {
  version: string;
  showHeader: boolean;
  colorMode: 'value' | 'background';
  calc: string;
  displayMode: 'seriesToRows' | 'labelValuesToRows';
  // aggrOperator: string;
  aggrDimension: string;
}

export interface IHexbinStyles {
  version: string;
  textMode: 'valueAndName' | 'name' | 'value';
  calc: string;
  colorRange: string[]; // 三个颜色值
  colorDomainAuto: boolean;
  colorDomain: number[]; // 自定义 [min, max]
  reverseColorOrder: boolean;
  detailUrl: string;
  fontBackground: boolean;
}

export interface IPieStyles {
  version: string;
  calc: string;
  legengPosition: string;
}

export interface IBarGaugeStyles {
  version: string;
  displayMode: 'basic';
  calc: string;
  maxValue: number;
  baseColor: string;
  serieWidth: number;
  sortOrder: 'none' | 'asc' | 'desc';
  detailUrl: string | undefined;
}

export interface ITextStyles {
  version: string;
  textColor: string;
  textDarkColor: string;
  bgColor: string;
  textSize: number;
  justifyContent: 'unset' | 'flexStart' | 'center' | 'flexEnd';
  alignItems: 'unset' | 'flexStart' | 'center' | 'flexEnd';
  content: string;
}

export interface IIframeStyles {
  version: string;
  src: string;
}

export interface IRow {
  id: string;
  type: 'row';
  title: string;
  collapsed: boolean;
  layout: IGridPos;
}

export interface ITransformation {
  id: 'string';
  options: {
    [key: string]: any;
  };
}

export interface IPanel {
  version: string; // 单个图表面板使用的版本
  id: string;
  name: string;
  links?: ILink[];
  description: string;
  layout: IGridPos;
  datasourceCate?: string; // 5.11.0 新增支持配置数据源类型，默认是 prometheus
  datasourceValue?: number; // 6.x 开始 datasourceName 已经废弃，datasourceValue 即 datasourceId
  targets: ITarget[];
  type: IType;
  options: IOptions;
  custom: any; // 图表
  overrides: IOverride[];
  collapsed?: boolean; // 用于 row 展开收起控制是否显示
  panels?: IPanel[]; // 用于 row 收起时保存子面板
  transformations?: ITransformation[];
  repeat?: string;
  maxPerRow?: number;
  repeatPanelId?: string;
  scopedVars?: any;
}

export interface IVariable {
  name: string;
  definition: string;
  options?: string[];
  allOption?: boolean;
  multi?: boolean;
  value?: string | number | string[];
}

// IDashboard.configs
export interface IDashboardConfig {
  version: string; // 整个仪表盘使用的版本，遵循版本规范 '1.0.0'
  links: ILink[];
  var: IVariable[]; // 变量配置
  panels: IPanel[];
  graphTooltip: 'default' | 'sharedCrosshair' | 'sharedTooltip';
  graphZoom: 'default' | 'updateTimeRange';
}

export interface IDashboard {
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
  group_id: number;
}
