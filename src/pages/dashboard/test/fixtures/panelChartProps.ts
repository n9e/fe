import type { PanelChartProps } from '@/pages/dashboard/Renderer/registry/types';
import type { IPanel } from '@/pages/dashboard/types';

/** 构造图表适配层的 props；测试只覆盖当前用例关心的字段，其余使用最小可用面板。 */
export function createPanelChartProps(overrides: Partial<PanelChartProps> = {}): PanelChartProps {
  const values: IPanel = {
    id: 'panel-1',
    name: 'Panel',
    description: '',
    layout: { h: 8, w: 12, x: 0, y: 0, i: 'panel-1' },
    targets: [],
    type: 'pie',
    options: {},
    custom: {},
    overrides: [],
  };

  return {
    id: values.id,
    values,
    series: [],
    rawSeries: [],
    annotations: [],
    bodyWrapRef: { current: null },
    tableRef: { current: null },
    tableNGRef: { current: null },
    ...overrides,
  };
}
