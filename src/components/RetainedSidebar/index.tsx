import React, { createContext, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Tooltip } from 'antd';
import { Resizable } from 're-resizable';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useControlSummary } from './summary';
import './style.less';

const HeaderActionsContext = createContext<HTMLSpanElement | null>(null);

export function RetainedSidebarActions({ children }: { children: React.ReactNode }) {
  const target = useContext(HeaderActionsContext);
  return target ? createPortal(children, target) : null;
}

interface Props {
  children: React.ReactNode;
  title: string;
  summary?: string;
  autoSummary?: boolean;
  className?: string;
  collapseLocalStorageKey: string;
  widthLocalStorageKey: string;
  defaultWidth?: number;
  minWidth?: number;
}

export default function RetainedSidebar({
  children,
  title,
  summary,
  autoSummary = false,
  collapseLocalStorageKey,
  widthLocalStorageKey,
  defaultWidth = 200,
  minWidth = 200,
  className = '',
}: Props) {
  const { t } = useTranslation('retainedSidebar');
  const [actionsTarget, setActionsTarget] = useState<HTMLSpanElement | null>(null);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(`${collapseLocalStorageKey}-retained-v2`) === '1');
  const [width, setWidth] = useState(() => Math.min(480, Math.max(minWidth, Number(localStorage.getItem(widthLocalStorageKey)) || defaultWidth)));
  const bodyRef = useRef<HTMLDivElement>(null);
  const controlSummary = useControlSummary(bodyRef, autoSummary, t('view'));
  const selection = summary ?? controlSummary;
  const action = t(collapsed ? 'expand' : 'collapse', { title });
  return (
    <Resizable
      className={`fc-retained-sidebar${collapsed ? ' fc-retained-sidebar--collapsed' : ''} ${className}`}
      style={{ marginRight: collapsed ? 0 : 10 }}
      size={{ width: collapsed ? '100%' : width, height: collapsed ? 40 : '100%' }}
      minWidth={collapsed ? undefined : minWidth}
      maxWidth={collapsed ? undefined : 480}
      enable={{ right: !collapsed }}
      onResizeStop={(_event, _direction, _element, delta) => {
        const next = Math.min(480, Math.max(minWidth, width + delta.width));
        setWidth(next);
        localStorage.setItem(widthLocalStorageKey, String(next));
        window.dispatchEvent(new Event('resize'));
      }}
    >
      <HeaderActionsContext.Provider value={actionsTarget}>
        <header className='fc-retained-sidebar__header'>
          <strong>{title}</strong>
          {collapsed && (
            <Tooltip title={selection || t('empty')}>
              <span className='fc-retained-sidebar__selection'>{selection || t('empty')}</span>
            </Tooltip>
          )}
          <div className='fc-retained-sidebar__actions'>
            <span ref={setActionsTarget} hidden={collapsed} />
            <Tooltip title={action}>
              <Button
                type='text'
                size='small'
                aria-label={action}
                aria-expanded={!collapsed}
                onClick={() => {
                  setCollapsed(!collapsed);
                  localStorage.setItem(`${collapseLocalStorageKey}-retained-v2`, collapsed ? '0' : '1');
                  requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
                }}
                icon={collapsed ? <PanelLeftOpen size={16} strokeWidth={1.5} /> : <PanelLeftClose size={16} strokeWidth={1.5} />}
              />
            </Tooltip>
          </div>
        </header>
        <div ref={bodyRef} className='fc-retained-sidebar__body' hidden={collapsed}>
          {children}
        </div>
      </HeaderActionsContext.Provider>
    </Resizable>
  );
}
