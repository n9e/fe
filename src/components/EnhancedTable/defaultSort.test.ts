jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/TableTags/Tags', () => ({ default: () => null }));

import type { ColumnType } from 'antd/lib/table';

import { dateColumn, updateAtColumn } from './columns';
import { hasExplicitSortOrder, withUpdateTimeDefaultSort } from './defaultSort';

function orderOf(columns: ColumnType<any>[], dataIndex: string) {
  return columns.find((column) => column.dataIndex === dataIndex)?.defaultSortOrder;
}

describe('updateAtColumn', () => {
  it('defaults to the update_at field, unix timestamps and a local sorter', () => {
    const column = updateAtColumn({ title: '更新时间' });
    expect(column.dataIndex).toBe('update_at');
    expect(typeof column.sorter).toBe('function');
  });

  it('lets the caller override the field it reads', () => {
    expect(updateAtColumn({ title: '更新时间', dataIndex: 'mtime' }).dataIndex).toBe('mtime');
  });
});

describe('hasExplicitSortOrder', () => {
  it('is false when no column declares an order', () => {
    expect(hasExplicitSortOrder([{ dataIndex: 'name' }, updateAtColumn({ title: '更新时间' })])).toBe(false);
  });

  it('finds an order declared on a nested child column', () => {
    expect(hasExplicitSortOrder([{ title: 'group', children: [{ dataIndex: 'name', defaultSortOrder: 'ascend' }] }])).toBe(true);
  });
});

describe('withUpdateTimeDefaultSort', () => {
  it('sorts the marked column descending', () => {
    const columns = [{ dataIndex: 'name' }, updateAtColumn({ title: '更新时间' })];
    const next = withUpdateTimeDefaultSort(columns);
    expect(orderOf(next, 'update_at')).toBe('descend');
    expect(orderOf(next, 'name')).toBeUndefined();
  });

  it('follows the marker to whatever field the column reads', () => {
    const columns = [updateAtColumn({ title: '更新时间', dataIndex: 'mtime' })];
    expect(orderOf(withUpdateTimeDefaultSort(columns), 'mtime')).toBe('descend');
  });

  it('does not mutate the columns it was given', () => {
    const columns = [updateAtColumn({ title: '更新时间' })];
    withUpdateTimeDefaultSort(columns);
    expect(columns[0].defaultSortOrder).toBeUndefined();
  });

  it('leaves an unmarked date column alone, which is how server-paginated tables keep backend order', () => {
    const columns = [dateColumn({ title: '更新时间', dataIndex: 'update_at', unix: true, sortable: true })];
    expect(withUpdateTimeDefaultSort(columns)).toBe(columns);
  });

  it('never sorts on a field name alone', () => {
    const columns = [{ dataIndex: 'update_at', sorter: (a: any, b: any) => a.update_at - b.update_at }];
    expect(withUpdateTimeDefaultSort(columns)).toBe(columns);
  });

  it('skips a marked column whose sorting was handed to the server', () => {
    const columns = [updateAtColumn({ title: '更新时间', sorter: true })];
    expect(withUpdateTimeDefaultSort(columns)).toBe(columns);
  });

  it('leaves a table alone when another column already declares an order', () => {
    const columns = [{ dataIndex: 'name', sorter: () => 0, defaultSortOrder: 'ascend' as const }, updateAtColumn({ title: '更新时间' })];
    expect(withUpdateTimeDefaultSort(columns)).toBe(columns);
  });

  it('respects an order declared on the update-time column itself', () => {
    const columns = [updateAtColumn({ title: '更新时间', defaultSortOrder: 'ascend' })];
    expect(withUpdateTimeDefaultSort(columns)).toBe(columns);
    expect(orderOf(columns, 'update_at')).toBe('ascend');
  });
});
