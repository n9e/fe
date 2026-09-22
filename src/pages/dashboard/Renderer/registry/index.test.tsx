/** @jest-environment jsdom */
import { getPanelTypeDefinition, PANEL_VISUALIZATION_TYPES, visualizations } from './index';

jest.mock('./panelCharts', () => {
  const StubChart = () => null;
  return {
    TimeseriesPanel: StubChart,
    StatPanel: StubChart,
    TablePanel: StubChart,
    TablePanelNG: StubChart,
    TextPanel: StubChart,
    IframePanel: StubChart,
    PiePanel: StubChart,
    HexbinPanel: StubChart,
    BarGaugePanel: StubChart,
    GaugePanel: StubChart,
    HeatmapPanel: StubChart,
    BarChartPanel: StubChart,
  };
});
// 编辑器选项面板依赖 @/utils/constant，该模块在源码中使用 import.meta，node 测试环境无法解析
jest.mock('@/utils/constant', () => ({ PRIMARY_COLOR: '#3274d9', SIZE: 8 }));

describe('panel type registry', () => {
  it('keeps the historical visualization order', () => {
    expect(PANEL_VISUALIZATION_TYPES).toEqual(['timeseries', 'barchart', 'stat', 'tableNG', 'table', 'pie', 'hexbin', 'barGauge', 'text', 'gauge', 'heatmap', 'iframe']);
    expect(visualizations.map((item) => item.type)).toEqual(PANEL_VISUALIZATION_TYPES);
  });

  it('registers a renderer, an option loader and defaults for every visualization type', () => {
    PANEL_VISUALIZATION_TYPES.forEach((type) => {
      const definition = getPanelTypeDefinition(type);

      expect(definition).toBeDefined();
      expect(definition?.type).toBe(type);
      expect(typeof definition?.chart).toBe('function');
      expect(typeof definition?.loadOptions).toBe('function');
      expect(definition?.defaultCustom).toBeDefined();
      expect(definition?.defaultOptions).toBeDefined();
    });
  });

  it('returns no definition for row and unknown types', () => {
    expect(getPanelTypeDefinition('row')).toBeUndefined();
    expect(getPanelTypeDefinition('not-a-chart')).toBeUndefined();
  });

  it('loads the editor options module on demand', async () => {
    const optionsModule = await getPanelTypeDefinition('text')!.loadOptions();

    expect(typeof optionsModule.default).toBe('function');
  });
});
