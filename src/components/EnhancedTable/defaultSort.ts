import type { ColumnType, ColumnsType } from 'antd/lib/table';

import { UPDATE_AT_COLUMN_META } from './columns';
import type { UpdateAtColumnType } from './columns';

/**
 * List tables built with `updateAtColumn` open sorted by update time, newest first.
 * The order comes from the marker that factory attaches, never from the field name, so this
 * stays a generic table concern. Callers opt out by declaring `defaultSortOrder` / `sortOrder`
 * on any column, or by building the column with plain `dateColumn`.
 */

// Only a local comparator can honour `defaultSortOrder` on mount. `sorter: true` defers sorting to
// the server, which never learns about the injected order (antd fires onChange on user clicks only),
// so the header would claim an order the rows do not have.
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
 * Returns `columns` with the default sort order applied to the marked update-time column, or the
 * original array when no column qualifies. Only top-level columns are considered; grouped headers
 * keep whatever their children declare.
 */
export function withUpdateTimeDefaultSort<RecordType>(columns: ColumnType<RecordType>[]): ColumnType<RecordType>[] {
  if (hasExplicitSortOrder(columns)) return columns;

  const index = columns.findIndex((column) => {
    const order = (column as UpdateAtColumnType<RecordType>)[UPDATE_AT_COLUMN_META]?.defaultOrder;
    return !!order && hasLocalComparator(column);
  });
  if (index === -1) return columns;

  const order = (columns[index] as UpdateAtColumnType<RecordType>)[UPDATE_AT_COLUMN_META]?.defaultOrder;
  const next = columns.slice();
  next[index] = { ...next[index], defaultSortOrder: order };
  return next;
}
