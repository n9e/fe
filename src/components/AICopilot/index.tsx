import React, { useState, useCallback } from 'react';
import ChatPanel from './ChatPanel';
import ConversationHeader from './ConversationHeader';
import type { AIConversation } from './types';
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
  const [conversationId, setConversationId] = useState<number | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  // Use a key to force remount ChatPanel when switching conversations
  const [chatKey, setChatKey] = useState(0);

  const handleSelectConversation = useCallback((conv: AIConversation) => {
    setConversationId(conv.id);
    setChatKey((k) => k + 1);
  }, []);

  const handleNewConversation = useCallback(() => {
    setConversationId(undefined);
    setChatKey((k) => k + 1);
  }, []);

  const handleConversationChange = useCallback((id: number, _title: string) => {
    setConversationId(id);
    setRefreshKey((k) => k + 1);
  }, []);

  if (!visible) return null;

  return (
    <div className='ai-copilot-sidebar'>
      <ConversationHeader currentId={conversationId} onSelect={handleSelectConversation} onNew={handleNewConversation} onClose={onClose} refreshKey={refreshKey} />
      <ChatPanel
        key={chatKey}
        actionKey={actionKey}
        actionContext={actionContext}
        conversationId={conversationId}
        onConversationChange={handleConversationChange}
        onApplyQuery={onApplyQuery}
      />
    </div>
  );
}
