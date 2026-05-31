import React from 'react';
import { Button, Tooltip } from 'antd';
import type { ButtonProps } from 'antd/lib/button';
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
import { Link, LinkProps } from 'react-router-dom';

import './style.less';

const tableActionIconMap = {
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

export type TableActionIconName = keyof typeof tableActionIconMap;

export function TableActionIcon({ name }: { name: TableActionIconName }) {
  const Icon = tableActionIconMap[name];
  return <Icon className='fc-table-action-menu-icon' />;
}

interface TableActionButtonProps extends Omit<ButtonProps, 'icon'> {
  actionIcon?: TableActionIconName;
  icon?: React.ReactNode;
}

export function TableActionButton({ actionIcon, icon, className, type = 'link', ...rest }: TableActionButtonProps) {
  return (
    <Button
      type={type}
      className={classNames('fc-table-action-menu-button', className)}
      icon={icon || (actionIcon ? <TableActionIcon name={actionIcon} /> : undefined)}
      {...rest}
    />
  );
}

interface TableActionIconButtonProps extends Omit<ButtonProps, 'icon' | 'title'> {
  actionIcon: TableActionIconName;
  title: React.ReactNode;
}

export function TableActionIconButton({ actionIcon, title, className, type = 'text', ...rest }: TableActionIconButtonProps) {
  return (
    <Tooltip title={title}>
      <Button type={type} className={classNames('fc-table-action-icon-btn', className)} icon={<TableActionIcon name={actionIcon} />} {...rest} />
    </Tooltip>
  );
}

export function TableActionCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames('fc-table-action-cell', className)}>{children}</div>;
}

// 行内放出的「特色操作」文字按钮（置于三点菜单左侧）
export function TableActionInlineButton({ className, type = 'link', ...rest }: ButtonProps) {
  return <Button type={type} className={classNames('fc-table-action-inline-btn', className)} {...rest} />;
}

interface TableActionLinkProps extends LinkProps {
  actionIcon?: TableActionIconName;
}

export function TableActionLink({ actionIcon, className, children, ...rest }: TableActionLinkProps) {
  return (
    <Link className={classNames('fc-table-action-menu-link', className)} {...rest}>
      {actionIcon && <TableActionIcon name={actionIcon} />}
      <span>{children}</span>
    </Link>
  );
}

export const TableActionTrigger = React.forwardRef<HTMLElement, ButtonProps>(function TableActionTrigger({ type = 'text', icon, ...rest }, ref) {
  return <Button ref={ref as any} type={type} icon={icon || <MoreVertical size={16} />} {...rest} />;
});
