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
    AiButtonPanel: StubChart,
    PiePanel: StubChart,
    HexbinPanel: StubChart,
    BarGaugePanel: StubChart,
    GaugePanel: StubChart,
    HeatmapPanel: StubChart,
    BarChartPanel: StubChart,
  };
});
describe('panel type registry', () => {
  it('keeps the visualization selectors in the configured display order', () => {
    expect(PANEL_VISUALIZATION_TYPES).toEqual([
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
      'aiButton',
    ]);
    expect(visualizations.map((item) => item.type)).toEqual(PANEL_VISUALIZATION_TYPES);
  });

  it('registers a renderer and defaults for every visualization type', () => {
    PANEL_VISUALIZATION_TYPES.forEach((type) => {
      const definition = getPanelTypeDefinition(type);

      expect(definition).toBeDefined();
      expect(definition?.type).toBe(type);
      expect(typeof definition?.chart).toBe('function');
      expect(definition?.defaultCustom).toBeDefined();
      expect(definition?.defaultOptions).toBeDefined();
    });
  });

  it('returns no definition for row and unknown types', () => {
    expect(getPanelTypeDefinition('row')).toBeUndefined();
    expect(getPanelTypeDefinition('not-a-chart')).toBeUndefined();
  });
});
