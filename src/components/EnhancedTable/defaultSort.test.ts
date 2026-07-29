import type { ColumnType } from 'antd/lib/table';

import { hasExplicitSortOrder, isServerPaginated, withUpdateTimeDefaultSort } from './defaultSort';

const comparator = (a: any, b: any) => a.update_at - b.update_at;

function orderOf(columns: ColumnType<any>[], dataIndex: string) {
  return columns.find((column) => column.dataIndex === dataIndex)?.defaultSortOrder;
}

describe('isServerPaginated', () => {
  it('is false when pagination is omitted, disabled, or has no total', () => {
    expect(isServerPaginated(undefined)).toBe(false);
    expect(isServerPaginated(false)).toBe(false);
    expect(isServerPaginated({ pageSize: 15, current: 1 })).toBe(false);
  });

  it('is true when the caller supplies a total', () => {
    expect(isServerPaginated({ pageSize: 15, current: 1, total: 120 })).toBe(true);
    expect(isServerPaginated({ total: 0 })).toBe(true);
  });
});

describe('hasExplicitSortOrder', () => {
  it('is false when no column declares an order', () => {
    expect(hasExplicitSortOrder([{ dataIndex: 'name' }, { dataIndex: 'update_at', sorter: comparator }])).toBe(false);
  });

  it('finds an order declared on a nested child column', () => {
    expect(hasExplicitSortOrder([{ title: 'group', children: [{ dataIndex: 'name', sorter: comparator, defaultSortOrder: 'ascend' }] }])).toBe(true);
  });
});

describe('withUpdateTimeDefaultSort', () => {
  it('sorts the update-time column descending', () => {
    const columns = [{ dataIndex: 'name' }, { dataIndex: 'update_at', sorter: comparator }] satisfies ColumnType<any>[];
    const next = withUpdateTimeDefaultSort(columns, false);
    expect(orderOf(next, 'update_at')).toBe('descend');
    expect(orderOf(next, 'name')).toBeUndefined();
  });

  it('does not mutate the columns it was given', () => {
    const columns = [{ dataIndex: 'update_at', sorter: comparator }] satisfies ColumnType<any>[];
    withUpdateTimeDefaultSort(columns, false);
    expect(columns[0].defaultSortOrder).toBeUndefined();
  });

  it('accepts a sorter declared in object form', () => {
    const columns = [{ dataIndex: 'update_at', sorter: { compare: comparator, multiple: 1 } }] satisfies ColumnType<any>[];
    expect(orderOf(withUpdateTimeDefaultSort(columns, false), 'update_at')).toBe('descend');
  });

  it('matches the leaf key of a path dataIndex', () => {
    const columns = [{ dataIndex: ['meta', 'update_at'], sorter: comparator }] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, false)[0].defaultSortOrder).toBe('descend');
  });

  it('skips server-paginated tables, whose rows are only one page', () => {
    const columns = [{ dataIndex: 'update_at', sorter: comparator }] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, true)).toBe(columns);
  });

  it('skips columns that defer sorting to the server', () => {
    const columns = [{ dataIndex: 'update_at', sorter: true }] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, false)).toBe(columns);
  });

  it('skips columns with no sorter at all', () => {
    const columns = [{ dataIndex: 'update_at' }] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, false)).toBe(columns);
  });

  it('leaves a table alone when another column already declares an order', () => {
    const columns = [
      { dataIndex: 'name', sorter: comparator, defaultSortOrder: 'ascend' },
      { dataIndex: 'update_at', sorter: comparator },
    ] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, false)).toBe(columns);
  });

  it('ignores create_at and other date columns', () => {
    const columns = [{ dataIndex: 'create_at', sorter: comparator }] satisfies ColumnType<any>[];
    expect(withUpdateTimeDefaultSort(columns, false)).toBe(columns);
  });

  it('prefers update_at over the other recognised spellings', () => {
    const columns = [
      { dataIndex: 'update_time', sorter: comparator },
      { dataIndex: 'update_at', sorter: comparator },
    ] satisfies ColumnType<any>[];
    const next = withUpdateTimeDefaultSort(columns, false);
    expect(orderOf(next, 'update_at')).toBe('descend');
    expect(orderOf(next, 'update_time')).toBeUndefined();
  });

  it('falls back to an alternative spelling when update_at is absent', () => {
    const columns = [{ dataIndex: 'updated_at', sorter: comparator }] satisfies ColumnType<any>[];
    expect(orderOf(withUpdateTimeDefaultSort(columns, false), 'updated_at')).toBe('descend');
  });
});
