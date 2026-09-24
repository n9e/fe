import type { IType } from '../../types';
import {
  BarChartPanel,
  BarGaugePanel,
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
 * 图表注册表：统一图表类型、渲染器、编辑器选项面板加载器和默认配置。
 *
 * 约束：
 * - `loadOptions` 只允许动态 import，查看态（渲染器）引用本模块时不会静态引入编辑器；
 * - 低频图表（pie / hexbin / barGauge / gauge / heatmap / barchart）的渲染器按需加载；
 * - 类型顺序由 `panelTypes.ts` 的 `PANEL_VISUALIZATION_TYPES` 唯一定义。
 */
const panelTypeRegistry: Record<PanelVisualizationType, PanelTypeDefinition> = {
  timeseries: {
    type: 'timeseries',
    chart: TimeseriesPanel,
    loadOptions: () => import('../../Editor/Options/Timeseries'),
    defaultCustom: defaultCustomValuesMap.timeseries,
    defaultOptions: defaultOptionsValuesMap.timeseries,
  },
  barchart: {
    type: 'barchart',
    chart: BarChartPanel,
    loadOptions: () => import('../../Editor/Options/BarChart'),
    defaultCustom: defaultCustomValuesMap.barchart,
    defaultOptions: defaultOptionsValuesMap.barchart,
  },
  stat: {
    type: 'stat',
    chart: StatPanel,
    loadOptions: () => import('../../Editor/Options/Stat'),
    defaultCustom: defaultCustomValuesMap.stat,
    defaultOptions: defaultOptionsValuesMap.stat,
  },
  tableNG: {
    type: 'tableNG',
    chart: TablePanelNG,
    loadOptions: () => import('../../Editor/Options/TableNG'),
    defaultCustom: defaultCustomValuesMap.tableNG,
    defaultOptions: defaultOptionsValuesMap.tableNG,
  },
  table: {
    type: 'table',
    chart: TablePanel,
    loadOptions: () => import('../../Editor/Options/Table'),
    defaultCustom: defaultCustomValuesMap.table,
    defaultOptions: defaultOptionsValuesMap.table,
  },
  pie: {
    type: 'pie',
    chart: PiePanel,
    loadOptions: () => import('../../Editor/Options/Pie'),
    defaultCustom: defaultCustomValuesMap.pie,
    defaultOptions: defaultOptionsValuesMap.pie,
  },
  hexbin: {
    type: 'hexbin',
    chart: HexbinPanel,
    loadOptions: () => import('../../Editor/Options/Hexbin'),
    defaultCustom: defaultCustomValuesMap.hexbin,
    defaultOptions: defaultOptionsValuesMap.hexbin,
  },
  barGauge: {
    type: 'barGauge',
    chart: BarGaugePanel,
    loadOptions: () => import('../../Editor/Options/BarGauge'),
    defaultCustom: defaultCustomValuesMap.barGauge,
    defaultOptions: defaultOptionsValuesMap.barGauge,
  },
  text: {
    type: 'text',
    chart: TextPanel,
    loadOptions: () => import('../../Editor/Options/Text'),
    defaultCustom: defaultCustomValuesMap.text,
    defaultOptions: defaultOptionsValuesMap.text,
  },
  gauge: {
    type: 'gauge',
    chart: GaugePanel,
    loadOptions: () => import('../../Editor/Options/Gauge'),
    defaultCustom: defaultCustomValuesMap.gauge,
    defaultOptions: defaultOptionsValuesMap.gauge,
  },
  heatmap: {
    type: 'heatmap',
    chart: HeatmapPanel,
    loadOptions: () => import('../../Editor/Options/Heatmap'),
    defaultCustom: defaultCustomValuesMap.heatmap,
    defaultOptions: defaultOptionsValuesMap.heatmap,
  },
  iframe: {
    type: 'iframe',
    chart: IframePanel,
    loadOptions: () => import('../../Editor/Options/Iframe'),
    defaultCustom: defaultCustomValuesMap.iframe,
    defaultOptions: defaultOptionsValuesMap.iframe,
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
