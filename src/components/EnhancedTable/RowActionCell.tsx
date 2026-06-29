import React, { useState } from 'react';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { MoreVertical } from 'lucide-react';
import classNames from 'classnames';

import { resolveActionIcon } from './icons';
import type { RowAction, RowActions } from './types';

const visibleOnly = (list?: RowAction[]) => (list || []).filter((a) => a.visible !== false);

function getInlineTooltipTitle(action: RowAction) {
  if (!action.tooltip) return action.text;
  if (!action.text) return action.tooltip;
  return (
    <>
      {action.text}
      <br />
      {action.tooltip}
    </>
  );
}

export function runRowAction(action: RowAction, event: React.MouseEvent, onAction?: () => void) {
  event.stopPropagation();
  onAction?.();
  action.onClick?.(event);
}

function ActionButton({
  action,
  className,
  withIcon,
  iconOnly,
  onAction,
}: {
  action: RowAction;
  className: string;
  withIcon?: boolean;
  iconOnly?: boolean;
  onAction?: () => void;
}) {
  const Icon = withIcon ? resolveActionIcon(action, iconOnly) : undefined;
  return (
    <Button
      type='link'
      className={classNames(className, { 'is-danger': action.danger, 'is-icon-only': iconOnly })}
      disabled={action.disabled}
      loading={action.loading}
      icon={Icon ? <Icon className='fc-table-action-menu-icon' /> : undefined}
      aria-label={typeof action.text === 'string' ? action.text : undefined}
      onClick={(e) => {
        runRowAction(action, e, onAction);
      }}
    >
      {iconOnly ? null : action.text}
    </Button>
  );
}

function renderInlineAction(action: RowAction, key: string) {
  if (action.node) {
    return <React.Fragment key={key}>{action.node}</React.Fragment>;
  }
  const btn = <ActionButton action={action} className='fc-table-action-inline-btn' withIcon iconOnly />;
  return (
    <Tooltip key={key} title={getInlineTooltipTitle(action)}>
      <span className='fc-table-action-inline-btn-wrap'>{btn}</span>
    </Tooltip>
  );
}

// One kebab menu item. When a tooltip is set we keep the Menu.Item itself enabled
// and wrap the (possibly disabled) button in a span, so the hint still shows on
// hover — a disabled button eats pointer events, and antd would also move the
// button's className onto a wrapper span, dropping our styling.
function renderMenuItem(action: RowAction, key: string, onAction: () => void) {
  if (action.node) {
    return (
      <Menu.Item key={key} disabled={action.disabled}>
        {action.node}
      </Menu.Item>
    );
  }
  const btn = <ActionButton action={action} className='fc-table-action-menu-btn' withIcon onAction={onAction} />;
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

export function RowActionCell({ actions }: { actions: RowActions }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const inline = visibleOnly(actions.inline);
  const menu = visibleOnly(actions.menu);
  if (!inline.length && !menu.length) return null;

  const normal = menu.filter((a) => !a.danger);
  const danger = menu.filter((a) => a.danger);

  return (
    <div className='fc-table-action-cell'>
      {inline.map((a, i) => renderInlineAction(a, a.key ?? `inline-${i}`))}
      {menu.length > 0 && (
        <Dropdown
          trigger={['click']}
          placement='bottomRight'
          visible={menuOpen}
          onVisibleChange={setMenuOpen}
          overlayClassName='fc-table-action-dropdown'
          overlay={
            <Menu>
              {normal.map((a, i) => renderMenuItem(a, a.key ?? `m-${i}`, () => setMenuOpen(false)))}
              {normal.length > 0 && danger.length > 0 && <Menu.Divider />}
              {danger.map((a, i) => renderMenuItem(a, a.key ?? `d-${i}`, () => setMenuOpen(false)))}
            </Menu>
          }
        >
          <Button type='text' className='fc-table-action-trigger' icon={<MoreVertical size={16} />} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      )}
    </div>
  );
}
