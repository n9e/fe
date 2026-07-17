import React, { useMemo, useRef } from 'react';
import { Table } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';

import { injectColumnFilters } from './columns';
import { RowActionCell, splitRowActions } from './RowActionCell';
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
  const { rowActions, actionColumn, columns, className, dataSource, compactHeader, autoSortColumns, actionMaxIcons, pagination, ...rest } = props;

  // Every paginated table gets the quick jumper, regardless of whether the caller spreads
  // usePagination. `pagination={false}` stays off, and an explicit caller value still wins.
  const mergedPagination = useMemo(() => (pagination === false ? (false as const) : { showQuickJumper: true, ...pagination }), [pagination]);

  const rowActionsRef = useRef(rowActions);
  rowActionsRef.current = rowActions;
  const hasRowActions = !!rowActions;

  const enhancedColumns: ColumnsType<RecordType> = useMemo(() => {
    let finalColumns: ColumnsType<RecordType> | undefined = injectColumnFilters(columns, Array.isArray(dataSource) ? dataSource : undefined);

    const allColumns: ColumnType<RecordType>[] = ((finalColumns ?? []) as ColumnsType<RecordType>).filter(Boolean).map((col: ColumnType<RecordType>) => {
      const dataIndex = col.dataIndex;
      // Tag and left-align hand-written action columns. Detect via a locale-independent marker
      // (dataIndex or key === 'operate'), never the localized title (which breaks under i18n).
      // .fc-table-op-column (in style.less) strips the left padding of the first inline link/text button,
      // aligning the button text with the "operate" header (matching rowActions' .fc-table-action-cell).
      const isOpColumn = dataIndex === 'operate' || col.key === 'operate';
      let next: ColumnType<RecordType> = isOpColumn ? { ...col, align: col.align ?? 'left', className: classNames(col.className, 'fc-table-op-column') } : col;

      if (autoSortColumns) {
        // action column is not sortable
        const sorter = next.sorter !== undefined ? next.sorter : !isOpColumn && !!dataIndex ? defaultComparator(dataIndex as string) : false;
        next = { ...next, sorter };
      }
      return next;
    });

    if (hasRowActions) {
      // Scan the rows (cheap builder calls; capped to bound client-side-paginated
      // datasets) to keep the whole table on one layout and one width:
      // - kebabMode: if any row needs a kebab, every row renders in kebab layout,
      //   so icons align vertically and the kebab sits in a fixed position.
      // - contentWidth: auto-widen the action column so expanded icon rows never
      //   overflow legacy kebab-era widths; explicit `actionColumn.width` still
      //   wins when it is larger.
      let contentWidth = 0;
      let kebabMode = false;
      if (Array.isArray(dataSource)) {
        const rowCfgs = dataSource.slice(0, 200).map((record, index) => rowActionsRef.current?.(record, index));
        kebabMode = rowCfgs.some((cfg) => cfg && splitRowActions(cfg, actionMaxIcons).kebab.length > 0);
        rowCfgs.forEach((cfg) => {
          if (!cfg) return;
          const { icons, kebab } = splitRowActions(cfg, actionMaxIcons, kebabMode);
          const items = icons.length + (kebab.length ? 1 : 0);
          if (!items) return;
          // cell padding 16 + 24px per icon + 28px kebab trigger + 4px gaps
          contentWidth = Math.max(contentWidth, 16 + icons.length * 24 + (kebab.length ? 28 : 0) + (items - 1) * 4);
        });
      }

      const opColumn: ColumnType<RecordType> = {
        title: '操作',
        key: '__fc_action__',
        fixed: 'right',
        width: 100,
        ...actionColumn,
        render: (_value: unknown, record: RecordType, index: number) => {
          const cfg = rowActionsRef.current?.(record, index);
          return cfg ? <RowActionCell actions={cfg} maxIcons={actionMaxIcons} forceKebab={kebabMode} /> : null;
        },
      };
      if (typeof opColumn.width === 'number' && contentWidth > opColumn.width) {
        opColumn.width = contentWidth;
      }
      allColumns.push(opColumn);
    }

    return allColumns;
  }, [columns, actionColumn, hasRowActions, autoSortColumns, actionMaxIcons, dataSource]);

  return (
    <Table<RecordType>
      {...rest}
      pagination={mergedPagination}
      dataSource={dataSource}
      columns={enhancedColumns}
      className={classNames('fc-enhanced-table', { 'fc-enhanced-table--compact-header': compactHeader }, className)}
    />
  );
}
