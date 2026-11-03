import type { PanelVisualizationType } from './types';

/**
 * 可视化类型的展示顺序。
 *
 * 这是类型顺序的唯一来源：注册表按该顺序组织，
 * `visualizations` 由它派生，让新增面板和编辑器选择使用一致的顺序。
 */
export const PANEL_VISUALIZATION_TYPES: PanelVisualizationType[] = [
  'timeseries',
  'stat',
  'tableNG',
  'barGauge',
  'gauge',
  'hexbin',
  'barchart',
  'pie',
  'table',
  'text',
  'heatmap',
  'iframe',
];

/** 可视化类型选择使用的列表。 */
export const visualizations = PANEL_VISUALIZATION_TYPES.map((type) => ({ type }));

/** 判断字符串是否属于支持的可视化类型。 */
export function isPanelVisualizationType(type: string): type is PanelVisualizationType {
  return (PANEL_VISUALIZATION_TYPES as string[]).includes(type);
}
