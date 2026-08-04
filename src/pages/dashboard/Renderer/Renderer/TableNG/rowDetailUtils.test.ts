import { ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS, getDisplayedRowDetails, serializeRowDetail, serializeRowDetailValue, shouldIgnoreRowDetailClickAway } from './rowDetailUtils';

describe('TableNG row detail serialization', () => {
  test.each([
    ['text', 'text'],
    [42, '42'],
    [true, 'true'],
    [null, 'null'],
    [undefined, ''],
    [{ nested: 'value' }, '{"nested":"value"}'],
    [[1, 'two'], '[1,"two"]'],
  ])('serializes a field value without losing its raw meaning', (value, expected) => {
    expect(serializeRowDetailValue(value)).toBe(expected);
  });

  it('serializes a complete row as formatted JSON', () => {
    expect(
      serializeRowDetail({
        text: 'value',
        number: 42,
        empty: null,
        object: { nested: true },
      }),
    ).toBe(
      `{
  "text": "value",
  "number": 42,
  "empty": null,
  "object": {
    "nested": true
  }
}`,
    );
  });

  it('falls back safely for circular values', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(serializeRowDetailValue(circular)).toBe('[object Object]');
    expect(serializeRowDetail(circular)).toBe('[object Object]');
  });
});

describe('TableNG displayed row details', () => {
  it('uses the current filtered and sorted grid order', () => {
    const firstFormatted = {};
    const secondFormatted = {};
    const filteredFormatted = {};
    const firstSource = { id: 'first', hidden: 'visible in details' };
    const secondSource = { id: 'second' };
    const sourceRows = new WeakMap<object, Record<string, unknown>>([
      [firstFormatted, firstSource],
      [secondFormatted, secondSource],
      [filteredFormatted, { id: 'filtered-out' }],
    ]);
    const api = {
      forEachNodeAfterFilterAndSort(callback: (node: { data: object }) => void) {
        callback({ data: secondFormatted });
        callback({ data: firstFormatted });
      },
    };

    expect(getDisplayedRowDetails(api, sourceRows, firstFormatted)).toEqual({
      rows: [secondSource, firstSource],
      currentIndex: 1,
    });
  });

  it('does not open details for a row without a source mapping', () => {
    const api = {
      forEachNodeAfterFilterAndSort: jest.fn(),
    };

    expect(getDisplayedRowDetails(api, new WeakMap(), {})).toEqual({
      rows: [],
      currentIndex: -1,
    });
    expect(api.forEachNodeAfterFilterAndSort).not.toHaveBeenCalled();
  });
});

describe('TableNG row detail click-away handling', () => {
  it('ignores clicks inside the drawer or its popup menus', () => {
    const closest = jest.fn().mockReturnValue({});
    const target = { closest } as unknown as HTMLElement;

    expect(shouldIgnoreRowDetailClickAway(target)).toBe(true);
    expect(closest).toHaveBeenCalledWith(`.${ROW_DETAIL_IGNORE_CLICK_AWAY_CLASS}`);
  });

  it('allows clicks elsewhere to close the drawer', () => {
    const target = { closest: jest.fn().mockReturnValue(null) } as unknown as HTMLElement;

    expect(shouldIgnoreRowDetailClickAway(target)).toBe(false);
    expect(shouldIgnoreRowDetailClickAway(null)).toBe(false);
  });
});
