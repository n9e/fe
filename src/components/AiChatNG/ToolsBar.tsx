import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { Plus, History, PictureInPicture2, PanelRight, X } from 'lucide-react';

import { AiChatMode } from './types';

export type AiChatView = 'chat' | 'history';

interface IToolsBarProps {
  selectedChatId?: string;
  activeView: AiChatView;
  mode: AiChatMode;
  showClose?: boolean;
  onCurrentChat: () => void;
  onNewChat: () => void;
  onViewHistory: () => void;
  onToggleMode: () => void;
  onClose?: () => void;
}

export default function ToolsBar(props: IToolsBarProps) {
  const { t } = useTranslation('AiChat');
  const { selectedChatId, activeView, mode, showClose, onCurrentChat, onNewChat, onViewHistory, onToggleMode, onClose } = props;
  const modeIcon = mode === 'drawer' ? <PictureInPicture2 size={16} /> : <PanelRight size={16} />;
  const modeTooltip = mode === 'drawer' ? t('toolbar.switch_to_floating') : t('toolbar.switch_to_drawer');

  return (
    <Space size={4}>
      {selectedChatId && activeView !== 'chat' && (
        <Button size='small' type='primary' onClick={onCurrentChat}>
          {t('toolbar.current_chat')}
        </Button>
      )}
      <Tooltip title={t('toolbar.new_chat')}>
        <Button size='small' type='text' icon={<Plus size={16} />} onClick={onNewChat} />
      </Tooltip>
      <Tooltip title={t('toolbar.history')}>
        <Button size='small' type='text' icon={<History size={16} />} onClick={onViewHistory} />
      </Tooltip>
      <Tooltip title={modeTooltip}>
        <Button size='small' type='text' icon={modeIcon} onClick={onToggleMode} />
      </Tooltip>
      {showClose && <Button size='small' type='text' icon={<X size={16} />} onClick={onClose} />}
    </Space>
  );
}
