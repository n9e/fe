import type { ColumnType, ColumnsType, TableProps } from 'antd/lib/table';

/**
 * List tables that carry an "update time" column should open sorted by it, newest first.
 * Callers opt out by declaring `defaultSortOrder` / `sortOrder` on any column: an explicit
 * order always wins and suppresses the injected one.
 */

// dataIndex values recognised as the update-time column, in preference order.
const UPDATE_TIME_KEYS = ['update_at', 'updated_at', 'update_time', 'updated_time'];

function getDataIndexKey(dataIndex: ColumnType<any>['dataIndex']): string | undefined {
  if (typeof dataIndex === 'string') return dataIndex;
  // path arrays are matched on their leaf key, the same segment the cell value is read from
  if (Array.isArray(dataIndex) && dataIndex.length) return String(dataIndex[dataIndex.length - 1]);
  return undefined;
}

// Only a local comparator can honour `defaultSortOrder` on mount. `sorter: true` defers sorting to
// the server, which never learns about the injected order (antd fires onChange on user clicks only),
// so the header would claim an order the rows don't have.
function hasLocalComparator(column: ColumnType<any>): boolean {
  const { sorter } = column;
  if (typeof sorter === 'function') return true;
  return typeof (sorter as { compare?: unknown } | undefined)?.compare === 'function';
}

function someColumn(columns: ColumnsType<any> | undefined, predicate: (column: ColumnType<any>) => boolean): boolean {
  return !!columns?.some((column) => {
    if (predicate(column as ColumnType<any>)) return true;
    const { children } = column as { children?: ColumnsType<any> };
    return someColumn(children, predicate);
  });
}

/** true when any column (at any depth) already declares a sort order */
export function hasExplicitSortOrder(columns: ColumnsType<any> | undefined): boolean {
  return someColumn(columns, (column) => column.defaultSortOrder != null || column.sortOrder != null);
}

/**
 * true when the rows are one server-fetched page. Such tables leave sorting to the backend, so a
 * local default sort would only reorder the current page while the header claims the whole table is
 * sorted. Client-side tables leave `total` unset and let antd derive it from dataSource.
 */
export function isServerPaginated(pagination: TableProps<any>['pagination']): boolean {
  return !!pagination && pagination.total != null;
}

/**
 * Returns `columns` with `defaultSortOrder: 'descend'` on the update-time column, or the original
 * array when no column qualifies. Only top-level columns are considered; grouped headers keep
 * whatever their children declare.
 */
export function withUpdateTimeDefaultSort<RecordType>(columns: ColumnType<RecordType>[], serverPaginated: boolean): ColumnType<RecordType>[] {
  if (serverPaginated || hasExplicitSortOrder(columns)) return columns;

  let targetIndex = -1;
  let targetRank = UPDATE_TIME_KEYS.length;

  columns.forEach((column, index) => {
    const key = getDataIndexKey(column.dataIndex);
    const rank = key ? UPDATE_TIME_KEYS.indexOf(key) : -1;
    // earlier keys win; among equally ranked columns the leftmost one wins
    if (rank === -1 || rank >= targetRank) return;
    if (!hasLocalComparator(column)) return;
    targetIndex = index;
    targetRank = rank;
  });

  if (targetIndex === -1) return columns;

  const next = columns.slice();
  next[targetIndex] = { ...next[targetIndex], defaultSortOrder: 'descend' };
  return next;
}
