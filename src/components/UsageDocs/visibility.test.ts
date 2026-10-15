import { shouldShowUsageDocs } from './visibility';

describe('usage document visibility', () => {
  it('keeps documents visible when the setting is missing', () => {
    expect(shouldShowUsageDocs(undefined, true)).toBe(true);
  });

  it('hides documents only when the enterprise setting is true', () => {
    expect(shouldShowUsageDocs(true, true)).toBe(false);
    expect(shouldShowUsageDocs(false, true)).toBe(true);
  });

  it('does not affect the open source edition', () => {
    expect(shouldShowUsageDocs(true, false)).toBe(true);
  });
});
