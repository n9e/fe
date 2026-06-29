import type { MouseEvent, ReactNode } from 'react';
import type { ColumnType, TableProps } from 'antd/lib/table';

import type { ActionIconName } from './icons';

export interface RowAction {
  key?: string;
  text?: ReactNode;
  /** lucide icon shown before the text in the kebab menu */
  icon?: ActionIconName;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  /** false to hide this action (e.g. by permission) */
  visible?: boolean;
  /** hover hint; shown even when the item is disabled (e.g. why delete is blocked) */
  tooltip?: ReactNode;
  /** render a custom node instead of the default button (for bespoke menu items) */
  node?: ReactNode;
}

export interface RowActions {
  /** surfaced as text links, left of the kebab */
  inline?: RowAction[];
  /** collapsed into the kebab menu */
  menu?: RowAction[];
}

export interface EnhancedTableProps<RecordType> extends TableProps<RecordType> {
  /** declarative row actions; auto-renders a fixed-right action column */
  rowActions?: (record: RecordType, index: number) => RowActions | null | undefined;
  /** overrides for the generated action column (title / width / …) */
  actionColumn?: Partial<ColumnType<RecordType>>;
  /** compact header: tighter thead padding + smaller sort hit-area, for tables embedded inside tabs/cards */
  compactHeader?: boolean;
  /** auto-inject default sorter for columns without `sorter` (default false); column `sorter` always wins */
  autoSortColumns?: boolean;
}
