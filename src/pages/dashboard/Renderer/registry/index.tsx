import type { IType } from '../../types';
import {
  BarChartPanel,
  BarGaugePanel,
  AiButtonPanel,
  GaugePanel,
  HeatmapPanel,
  HexbinPanel,
  IframePanel,
  PiePanel,
  StatPanel,
  TablePanel,
  TablePanelNG,
  TextPanel,
  TimeseriesPanel,
} from './panelCharts';
import { defaultCustomValuesMap, defaultOptionsValuesMap } from './defaults';
import { PANEL_VISUALIZATION_TYPES } from './panelTypes';
import type { PanelTypeDefinition, PanelVisualizationType } from './types';

export * from './types';
export * from './panelTypes';
export { defaultCustomValuesMap, defaultOptionsValuesMap, defaultOptionsValues, defaultThreshold, gaugeDefaultThresholds } from './defaults';

/**
 * 图表注册表：统一图表类型、渲染器与默认配置。
 *
 * 约束：
 * - 编辑器选项组件由 Editor/Options 注册，面板渲染入口不依赖编辑器；
 * - 所有图表渲染器静态加载，避免显示面板时动态加载模块失败；
 * - 类型顺序由 `panelTypes.ts` 的 `PANEL_VISUALIZATION_TYPES` 唯一定义。
 */
const panelTypeRegistry: Record<PanelVisualizationType, PanelTypeDefinition> = {
  timeseries: {
    type: 'timeseries',
    chart: TimeseriesPanel,
    defaultCustom: defaultCustomValuesMap.timeseries,
    defaultOptions: defaultOptionsValuesMap.timeseries,
  },
  barchart: {
    type: 'barchart',
    chart: BarChartPanel,
    defaultCustom: defaultCustomValuesMap.barchart,
    defaultOptions: defaultOptionsValuesMap.barchart,
  },
  stat: {
    type: 'stat',
    chart: StatPanel,
    defaultCustom: defaultCustomValuesMap.stat,
    defaultOptions: defaultOptionsValuesMap.stat,
  },
  tableNG: {
    type: 'tableNG',
    chart: TablePanelNG,
    defaultCustom: defaultCustomValuesMap.tableNG,
    defaultOptions: defaultOptionsValuesMap.tableNG,
  },
  table: {
    type: 'table',
    chart: TablePanel,
    defaultCustom: defaultCustomValuesMap.table,
    defaultOptions: defaultOptionsValuesMap.table,
  },
  pie: {
    type: 'pie',
    chart: PiePanel,
    defaultCustom: defaultCustomValuesMap.pie,
    defaultOptions: defaultOptionsValuesMap.pie,
  },
  hexbin: {
    type: 'hexbin',
    chart: HexbinPanel,
    defaultCustom: defaultCustomValuesMap.hexbin,
    defaultOptions: defaultOptionsValuesMap.hexbin,
  },
  barGauge: {
    type: 'barGauge',
    chart: BarGaugePanel,
    defaultCustom: defaultCustomValuesMap.barGauge,
    defaultOptions: defaultOptionsValuesMap.barGauge,
  },
  text: {
    type: 'text',
    chart: TextPanel,
    defaultCustom: defaultCustomValuesMap.text,
    defaultOptions: defaultOptionsValuesMap.text,
  },
  gauge: {
    type: 'gauge',
    chart: GaugePanel,
    defaultCustom: defaultCustomValuesMap.gauge,
    defaultOptions: defaultOptionsValuesMap.gauge,
  },
  heatmap: {
    type: 'heatmap',
    chart: HeatmapPanel,
    defaultCustom: defaultCustomValuesMap.heatmap,
    defaultOptions: defaultOptionsValuesMap.heatmap,
  },
  iframe: {
    type: 'iframe',
    chart: IframePanel,
    defaultCustom: defaultCustomValuesMap.iframe,
    defaultOptions: defaultOptionsValuesMap.iframe,
  },
  aiButton: {
    type: 'aiButton',
    chart: AiButtonPanel,
    defaultCustom: defaultCustomValuesMap.aiButton,
    defaultOptions: defaultOptionsValuesMap.aiButton,
  },
};

// 顺序列表与注册表必须一一对应，避免新增类型时只改一处。
PANEL_VISUALIZATION_TYPES.forEach((type) => {
  if (!panelTypeRegistry[type]) {
    throw new Error(`Panel type "${type}" is listed in PANEL_VISUALIZATION_TYPES but missing from the registry`);
  }
});

/** 取得指定类型的注册项；未知类型返回 undefined，由调用方决定提示方式。 */
export function getPanelTypeDefinition(type: IType | string): PanelTypeDefinition | undefined {
  return (panelTypeRegistry as Record<string, PanelTypeDefinition | undefined>)[type];
}
