import getFormattedRowData from './getFormattedRowData';
import type { TableData } from '@/pages/dashboard/transformations/types';
import type { CellOptions, IOptions, IOverride } from '@/pages/dashboard/types';

type RowData = {
  [key: string]: string | number | null;
};

function createTableData(rows: RowData[]): TableData & { id: string; columns: string[]; rows: RowData[] } {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return {
    id: 'rawData',
    refId: 'rawData',
    columns,
    fields: columns.map((name) => ({
      name,
      type: 'string',
      values: rows.map((row) => row[name] ?? null),
      state: {},
    })),
    rows,
  };
}

const basePanelParams = {
  cellOptions: { type: 'none' } as CellOptions,
  options: {} as IOptions,
  overrides: [] as IOverride[],
};

describe('TableNG getFormattedRowData', () => {
  it('tableData 为 undefined（activeIndex 越界）时返回空数组，不抛错', () => {
    expect(getFormattedRowData(undefined as unknown as Parameters<typeof getFormattedRowData>[0], basePanelParams)).toEqual([]);
    expect(getFormattedRowData(null as unknown as Parameters<typeof getFormattedRowData>[0], basePanelParams)).toEqual([]);
  });

  it('rows 不是数组时返回空数组', () => {
    const bad = { id: 'x', refId: 'x', columns: ['a'], fields: [], rows: undefined } as unknown as Parameters<typeof getFormattedRowData>[0];
    expect(getFormattedRowData(bad, basePanelParams)).toEqual([]);
  });

  it('数值行生成带 stat 的 TextObject，键与列一致', () => {
    const table = createTableData([
      { cpu: 10, mem: 20 },
      { cpu: 30, mem: 40 },
    ]);
    const result = getFormattedRowData(table, basePanelParams);

    expect(result).toHaveLength(2);
    expect(result[0].cpu.stat).toBe(10);
    expect(result[0].cpu.text).toBeDefined();
    expect(result[0].mem.stat).toBe(20);
    expect(result[1].cpu.stat).toBe(30);
    expect(Object.keys(result[0]).sort()).toEqual(['cpu', 'mem']);
  });

  it('null 值字段保留在行对象中', () => {
    const table = createTableData([{ host: 'web-01', status: null }]);
    const result = getFormattedRowData(table, basePanelParams);

    expect(result[0].host.stat).toBeDefined();
    // null 值不参与数值解析，仍保留字段键
    expect(result[0].status).toBeDefined();
  });

  it('字符串字段不解析为数值，保留原值展示', () => {
    const table = createTableData([{ message: 'request completed' }]);
    const result = getFormattedRowData(table, basePanelParams);

    expect(result[0].message.stat).toBeDefined();
    expect(result[0].message.value).toBe('request completed');
  });
});
