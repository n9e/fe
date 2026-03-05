import React from 'react';
import Markdown from '@/components/Markdown';
import ThinkingBlock from './ThinkingBlock';
import QueryResultBlock from './QueryResultBlock';
import type { Message } from './types';

interface Props {
  message: Message;
  datasourceType?: string;
  onRunQuery?: (query: string) => void;
}

export default function MessageBubble({ message, datasourceType, onRunQuery }: Props) {
  const isUser = message.role === 'user';
  const language = datasourceType === 'prometheus' ? 'promql' : 'sql';

  return (
    <div className={`ai-copilot-message ai-copilot-message-${message.role}`}>
      <div className='ai-copilot-message-content'>
        {isUser ? (
          <div className='ai-copilot-message-text'>{message.content}</div>
        ) : (
          <>
            {(message.thinking || (message.toolCalls && message.toolCalls.length > 0)) && (
              <ThinkingBlock thinking={message.thinking || ''} toolCalls={message.toolCalls} isStreaming={message.isStreaming} />
            )}
            {message.content && <Markdown content={message.content} />}
            {message.query && <QueryResultBlock query={message.query} explanation={message.explanation} language={language} onRunQuery={onRunQuery} />}
            {message.error && <div className='ai-copilot-message-error'>{message.error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
