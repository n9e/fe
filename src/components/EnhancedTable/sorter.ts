import type { ColumnType } from 'antd/lib/table';

type DataIndex = ColumnType<any>['dataIndex'];

// 取值语义与 antd(rc-table) 的 getPathValue 对齐：数组按路径逐层取，字符串/数字按字面 key 取。
function getCellValue(record: unknown, dataIndex: DataIndex): unknown {
  if (dataIndex === undefined || dataIndex === null) return undefined;
  const pathList = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  let current: any = record;
  for (let i = 0; i < pathList.length; i += 1) {
    if (current == null) return undefined;
    current = current[pathList[i] as string | number];
  }
  return current;
}

const defaultCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

// 默认排序：数字按差值、字符串按自然序。
// 空值统一归到最前；其它类型(含 Date/moment 对象等)不处理，返回 0 保持稳定，需要时由调用方显式传 sorter。
export function defaultComparator(dataIndex: DataIndex) {
  return (a: unknown, b: unknown): number => {
    const av = getCellValue(a, dataIndex);
    const bv = getCellValue(b, dataIndex);
    if (av == null && bv == null) return 0;
    if (av == null) return -1;
    if (bv == null) return 1;
    if (typeof av === 'number' && typeof bv === 'number') {
      if (Number.isNaN(av) && Number.isNaN(bv)) return 0;
      if (Number.isNaN(av)) return -1;
      if (Number.isNaN(bv)) return 1;
      return av - bv;
    }
    if (typeof av === 'string' && typeof bv === 'string') {
      return defaultCollator.compare(av, bv);
    }

    return 0;
  };
}
