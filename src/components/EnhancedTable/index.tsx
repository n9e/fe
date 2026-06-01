import React from 'react';
import { Table, Dropdown, Menu, Button } from 'antd';
import type { TableProps, ColumnType, ColumnsType } from 'antd/lib/table';
import { MoreVertical } from 'lucide-react';
import classNames from 'classnames';
import './style.less';

/**
 * 单个行操作。
 * - inline 里的展示为文字链接（放出，置于三点左侧）
 * - menu 里的进三点菜单（收起）；danger 项自动带分割线 + 危险色
 */
export interface RowAction {
  key?: string;
  text: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  /** 显式为 false 时不渲染该项（用于权限/条件控制） */
  visible?: boolean;
}

export interface RowActions {
  /** 放出：文字链接，展示在三点左侧 */
  inline?: RowAction[];
  /** 收起：进三点菜单 */
  menu?: RowAction[];
}

export interface EnhancedTableProps<RecordType> extends TableProps<RecordType> {
  /** 声明式行操作 —— 传了就自动生成固定在右侧的「操作」列 */
  rowActions?: (record: RecordType, index: number) => RowActions | null | undefined;
  /** 覆盖自动生成的操作列（title / width / align 等） */
  actionColumn?: Partial<ColumnType<RecordType>>;
}

const visibleOnly = (list?: RowAction[]) => (list || []).filter((a) => a.visible !== false);

function ActionButton({ action, className }: { action: RowAction; className: string }) {
  return (
    <Button
      type='link'
      className={classNames(className, { 'is-danger': action.danger })}
      disabled={action.disabled}
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
                  <ActionButton action={a} className='fc-table-action-menu-btn' />
                </Menu.Item>
              ))}
              {normal.length > 0 && danger.length > 0 && <Menu.Divider />}
              {danger.map((a, i) => (
                <Menu.Item key={a.key ?? `d-${i}`} disabled={a.disabled}>
                  <ActionButton action={a} className='fc-table-action-menu-btn' />
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
 * EnhancedTable —— antd Table 的薄透传封装。
 * - 透传所有 antd TableProps（rowSelection / scroll / components / summary 等）
 * - 传 rowActions 即自动生成「操作」列（固定右侧，收/放统一）
 * - 视觉（排序/筛选图标、固定列底色、gold 排除等）走全局 theme/table.less，不在此封装
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
