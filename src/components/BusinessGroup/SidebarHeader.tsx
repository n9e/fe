import React from 'react';
import { Button, Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: React.ReactNode;
  collapsed: boolean;
  selection: string;
  onToggle: () => void;
  actions?: React.ReactNode;
}

export default function BusinessGroupSidebarHeader({ title, collapsed, selection, onToggle, actions }: Props) {
  const { t } = useTranslation('BusinessGroup');
  const action = t(collapsed ? 'sidebar.expand' : 'sidebar.collapse');
  return (
    <header className='n9e-business-group-header'>
      <strong>{title}</strong>
      {collapsed && (
        <Tooltip title={t('sidebar.selected', { selection })}>
          <span className='n9e-business-group-header__selection'>{selection}</span>
        </Tooltip>
      )}
      <div className='n9e-business-group-header__actions'>
        {!collapsed && actions}
        <Tooltip title={action}>
          <Button
            type='text'
            size='small'
            aria-label={action}
            aria-expanded={!collapsed}
            onClick={onToggle}
            icon={collapsed ? <PanelLeftOpen size={16} strokeWidth={1.5} /> : <PanelLeftClose size={16} strokeWidth={1.5} />}
          />
        </Tooltip>
      </div>
    </header>
  );
}
