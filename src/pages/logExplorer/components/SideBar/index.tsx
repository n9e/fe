import React, { useState, useRef, useLayoutEffect } from 'react';
import { Resizable } from 're-resizable';
import { Button, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAME_SPACE } from '../../constants';
import { getScrollParent, getScrollViewport } from '../LogsViewer/utils/scrollParent';
import './style.less';

interface Props {
  ns: string;
  children: React.ReactNode;
}

export default function SideBar({ ns, children }: Props) {
  const { t } = useTranslation(NAME_SPACE);
  // Share the retained sidebar's state when switching between main and pre builds.
  const collapseKey = `ng-${ns}-explorer-sidebar-collapse-retained-v2`;
  const widthKey = `ng-${ns}-explorer-sidebar-width`;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(collapseKey) === '1');
  const [width, setWidth] = useState(() => Math.min(480, Math.max(200, Number(localStorage.getItem(widthKey)) || 200)));
  const action = t(collapsed ? 'sidebar.expand' : 'sidebar.collapse');
  const sidebarRef = useRef<Resizable>(null);
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current?.resizable;
    const row = sidebar?.parentElement;
    if (collapsed || !sidebar || !row) return;
    const parent = getScrollParent(sidebar);
    const measure = () => {
      if (!row.getClientRects().length) return;
      const viewport = getScrollViewport(parent);
      // The row scrolls normally, so its content position stays stable even
      // while the sidebar itself is sticky.
      const top = row.getBoundingClientRect().top + parent.scrollTop;
      let bottomInset = 0;
      let ancestor: HTMLElement | null = row;
      while (ancestor && ancestor !== parent) {
        const style = getComputedStyle(ancestor);
        bottomInset += (parseFloat(style.paddingBottom) || 0) + (parseFloat(style.borderBottomWidth) || 0);
        ancestor = ancestor.parentElement;
      }
      const height = Math.max(320, viewport.top + viewport.height - top - bottomInset);
      sidebar.style.setProperty('--log-sidebar-height', `${height}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(row);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [collapsed]);
  return (
    <Resizable
      ref={sidebarRef}
      className={`n9e-log-sidebar${collapsed ? ' n9e-log-sidebar-collapsed' : ''}`}
      size={{ width: collapsed ? 0 : width, height: 'auto' }}
      minWidth={collapsed ? 0 : 200}
      maxWidth={collapsed ? 0 : 480}
      style={{ marginRight: collapsed ? 0 : 10 }}
      enable={{ right: !collapsed }}
      onResizeStop={(_event, _direction, _element, delta) => {
        const next = Math.min(480, Math.max(200, width + delta.width));
        setWidth(next);
        localStorage.setItem(widthKey, String(next));
        window.dispatchEvent(new Event('resize'));
      }}
    >
      <header className='n9e-log-sidebar-header'>
        {!collapsed && <strong>{t('sidebar.title')}</strong>}
        <Tooltip title={action}>
          <Button
            type='text'
            size='small'
            aria-label={action}
            aria-expanded={!collapsed}
            icon={collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            onClick={() => {
              setCollapsed(!collapsed);
              localStorage.setItem(collapseKey, collapsed ? '0' : '1');
              requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
            }}
          />
        </Tooltip>
      </header>
      <div className='n9e-log-sidebar-body' hidden={collapsed}>
        {children}
      </div>
    </Resizable>
  );
}
