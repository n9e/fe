import { IOverride } from '@/pages/dashboard/types';

import { getColumnWidthColDef, getOverrideColumnWidths, getResolvedColumnWidths, readCachedColumnWidths, removeCachedColumnWidth, upsertColumnWidthOverride } from './columnWidth';

function createStorage(initialValue: Record<string, string> = {}) {
  const values = { ...initialValue };
  return {
    getItem: jest.fn((key: string) => values[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete values[key];
    }),
    values,
  };
}

describe('TableNG column width utils', () => {
  it('builds a fixed-width column definition that disables default flex layout', () => {
    expect(getColumnWidthColDef(180)).toEqual({ width: 180, flex: 0 });
    expect(getColumnWidthColDef(99)).toEqual({});
  });

  it('uses the last valid byName override and lets overrides take precedence over cache', () => {
    const overrides = [
      { matcher: { id: 'byName', value: 'host' }, properties: { width: 120 } },
      { matcher: { id: 'byName', value: 'host' }, properties: { width: 180 } },
      { matcher: { id: 'byName', value: 'value' }, properties: { width: 80 } },
      { matcher: { type: 'byName', value: 'legacy' }, properties: { width: 130 } },
    ] as IOverride[];

    expect(getOverrideColumnWidths(overrides)).toEqual({ host: 180, legacy: 130 });
    expect(getResolvedColumnWidths({ host: 140, value: 160 }, overrides)).toEqual({
      host: 180,
      value: 160,
      legacy: 130,
    });
  });

  it('merges width into the last matching override and preserves other properties', () => {
    const overrides = [
      { matcher: { id: 'byName', value: 'host' }, properties: { width: 120 } },
      {
        matcher: { id: 'byName', value: 'host' },
        properties: { cellOptions: { type: 'color-text' }, thresholds: { mode: 'absolute' } },
      },
    ] as IOverride[];

    expect(upsertColumnWidthOverride(overrides, 'host', 240)).toEqual([
      overrides[0],
      {
        matcher: { id: 'byName', value: 'host' },
        properties: {
          cellOptions: { type: 'color-text' },
          thresholds: { mode: 'absolute' },
          width: 240,
        },
      },
    ]);
  });

  it('appends a byName override when the field has no matching rule', () => {
    expect(upsertColumnWidthOverride([], 'host', 200)).toEqual([
      {
        matcher: { id: 'byName', value: 'host' },
        properties: { width: 200 },
      },
    ]);
  });

  it('removes only the migrated field and removes the storage key when no widths remain', () => {
    const storage = createStorage({
      widths: JSON.stringify({ host: 180, value: 220 }),
    });

    expect(removeCachedColumnWidth('widths', 'host', storage)).toEqual({ value: 220 });
    expect(storage.setItem).toHaveBeenCalledWith('widths', JSON.stringify({ value: 220 }));

    expect(removeCachedColumnWidth('widths', 'value', storage)).toEqual({});
    expect(storage.removeItem).toHaveBeenCalledWith('widths');
  });

  it('ignores malformed cache data and invalid widths', () => {
    const malformedStorage = createStorage({ widths: '{malformed' });
    const invalidStorage = createStorage({
      widths: JSON.stringify({ tooSmall: 99, infinite: null, valid: 100, text: '200' }),
    });

    expect(readCachedColumnWidths('widths', malformedStorage)).toEqual({});
    expect(readCachedColumnWidths('widths', invalidStorage)).toEqual({ valid: 100 });
    expect(readCachedColumnWidths(null, invalidStorage)).toEqual({});
  });
});
