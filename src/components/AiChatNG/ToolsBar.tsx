import React from 'react';
import { Button, Space, Tooltip } from 'antd';
import { PlusOutlined, HistoryOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export type AiChatView = 'chat' | 'history';

interface IToolsBarProps {
  selectedChatId?: string;
  activeView: AiChatView;
  showClose?: boolean;
  onCurrentChat: () => void;
  onNewChat: () => void;
  onViewHistory: () => void;
  onClose?: () => void;
}

export default function ToolsBar(props: IToolsBarProps) {
  const { t } = useTranslation('AiChat');
  const { selectedChatId, activeView, showClose, onCurrentChat, onNewChat, onViewHistory, onClose } = props;

  return (
    <Space size={4}>
      {selectedChatId && activeView !== 'chat' && (
        <Button size='small' type='primary' onClick={onCurrentChat}>
          {t('toolbar.current_chat')}
        </Button>
      )}
      <Tooltip title={t('toolbar.new_chat')}>
        <Button size='small' type='text' icon={<PlusOutlined />} onClick={onNewChat} />
      </Tooltip>
      <Tooltip title={t('toolbar.history')}>
        <Button size='small' type='text' icon={<HistoryOutlined />} onClick={onViewHistory} />
      </Tooltip>
      {showClose && <Button size='small' type='text' icon={<CloseCircleOutlined />} onClick={onClose} />}
    </Space>
  );
}
