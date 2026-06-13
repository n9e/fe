import React from 'react';
import { Table, Dropdown, Menu, Button, Tooltip } from 'antd';
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
import { getUpdateByColumnFilterProps } from './columns';
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
  text?: React.ReactNode;
  /** lucide icon shown before the text in the kebab menu */
  icon?: ActionIconName;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  danger?: boolean;
  /** false to hide this action (e.g. by permission) */
  visible?: boolean;
  /** hover hint; shown even when the item is disabled (e.g. why delete is blocked) */
  tooltip?: React.ReactNode;
  /** render a custom node instead of the default button (for bespoke menu items) */
  node?: React.ReactNode;
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

type EnabledStatusFilterValue = boolean | number | string;
type EnabledStatusValue = EnabledStatusFilterValue | null | undefined;

export interface EnabledStatusColumnOptions<ValueType extends EnabledStatusValue = EnabledStatusValue> {
  title: React.ReactNode;
  dataIndex: ColumnType<any>['dataIndex'];
  enabledText: React.ReactNode;
  disabledText: React.ReactNode;
  enabledValue: EnabledStatusFilterValue;
  disabledValue: EnabledStatusFilterValue;
  getValue?: (record: any) => ValueType;
  sorter?: ColumnType<any>['sorter'];
  onFilter?: ColumnType<any>['onFilter'] | false;
}

function getColumnValue<ValueType extends EnabledStatusValue>(record: any, dataIndex: ColumnType<any>['dataIndex']): ValueType {
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce((current, key) => current?.[key], record) as ValueType;
  }
  return record[dataIndex as keyof typeof record] as ValueType;
}

export function getEnabledStatusColumn<ValueType extends EnabledStatusValue = EnabledStatusValue>(
  options: EnabledStatusColumnOptions<ValueType>,
): Pick<ColumnType<any>, 'title' | 'dataIndex' | 'sorter' | 'filters' | 'onFilter'> {
  const { title, dataIndex, enabledText, disabledText, enabledValue, disabledValue, getValue, sorter, onFilter } = options;
  const readValue = (record: any) => (getValue ? getValue(record) : getColumnValue<ValueType>(record, dataIndex));
  const rank = (value: ValueType) => (value === enabledValue ? 0 : value === disabledValue ? 1 : 2);

  return {
    title,
    dataIndex,
    sorter: sorter ?? ((a, b) => rank(readValue(a)) - rank(readValue(b))),
    filters: [
      { text: enabledText, value: enabledValue },
      { text: disabledText, value: disabledValue },
    ],
    ...(onFilter === false ? {} : { onFilter: onFilter ?? ((value, record) => readValue(record) === value) }),
  };
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

// One kebab menu item. When a tooltip is set we keep the Menu.Item itself enabled
// and wrap the (possibly disabled) button in a span, so the hint still shows on
// hover — a disabled button eats pointer events, and antd would also move the
// button's className onto a wrapper span, dropping our styling.
function renderMenuItem(action: RowAction, key: string) {
  if (action.node) {
    return (
      <Menu.Item key={key} disabled={action.disabled}>
        {action.node}
      </Menu.Item>
    );
  }
  const btn = <ActionButton action={action} className='fc-table-action-menu-btn' withIcon />;
  if (action.tooltip) {
    return (
      <Menu.Item key={key}>
        <Tooltip title={action.tooltip}>
          <span className='fc-table-action-menu-btn-wrap'>{btn}</span>
        </Tooltip>
      </Menu.Item>
    );
  }
  return (
    <Menu.Item key={key} disabled={action.disabled}>
      {btn}
    </Menu.Item>
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
      {inline.map((a, i) =>
        a.node ? (
          <React.Fragment key={a.key ?? `inline-${i}`}>{a.node}</React.Fragment>
        ) : (
          <ActionButton key={a.key ?? `inline-${i}`} action={a} className='fc-table-action-inline-btn' />
        ),
      )}
      {menu.length > 0 && (
        <Dropdown
          trigger={['click']}
          placement='bottomRight'
          overlayClassName='fc-table-action-dropdown'
          overlay={
            <Menu>
              {normal.map((a, i) => renderMenuItem(a, a.key ?? `m-${i}`))}
              {normal.length > 0 && danger.length > 0 && <Menu.Divider />}
              {danger.map((a, i) => renderMenuItem(a, a.key ?? `d-${i}`))}
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

function injectColumnFilters<RecordType extends object>(
  columns: ColumnsType<RecordType> | undefined,
  dataSource: readonly RecordType[] | undefined,
): ColumnsType<RecordType> | undefined {
  if (!columns) return columns;

  return columns.map((column) => {
    if ('children' in column && column.children) {
      return {
        ...column,
        children: injectColumnFilters(column.children as ColumnsType<RecordType>, dataSource),
      };
    }

    return {
      ...column,
      ...getUpdateByColumnFilterProps(column as ColumnType<RecordType>, dataSource),
    };
  }) as ColumnsType<RecordType>;
}

/**
 * Thin pass-through wrapper over antd Table.
 * Forwards all TableProps; pass `rowActions` to auto-render the action column.
 * Visual baseline (sort/filter icons, fixed-column bg, …) lives in global theme/table.less.
 */
export default function EnhancedTable<RecordType extends object = any>(props: EnhancedTableProps<RecordType>) {
  const { rowActions, actionColumn, columns, className, dataSource, ...rest } = props;

  let finalColumns: ColumnsType<RecordType> | undefined = injectColumnFilters(columns, Array.isArray(dataSource) ? dataSource : undefined);
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
    finalColumns = [...(finalColumns || []), opColumn];
  }

  return <Table<RecordType> {...rest} dataSource={dataSource} columns={finalColumns} className={classNames('fc-enhanced-table', className)} />;
}
