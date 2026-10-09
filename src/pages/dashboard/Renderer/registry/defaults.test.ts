import { defaultCustomValuesMap } from './defaults';

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
