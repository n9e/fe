import React, { useMemo, useRef } from 'react';
import { Table } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';

import { injectColumnFilters } from './columns';
import { RowActionCell } from './RowActionCell';
import type { EnhancedTableProps } from './types';
import './style.less';
import { defaultComparator } from './sorter';

/**
 * Thin pass-through wrapper over antd Table.
 * Forwards all TableProps; pass `rowActions` to auto-render the action column.
 * Visual baseline (sort/filter icons, fixed-column bg, …) lives in global theme/table.less.
 *
 * NOTE: keep this file exporting ONLY the component, otherwise React Fast Refresh
 * loses its boundary here and edits trigger a full page reload.
 */
export default function EnhancedTable<RecordType extends object = any>(props: EnhancedTableProps<RecordType>) {
  const { rowActions, actionColumn, columns, className, dataSource, compactHeader, autoSortColumns, ...rest } = props;

  const rowActionsRef = useRef(rowActions);
  rowActionsRef.current = rowActions;
  const hasRowActions = !!rowActions;

  const enhancedColumns: ColumnsType<RecordType> = useMemo(() => {
    let finalColumns: ColumnsType<RecordType> | undefined = injectColumnFilters(columns, Array.isArray(dataSource) ? dataSource : undefined);

    const allColumns: ColumnType<RecordType>[] = ((finalColumns ?? []) as ColumnsType<RecordType>).filter(Boolean).map((col: ColumnType<RecordType>) => {
      const dataIndex = col.dataIndex;
      // Tag and left-align hand-written action columns (dataIndex='operate' or title === '操作').
      // .fc-table-op-column (in style.less) strips the left padding of the first inline link/text button,
      // aligning the button text with the "operate" header (matching rowActions' .fc-table-action-cell).
      const isOpColumn = dataIndex === 'operate' || col.title === '操作';
      let next: ColumnType<RecordType> = isOpColumn ? { ...col, align: col.align ?? 'left', className: classNames(col.className, 'fc-table-op-column') } : col;

      if (autoSortColumns) {
        // action column is not sortable
        const sorter = next.sorter !== undefined ? next.sorter : !isOpColumn && !!dataIndex ? defaultComparator(dataIndex as string) : false;
        next = { ...next, sorter };
      }
      return next;
    });

    if (hasRowActions) {
      const opColumn: ColumnType<RecordType> = {
        title: '操作',
        key: '__fc_action__',
        fixed: 'right',
        width: 100,
        ...actionColumn,
        render: (_value: unknown, record: RecordType, index: number) => {
          const cfg = rowActionsRef.current?.(record, index);
          return cfg ? <RowActionCell actions={cfg} /> : null;
        },
      };
      allColumns.push(opColumn);
    }

    return allColumns;
  }, [columns, actionColumn, hasRowActions, autoSortColumns, dataSource]);

  return (
    <Table<RecordType>
      {...rest}
      dataSource={dataSource}
      columns={enhancedColumns}
      className={classNames('fc-enhanced-table', { 'fc-enhanced-table--compact-header': compactHeader }, className)}
    />
  );
}
