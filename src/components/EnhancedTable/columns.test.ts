jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/TableTags/Tags', () => ({ default: () => null }));

import { dateColumn, updateByColumn } from './columns';

describe('dateColumn sortable', () => {
  it('returns a sorter function when sortable is true', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: true });
    expect(col.sorter).toBeDefined();
    expect(typeof col.sorter).toBe('function');
  });

  it('does not set sorter when sortable is false', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: false });
    expect(col.sorter).toBeUndefined();
  });

  it('does not set sorter when sortable is omitted', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true });
    expect(col.sorter).toBeUndefined();
  });

  it('sorts unix timestamps in ascending order', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: true }) as any;
    const data = [{ time: 1700000000 }, { time: 1600000000 }, { time: 1800000000 }];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].time).toBe(1600000000);
    expect(sorted[1].time).toBe(1700000000);
    expect(sorted[2].time).toBe(1800000000);
  });

  it('sorts date strings in ascending order', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'date', sortable: true }) as any;
    const data = [{ date: '2024-03-01' }, { date: '2024-01-15' }, { date: '2024-06-30' }];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].date).toBe('2024-01-15');
    expect(sorted[1].date).toBe('2024-03-01');
    expect(sorted[2].date).toBe('2024-06-30');
  });

  it('puts null values at the end', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: true }) as any;
    const data = [{ time: 1700000000 }, { time: null }, { time: 1600000000 }];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].time).toBe(1600000000);
    expect(sorted[1].time).toBe(1700000000);
    expect(sorted[2].time).toBeNull();
  });

  it('puts undefined values at the end', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: true }) as any;
    const data = [{ time: 1700000000 }, { time: undefined }, { time: 1600000000 }];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].time).toBe(1600000000);
    expect(sorted[1].time).toBe(1700000000);
    expect(sorted[2].time).toBeUndefined();
  });

  it('handles both-null as equal (stable order)', () => {
    const col = dateColumn({ title: '时间', dataIndex: 'time', unix: true, sortable: true }) as any;
    const data = [
      { time: null, id: 1 },
      { time: null, id: 2 },
    ];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].id).toBe(1);
    expect(sorted[1].id).toBe(2);
  });

  it('explicit sorter overrides built-in sortable sorter', () => {
    const customSorter = jest.fn(() => 0);
    const col = dateColumn({
      title: '时间',
      dataIndex: 'time',
      unix: true,
      sortable: true,
      sorter: customSorter,
    });
    expect(col.sorter).toBe(customSorter);
  });

  it('works with nested dataIndex', () => {
    const col = dateColumn({
      title: '时间',
      dataIndex: ['meta', 'time'] as any,
      unix: true,
      sortable: true,
    }) as any;
    const data = [{ meta: { time: 1700000000 } }, { meta: { time: 1600000000 } }];
    const sorted = [...data].sort(col.sorter);
    expect(sorted[0].meta.time).toBe(1600000000);
    expect(sorted[1].meta.time).toBe(1700000000);
  });
});

describe('updateByColumn', () => {
  it('does not set sorter by default', () => {
    const col = updateByColumn({ title: '用户', dataIndex: 'username' });
    expect(col.sorter).toBeUndefined();
  });

  it('renders nickname when available', () => {
    const col = updateByColumn({
      title: '用户',
      dataIndex: 'username',
      nickname: 'nick',
    });
    const record = { username: 'user_a', nick: 'Alice' };
    const el = (col as any).render('user_a', record);
    expect(el.props.children.props.children).toBe('Alice');
  });

  it('falls back to dataIndex value when nickname is missing', () => {
    const col = updateByColumn({
      title: '用户',
      dataIndex: 'username',
      nickname: 'nick',
    });
    const record = { username: 'zhangsan' };
    const el = (col as any).render('zhangsan', record);
    expect(el.props.children.props.children).toBe('zhangsan');
  });
});
