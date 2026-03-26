import React, { useState, useEffect, useCallback } from 'react';

import ChatPanel from './ChatPanel';
import ChatHistory from './ChatHistory';
import { IAiChatHistoryItem, IAiChatProps } from './types';
import ToolsBar, { AiChatView } from './ToolsBar';
import { cn } from './utils';

export * from './types';
export { default as ChatPanel } from './ChatPanel';
export { default as ToolsBar } from './ToolsBar';
export { default as ChatHistoryPage } from './ChatHistory';

import './locale';

export default function AiChat(props: IAiChatProps) {
  const { className, onChatChange, onError } = props;
  const [activeView, setActiveView] = useState<AiChatView>('chat');
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(props.chatId);

  useEffect(() => {
    setSelectedChatId(props.chatId);
  }, [props.chatId]);

  const handleChatChange = useCallback(
    (chat?: IAiChatHistoryItem) => {
      setSelectedChatId(chat?.chat_id);
      onChatChange?.(chat);
    },
    [onChatChange],
  );

  const showHistory = activeView === 'history';

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className ? className : '')}>
      <div className='mb-4 flex justify-end'>
        <ToolsBar
          selectedChatId={selectedChatId}
          activeView={activeView}
          onCurrentChat={() => {
            setActiveView('chat');
          }}
          onNewChat={() => {
            setSelectedChatId(undefined);
            setActiveView('chat');
          }}
          onViewHistory={() => {
            setActiveView('history');
          }}
        />
      </div>

      <div className='h-full min-h-0'>
        <div className={showHistory ? 'hidden h-full min-h-0' : 'flex w-full h-full min-h-0'}>
          <ChatPanel {...props} chatId={selectedChatId} onChatChange={handleChatChange} />
        </div>

        {showHistory ? (
          <ChatHistory
            onSelect={(chat) => {
              setSelectedChatId(chat.chat_id);
              setActiveView('chat');
            }}
            onError={onError}
            onDelete={(chat) => {
              if (selectedChatId === chat.chat_id) {
                setSelectedChatId(undefined);
                onChatChange?.(undefined);
              }
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
