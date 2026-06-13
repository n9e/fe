jest.mock('@/components/TableTags/Tags', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

import { getUpdateByColumnFilterProps, updateByColumn } from './columns';

describe('updateByColumn', () => {
  it('lets EnhancedTable generate unique local filters from table dataSource', () => {
    const column = updateByColumn({
      title: '更新人',
      dataIndex: 'updated_by',
    });
    const filterProps = getUpdateByColumnFilterProps(column, [{ updated_by: 'alice' }, { updated_by: 'bob' }, { updated_by: 'alice' }, { updated_by: '' }, {}]);

    expect(column.filters).toBeUndefined();
    expect(filterProps.filters).toEqual([
      { text: 'alice', value: 'alice' },
      { text: 'bob', value: 'bob' },
    ]);
    expect(filterProps.onFilter?.('alice', { updated_by: 'alice' })).toBe(true);
    expect(filterProps.onFilter?.('alice', { updated_by: 'bob' })).toBe(false);
  });

  it('does not show a filter when filterMode is none', () => {
    const column = updateByColumn({
      title: '更新人',
      dataIndex: 'updated_by',
      filterMode: 'none',
    });
    const filterProps = getUpdateByColumnFilterProps(column, [{ updated_by: 'alice' }]);

    expect(filterProps.filters).toBeUndefined();
    expect(filterProps.onFilter).toBeUndefined();
  });
});
