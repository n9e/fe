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
  const { rowActions, actionColumn, columns, className, dataSource, compactHeader, ...rest } = props;

  const rowActionsRef = useRef(rowActions);
  rowActionsRef.current = rowActions;
  const hasRowActions = !!rowActions;

  const enhancedColumns: ColumnsType<RecordType> = useMemo(() => {
    let finalColumns: ColumnsType<RecordType> | undefined = injectColumnFilters(columns, Array.isArray(dataSource) ? dataSource : undefined);
    const allColumns: ColumnType<RecordType>[] = ((finalColumns ?? []) as ColumnsType<RecordType>).filter(Boolean).map((col: ColumnType<RecordType>) => {
      const dataIndex = col.dataIndex;
      // 操作列不排序
      const sorter = col.sorter !== undefined ? col.sorter : !!dataIndex && !['operate'].includes(dataIndex as string) ? defaultComparator(dataIndex as string) : false;
      return {
        ...col,
        // ellipsis: col.ellipsis !== undefined ? col.ellipsis : true,
        sorter,
      };
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
  }, [columns, actionColumn, hasRowActions]);

  return (
    <Table<RecordType>
      {...rest}
      dataSource={dataSource}
      columns={enhancedColumns}
      className={classNames('fc-enhanced-table', { 'fc-enhanced-table--compact-header': compactHeader }, className)}
    />
  );
}
