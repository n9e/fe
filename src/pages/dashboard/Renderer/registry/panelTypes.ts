import type { PanelVisualizationType } from './types';

/**
 * 可视化类型的展示顺序。
 *
 * 这是类型顺序的唯一来源：注册表按该顺序组织，
 * `visualizations` 由它派生，保持与历史下拉顺序一致。
 */
export const PANEL_VISUALIZATION_TYPES: PanelVisualizationType[] = [
  'timeseries',
  'barchart',
  'stat',
  'tableNG',
  'table',
  'pie',
  'hexbin',
  'barGauge',
  'text',
  'gauge',
  'heatmap',
  'iframe',
];

/** 可视化类型选择使用的列表。 */
export const visualizations = PANEL_VISUALIZATION_TYPES.map((type) => ({ type }));

/** 判断字符串是否属于支持的可视化类型。 */
export function isPanelVisualizationType(type: string): type is PanelVisualizationType {
  return (PANEL_VISUALIZATION_TYPES as string[]).includes(type);
}
