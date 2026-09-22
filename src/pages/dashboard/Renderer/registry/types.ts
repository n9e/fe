import type { ComponentType, RefObject } from 'react';

import type { IRawTimeRange } from '@/components/TimeRangePicker';

import type { DashboardAnnotation, IOptions, IOverride, IPanel, ITarget, IType, JsonObject } from '../../types';
import type { DashboardSeries } from '../datasource/types';
import type { CalculatedSeries } from '../utils/getCalculatedValuesBySeries';

/**
 * 注册表覆盖的可视化类型。
 *
 * 排除 `row`：row 是布局容器而不是图表，既没有渲染器也没有选项面板。
 */
export type PanelVisualizationType = Exclude<IType, 'row'>;

/** 表格渲染器暴露给面板菜单的导出能力。 */
export interface PanelExportHandle {
  exportCsv: () => void;
}

/**
 * 图表适配层统一接收的渲染上下文。
 *
 * 各渲染器的特殊 props（注解、时区、表格 ref 等）都收敛到这里，
 * 让注册表可以用 `<entry.chart {...ctx} />` 统一渲染，
 * 同时保留旧渲染器的入参语义不变。
 */
export interface PanelChartProps {
  id: string;
  values: IPanel;
  /** 供图表消费的计算后序列 */
  series: CalculatedSeries[];
  /** 原始 DashboardSeries，TableNG 等需要按数据源结构处理的图表使用 */
  rawSeries: DashboardSeries[];
  dataRevision?: number;
  onOverridesChange?: (overrides: IOverride[]) => void;
  themeMode?: 'dark';
  isPreview?: boolean;
  /** 查询解析后的时间范围，时序图用于坐标轴展示 */
  time?: IRawTimeRange;
  timezone?: string;
  setRange?: (range: IRawTimeRange) => void;
  annotations: DashboardAnnotation[];
  setAnnotationsRefreshFlag?: (flag: string) => void;
  /** Stat 面板把整卡背景色写到该容器 */
  bodyWrapRef: RefObject<HTMLDivElement>;
  /** table 面板导出 CSV 的 ref */
  tableRef: RefObject<PanelExportHandle>;
  /** tableNG 面板导出 CSV 的 ref */
  tableNGRef: RefObject<PanelExportHandle>;
}

/** 图表适配组件：所有可视化类型的 props 都收敛为 PanelChartProps。 */
export type PanelChartAdapter = ComponentType<PanelChartProps>;

/** 编辑器选项面板统一接收的 props。 */
export interface PanelOptionsProps {
  targets: ITarget[];
}

type PartialOptionValue<T> = NonNullable<T> extends Array<unknown> ? NonNullable<T> : NonNullable<T> extends object ? Partial<NonNullable<T>> : T;

/**
 * 新建面板时的 options 默认值。
 *
 * 各类型只覆盖自己需要的字段，因此按 `IOptions` 的局部形状声明：
 * 顶层与内层对象的字段都可缺省，而枚举字段仍然收窄为字面量类型。
 * 若直接标注为 `IOptions`，这些默认值必须补全 `legend` 等全部必填字段，
 * 等于凭空改变新建面板的默认配置。
 */
export type PanelDefaultOptions = {
  [K in keyof IOptions]?: PartialOptionValue<IOptions[K]>;
};

/**
 * 注册表中的单个可视化类型定义。
 *
 * `loadOptions` 必须是动态 import：查看态只引用注册表本身，
 * 不能因为注册表而把编辑器选项面板打进同一份同步依赖。
 */
export interface PanelTypeDefinition {
  type: PanelVisualizationType;
  chart: PanelChartAdapter;
  loadOptions: () => Promise<{ default: ComponentType<PanelOptionsProps> }>;
  /** 新建该类型面板时的 custom 默认值 */
  defaultCustom: JsonObject;
  /** 新建该类型面板时的 options 默认值 */
  defaultOptions: PanelDefaultOptions;
}
