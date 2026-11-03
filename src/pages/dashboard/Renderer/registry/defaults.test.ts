import { defaultCustomValuesMap, defaultThreshold, gaugeDefaultThresholds } from './defaults';

describe('bar chart defaults', () => {
  it('provides the required axis fields before the preview renders', () => {
    expect(defaultCustomValuesMap.barchart).toEqual(
      expect.objectContaining({
        xAxisField: 'Name',
        yAxisField: 'Value',
      }),
    );
  });
});

describe('theme-aware threshold defaults', () => {
  it('uses built-in color tokens for default and gauge thresholds', () => {
    expect(defaultThreshold.color).toBe('green-9');
    expect(gaugeDefaultThresholds.map(({ color }) => color)).toEqual(['green-9', 'orange-9', 'red-9']);
  });
});
