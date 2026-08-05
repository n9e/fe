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

/** 可持久化到仪表盘配置中的 JSON 值。 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface DashboardDatasource {
  id: number;
  name: string;
  plugin_type: string;
  is_default: boolean;
  identifier?: string;
}

export interface DashboardAnnotation {
  id: number;
  dashboard_id: number;
  panel_id?: string;
  time_start: number;
  time_end: number;
  description?: string;
  tags: string[];
}

export interface ScopedVariable {
  text?: string;
  value?: string | number | string[];
}

export type ScopedVariables = Record<string, ScopedVariable>;
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
  kind?: 'query' | 'expression';
  /**
   * @deprecated 仅用于迁移 4.0.0 之前的面板配置。
   */
  __mode__?: '__expr__' | '__query__';
  datasource?: {
    cate: string;
    id: number | string;
  };
  resultType?: 'time_series' | 'logs';
  expression?: string;
  expr?: string; // PromQL；表达式配置迁移后使用 expression
  legendFormat?: string;
  time?: IRawTimeRange; // 固定时间范围，2025-10-20 废弃
  step?: number; // 2024-01-24 从固定 step 改成 min step (v7)
  maxDataPoints?: number; // 2024-01-24 新增 maxDataPoints 用于计算默认的 step (v7)，2025-10-20 废弃
  query?: JsonObject;
  queries?: JsonObject[];
  legend?: string;
  instant?: boolean;
  hide?: boolean;
}

export type IType = 'row' | 'timeseries' | 'stat' | 'table' | 'tableNG' | 'pie' | 'hexbin' | 'barGauge' | 'text' | 'gauge' | 'iframe' | 'barchart' | 'heatmap';

export interface IValueMapping {
  match: {
    special?: string | number;
    specialValue?: string | number;
    from?: number;
    to?: number;
    textValue?: string;
  };
  result: {
    color: string;
    text: string;
  };
  type: 'range' | 'special' | 'specialValue' | 'textValue'; // TODO: 历史原因 special 是固定值，specialValue 是特殊值
}

export interface IThresholds {
  steps: {
    color: string;
    value: number;
    type?: 'base';
  }[];
  mode: 'absolute' | 'percentage';
}

export interface ThresholdsStyle {
  mode: 'off' | 'line' | 'dashed' | 'line+area' | 'dashed+area';
}

export interface LinksItem {
  title: string;
  url: string;
  targetBlank: boolean;
}

export interface IStandardOptions {
  unit?: string; // 纠正的单位
  min?: number;
  max?: number;
  decimals?: number;
  dateFormat?: string;
  displayName?: string;
}

// 一些通用的配置，不同类型的图表可选择性使用配置
export interface IOptions {
  valueMappings?: IValueMapping[];
  thresholds?: IThresholds;
  thresholdsStyle?: ThresholdsStyle;
  xThresholds?: IThresholds;
  standardOptions?: IStandardOptions;
  legend?: {
    // TODO: 目前不支持这么复杂的自定义
    calcs: string[];
    displayMode: 'list' | 'table' | 'hidden';
    placement: 'right' | 'bottom';
    heightInPercentage?: number;
    widthInPercentage?: number;
    columns?: string[];
    detailName: string;
    detailUrl: string;
    behaviour: 'showItem' | 'hideItem';
    selectMode: 'single' | 'multiple';
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  };
  tooltip?: {
    mode: 'single' | 'all';
    sort: 'none' | 'asc' | 'desc';
  };
  colors?: {
    scheme: string;
  };
  links?: LinksItem[];
}

export interface IOverride {
  matcher: {
    id?: 'byFrameRefID' | 'byName';
    type?: 'byFrameRefID' | 'byName'; // 兼容历史配置
    value: string;
  };
  properties: {
    width?: number;
    [key: string]: JsonValue | IStandardOptions | IValueMapping[] | number | undefined;
  };
}

export interface ILink {
  type: 'link' | 'dashboards';
  title: string;
  url: string;
  targetBlank?: boolean;
  dashboardIds?: number[];
  dashboards: {
    id: number;
    name: string;
    ident: string;
  }[];
}

export interface ITimeseriesStyles {
  version: string;
  drawStyle: 'lines' | 'bars';
  lineInterpolation: 'linear' | 'smooth';
  fillOpacity: number;
  stack: 'off' | 'normal'; // off 关闭；normal 开启，此结构未后期其他模式预留
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
  displayMode: 'basic' | 'lcd';
  calc: string;
  valueField?: string;
  nameField?: string;
  maxValue: number;
  baseColor: string;
  serieWidth: number | null;
  sortOrder: 'none' | 'asc' | 'desc';
  detailUrl: string | undefined;
  valueMode: 'color' | 'hidden';
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
    [key: string]: JsonValue;
  };
  disabled?: boolean;
}

export interface IPanel {
  version: string; // 单个图表面板使用的版本
  id: string;
  name: string;
  links?: ILink[];
  description: string;
  layout: IGridPos;
  /**
   * @deprecated 仅用于迁移 4.0.0 之前的面板配置，新的数据源配置位于 targets[].datasource。
   */
  datasourceCate?: string;
  /**
   * @deprecated 仅用于迁移 4.0.0 之前的面板配置，新的数据源配置位于 targets[].datasource。
   */
  datasourceValue?: number | string;
  targets: ITarget[];
  type: IType;
  options: IOptions;
  custom: JsonObject; // 图表持久化配置
  overrides: IOverride[];
  collapsed?: boolean; // 用于 row 展开收起控制是否显示
  panels?: IPanel[]; // 用于 row 收起时保存子面板
  transformations?: ITransformation[];
  transformationsNG?: ITransformation[]; // NG 版本的变换
  repeat?: string;
  maxPerRow?: number;
  repeatPanelId?: string;
  scopedVars?: ScopedVariables;
  maxDataPoints?: number; // 2025-10-20 新增
  queryOptionsTime?: IRawTimeRange; // 2025-10-20 新增， queryOptionsTime 会覆盖 time
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
  mode?: 'iframe';
  iframe_url?: string;
}

export interface IDashboard {
  create_by: string;
  favorite: number;
  id: number;
  name: string;
  ident?: string;
  tags: string;
  note?: string;
  update_at: number;
  update_by: string;
  configs: IDashboardConfig;
  public?: number;
  group_id: number;
}

export interface VariableQuerybuilderProps<VariableType = JsonObject> {
  dashboardId: string;
  variables: VariableType[];
  datasourceCate: string;
  datasourceValue: number;
}

/**
 * cellOptions interface
 * type: 'color-text' | 'color-background' | 'gauge'
 * 当 type = color-background 时
 * {
 *   type: 'color-background';
 *   mode: 'basic' | 'gradient';
 * }
 * 当 type = gauge 时
 * {
 *   type: 'gauge';
 *   mode: 'basic' | 'lcd';
 *   valueDisplayMode: 'value' | 'color' | 'hidden';
 * }
 */
export interface CellOptions {
  type: 'color-text' | 'color-background' | 'gauge';
  mode: 'basic' | 'gradient' | 'lcd'; // 当 type = color-background 时，mode 可选
  valueDisplayMode: 'text' | 'color' | 'hidden'; // 当 type = gauge 时，valueDisplayMode 可选
  wrapText: boolean; // 是否开启单元格文本换行
}
