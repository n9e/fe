import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import useSSE from './useSSE';
import MessageBubble from './MessageBubble';
import type { Message, ChatMessage, QueryGeneratorRequest, ToolCallInfo, DoneResponse } from './types';

const { TextArea } = Input;

interface Props {
  datasourceType: string;
  datasourceId: number;
  databaseName?: string;
  tableName?: string;
  onApplyQuery?: (query: string) => void;
}

export default function ChatPanel({ datasourceType, datasourceId, databaseName, tableName, onApplyQuery }: Props) {
  const { t } = useTranslation('AICopilot');
  const { sendMessage, cancel, isStreaming } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<Message | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (text?: string) => {
      const input = (text || inputValue).trim();
      if (!input || isStreaming) return;

      const userMsg: Message = {
        id: _.uniqueId('msg_'),
        role: 'user',
        content: input,
      };

      const assistantMsg: Message = {
        id: _.uniqueId('msg_'),
        role: 'assistant',
        content: '',
        thinking: '',
        toolCalls: [],
        isStreaming: true,
      };

      assistantRef.current = assistantMsg;
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInputValue('');

      // Build history from previous messages
      const history: ChatMessage[] = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          role: m.role,
          content: m.role === 'assistant' ? m.query || m.content : m.content,
        }));

      const params: QueryGeneratorRequest = {
        datasource_type: datasourceType,
        datasource_id: datasourceId,
        database_name: databaseName,
        table_name: tableName,
        user_input: input,
        history,
      };

      sendMessage(params, {
        onThinking: (delta) => {
          if (assistantRef.current) {
            assistantRef.current.thinking = (assistantRef.current.thinking || '') + delta;
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
        onToolCall: (name, input) => {
          if (assistantRef.current) {
            const tc: ToolCallInfo = { name, input };
            assistantRef.current.toolCalls = [...(assistantRef.current.toolCalls || []), tc];
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
        onToolResult: () => {
          // Tool results are shown via thinking/tool_call tags
        },
        onText: (delta) => {
          if (assistantRef.current) {
            assistantRef.current.content = (assistantRef.current.content || '') + delta;
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
        onDone: (response: DoneResponse) => {
          if (assistantRef.current) {
            assistantRef.current.isStreaming = false;
            // Try to parse final answer as JSON with query/explanation
            try {
              const content = response.content || assistantRef.current.content;
              // Look for JSON in the content
              const jsonMatch = content.match(/\{[\s\S]*"query"[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.query) {
                  assistantRef.current.query = parsed.query;
                  assistantRef.current.explanation = parsed.explanation || '';
                  // Remove JSON from display content
                  assistantRef.current.content = content.replace(jsonMatch[0], '').trim();
                }
              }
            } catch {
              // If JSON parsing fails, keep content as-is
            }
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
        onError: (error) => {
          if (assistantRef.current) {
            assistantRef.current.isStreaming = false;
            assistantRef.current.error = error;
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
      });
    },
    [inputValue, isStreaming, messages, datasourceType, datasourceId, databaseName, tableName, sendMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const presetPrompts = [t('prompts.generate_query'), t('prompts.cpu_usage'), t('prompts.memory_usage')];

  return (
    <div className='ai-copilot-chat-panel'>
      <div className='ai-copilot-messages'>
        {messages.length === 0 ? (
          <div className='ai-copilot-empty'>
            <div className='ai-copilot-empty-text'>{t('empty')}</div>
            <Space wrap className='ai-copilot-empty-prompts'>
              {presetPrompts.map((prompt) => (
                <Button key={prompt} size='small' onClick={() => handleSend(prompt)}>
                  {prompt}
                </Button>
              ))}
            </Space>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} datasourceType={datasourceType} onRunQuery={onApplyQuery} />)
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className='ai-copilot-input-area'>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('input_placeholder')}
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={isStreaming}
        />
        <div className='ai-copilot-input-actions'>
          {isStreaming ? (
            <Button size='small' danger icon={<StopOutlined />} onClick={cancel}>
              {t('stop')}
            </Button>
          ) : (
            <Button size='small' type='primary' icon={<SendOutlined />} onClick={() => handleSend()} disabled={!inputValue.trim()}>
              {t('send')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
