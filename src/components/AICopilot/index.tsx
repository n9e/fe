import React, { useState, useCallback } from 'react';
import ChatPanel from './ChatPanel';
import ConversationHeader from './ConversationHeader';
import type { AssistantChat } from './types';
import './style.less';

interface Props {
  visible: boolean;
  onClose: () => void;
  actionKey: string;
  actionContext?: Record<string, any>;
  onApplyQuery?: (query: string) => void;
}

export { default as CopilotButton } from './CopilotButton';
export { default as CopilotPlaceholderLink } from './CopilotPlaceholderLink';
export { default as CopilotEntry, CopilotEntryButton } from './CopilotEntry';
export { CopilotSidebarContext, useCopilotSidebar } from './CopilotSidebarContext';

export default function AICopilot({ visible, onClose, actionKey, actionContext, onApplyQuery }: Props) {
  const [chatId, setChatId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [chatKey, setChatKey] = useState(0);

  const handleSelectChat = useCallback((chat: AssistantChat) => {
    setChatId(chat.chat_id);
    setChatKey((k) => k + 1);
  }, []);

  const handleNewChat = useCallback(() => {
    setChatId(undefined);
    setChatKey((k) => k + 1);
  }, []);

  const handleChatChange = useCallback((chat: AssistantChat) => {
    setChatId(chat.chat_id);
    setRefreshKey((k) => k + 1);
  }, []);

  if (!visible) return null;

  return (
    <div className='ai-copilot-sidebar'>
      <ConversationHeader currentId={chatId} onSelect={handleSelectChat} onNew={handleNewChat} onClose={onClose} refreshKey={refreshKey} />
      <ChatPanel key={chatKey} actionKey={actionKey} actionContext={actionContext} chatId={chatId} onChatChange={handleChatChange} onApplyQuery={onApplyQuery} />
    </div>
  );
}
