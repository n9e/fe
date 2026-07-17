import React, { useState } from 'react';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { MoreVertical } from 'lucide-react';
import classNames from 'classnames';

import { resolveActionIcon } from './icons';
import type { RowAction, RowActions } from './types';

const visibleOnly = (list?: RowAction[]) => (list || []).filter((a) => a.visible !== false);

export const DEFAULT_ACTION_MAX_ICONS = 3;
// Once a kebab exists, cap surfaced icons at 2 so heavy rows stay compact.
const MAX_SURFACED_ICONS = 2;

/**
 * Split a row's actions into surfaced icon buttons and kebab leftovers.
 * A row with no `node`/`collapsed: true` items and at most `maxIcons` actions
 * expands entirely into icon buttons (danger items last), with no kebab.
 * Any other row gets a kebab: `inline` items stay surfaced, non-danger menu
 * items are promoted until 2 icons show, and everything else — including all
 * danger items — goes into the kebab (menu order preserved).
 * `forceKebab` puts a row in kebab layout even when it would fit expanded:
 * EnhancedTable sets it when any row of the table needs a kebab, so all rows
 * of one table share the same layout (light rows may then hold a single
 * kebab item — the accepted price of column-aligned consistency).
 */
export function splitRowActions(actions: RowActions, forceKebab = false, maxIcons = DEFAULT_ACTION_MAX_ICONS) {
  const inline = visibleOnly(actions.inline);
  const menu = visibleOnly(actions.menu);
  const pinned = menu.filter((a) => a.node || a.collapsed);
  const expandable = menu.filter((a) => !a.node && !a.collapsed);
  if (!forceKebab && !pinned.length && inline.length + expandable.length <= maxIcons) {
    return {
      icons: [...inline, ...expandable.filter((a) => !a.danger), ...expandable.filter((a) => a.danger)],
      kebab: [] as RowAction[],
    };
  }
  const promoted: RowAction[] = [];
  for (const action of expandable) {
    if (inline.length + promoted.length >= MAX_SURFACED_ICONS) break;
    if (action.danger) continue;
    promoted.push(action);
  }
  return {
    icons: [...inline, ...promoted],
    kebab: menu.filter((a) => !promoted.includes(a)),
  };
}

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

export function RowActionCell({ actions, forceKebab }: { actions: RowActions; forceKebab?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { icons, kebab } = splitRowActions(actions, forceKebab);
  if (!icons.length && !kebab.length) return null;

  const normal = kebab.filter((a) => !a.danger);
  const danger = kebab.filter((a) => a.danger);

  return (
    <div className='fc-table-action-cell'>
      {icons.map((a, i) => renderInlineAction(a, a.key ?? `inline-${i}`))}
      {kebab.length > 0 && (
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
