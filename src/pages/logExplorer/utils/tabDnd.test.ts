import { getNextLogExplorerTabName, moveLogExplorerTabItems, resolveTabKey } from './tabDnd';

describe('resolveTabKey', () => {
  const keys = ['tab-a', 'tab:b', 'tab=c'];

  it('returns a raw business key', () => {
    expect(resolveTabKey('tab-a', keys)).toBe('tab-a');
  });

  it('maps React wrapped keys back to business keys', () => {
    expect(resolveTabKey('.$tab-a', keys)).toBe('tab-a');
    expect(resolveTabKey('.$tab=2b', keys)).toBe('tab:b');
    expect(resolveTabKey('.$tab=0c', keys)).toBe('tab=c');
  });

  it('returns undefined for unknown keys', () => {
    expect(resolveTabKey('.$unknown', keys)).toBeUndefined();
  });
});

describe('moveLogExplorerTabItems', () => {
  const items = [{ key: 'a', name: 'Query 1' }, { key: 'b', name: 'Query 2' }, { key: 'c', name: 'Query 3' }];

  it('moves an item by business keys and keeps names with their content', () => {
    expect(moveLogExplorerTabItems(items, 'a', 'c')).toEqual([
      { key: 'b', name: 'Query 2' },
      { key: 'c', name: 'Query 3' },
      { key: 'a', name: 'Query 1' },
    ]);
  });

  it('keeps the same array when dragging onto itself', () => {
    expect(moveLogExplorerTabItems(items, 'a', 'a')).toBe(items);
  });

  it('keeps the same array when ids are not found', () => {
    expect(moveLogExplorerTabItems(items, 'a', 'missing')).toBe(items);
    expect(moveLogExplorerTabItems(items, 'missing', 'a')).toBe(items);
  });

  it('preserves custom names', () => {
    expect(
      moveLogExplorerTabItems(
        [
          { key: 'a', name: 'Query 1' },
          { key: 'b', name: 'Custom' },
          { key: 'c', name: 'Query 3' },
        ],
        'c',
        'a',
      ),
    ).toEqual([
      { key: 'c', name: 'Query 3' },
      { key: 'a', name: 'Query 1' },
      { key: 'b', name: 'Custom' },
    ]);
  });
});

describe('getNextLogExplorerTabName', () => {
  it('uses the next count-based name when it is available', () => {
    expect(getNextLogExplorerTabName([{ key: 'a', name: 'Query 1' }, { key: 'b', name: 'Query 2' }])).toBe('Query 3');
  });

  it('increments until the generated name is unique', () => {
    expect(getNextLogExplorerTabName([{ key: 'a', name: 'Query 1' }, { key: 'b', name: 'Query 2' }, { key: 'c', name: 'Query 4' }])).toBe('Query 5');
  });

  it('ignores custom names unless they collide with the generated name', () => {
    expect(getNextLogExplorerTabName([{ key: 'a', name: 'Custom' }, { key: 'b', name: 'Query 2' }])).toBe('Query 3');
  });
});
