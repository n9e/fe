import React from 'react';
import { Table, Dropdown, Menu, Button } from 'antd';
import type { TableProps, ColumnType, ColumnsType } from 'antd/lib/table';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  MoreVertical,
  Network,
  Pencil,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import classNames from 'classnames';
import './style.less';

const actionIconMap = {
  default: CheckCircle,
  edit: Pencil,
  view: Eye,
  settings: Settings,
  access: Network,
  permission: ShieldCheck,
  copy: Copy,
  delete: Trash2,
  run: Play,
  search: Search,
  open: ExternalLink,
  link: LinkIcon,
  ai: Sparkles,
};
export type ActionIconName = keyof typeof actionIconMap;

export interface RowAction {
  key?: string;
  text: React.ReactNode;
  /** lucide icon shown before the text in the kebab menu */
  icon?: ActionIconName;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  /** false to hide this action (e.g. by permission) */
  visible?: boolean;
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
}

const visibleOnly = (list?: RowAction[]) => (list || []).filter((a) => a.visible !== false);

function ActionButton({ action, className, withIcon }: { action: RowAction; className: string; withIcon?: boolean }) {
  const Icon = withIcon && action.icon ? actionIconMap[action.icon] : undefined;
  return (
    <Button
      type='link'
      className={classNames(className, { 'is-danger': action.danger })}
      disabled={action.disabled}
      icon={Icon ? <Icon className='fc-table-action-menu-icon' /> : undefined}
      onClick={(e) => {
        e.stopPropagation();
        action.onClick?.(e);
      }}
    >
      {action.text}
    </Button>
  );
}

function RowActionCell({ actions }: { actions: RowActions }) {
  const inline = visibleOnly(actions.inline);
  const menu = visibleOnly(actions.menu);
  if (!inline.length && !menu.length) return null;

  const normal = menu.filter((a) => !a.danger);
  const danger = menu.filter((a) => a.danger);

  return (
    <div className='fc-table-action-cell'>
      {inline.map((a, i) => (
        <ActionButton key={a.key ?? `inline-${i}`} action={a} className='fc-table-action-inline-btn' />
      ))}
      {menu.length > 0 && (
        <Dropdown
          trigger={['click']}
          placement='bottomRight'
          overlayClassName='fc-table-action-dropdown'
          overlay={
            <Menu>
              {normal.map((a, i) => (
                <Menu.Item key={a.key ?? `m-${i}`} disabled={a.disabled}>
                  <ActionButton action={a} className='fc-table-action-menu-btn' withIcon />
                </Menu.Item>
              ))}
              {normal.length > 0 && danger.length > 0 && <Menu.Divider />}
              {danger.map((a, i) => (
                <Menu.Item key={a.key ?? `d-${i}`} disabled={a.disabled}>
                  <ActionButton action={a} className='fc-table-action-menu-btn' withIcon />
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button
            type='text'
            className='fc-table-action-trigger'
            icon={<MoreVertical size={16} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      )}
    </div>
  );
}

/**
 * Thin pass-through wrapper over antd Table.
 * Forwards all TableProps; pass `rowActions` to auto-render the action column.
 * Visual baseline (sort/filter icons, fixed-column bg, …) lives in global theme/table.less.
 */
export default function EnhancedTable<RecordType extends object = any>(props: EnhancedTableProps<RecordType>) {
  const { rowActions, actionColumn, columns, className, ...rest } = props;

  let finalColumns: ColumnsType<RecordType> | undefined = columns;
  if (rowActions) {
    const opColumn: ColumnType<RecordType> = {
      title: '操作',
      key: '__fc_action__',
      fixed: 'right',
      width: 100,
      ...actionColumn,
      render: (_value: unknown, record: RecordType, index: number) => {
        const cfg = rowActions(record, index);
        return cfg ? <RowActionCell actions={cfg} /> : null;
      },
    };
    finalColumns = [...(columns || []), opColumn];
  }

  return <Table<RecordType> {...rest} columns={finalColumns} className={classNames('fc-enhanced-table', className)} />;
}
