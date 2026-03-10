import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import useSSE from './useSSE';
import MessageBubble from './MessageBubble';
import { createConversation, getConversation, addConversationMessages } from './services';
import type { Message, ChatMessage, AIChatRequest, ToolCallInfo, DoneResponse } from './types';

const { TextArea } = Input;

// Try to extract query/explanation from various LLM response formats
function tryParseQueryResponse(text: string): { query: string; explanation: string; remaining: string } | null {
  try {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Format 1: {"query": "...", "explanation": "..."}
    if (parsed.query && typeof parsed.query === 'string') {
      const remaining = text.replace(jsonMatch[0], '').trim();
      return { query: parsed.query, explanation: parsed.explanation || '', remaining };
    }

    // Format 2: {"summary": "...", "metrics": [{"promql_examples": [...]}]}
    if (parsed.metrics && Array.isArray(parsed.metrics)) {
      const firstMetric = parsed.metrics[0];
      const examples = firstMetric?.promql_examples;
      if (examples && examples.length > 0) {
        // Use the first non-comment example as query
        const query = examples.find((e: string) => e && !e.startsWith('#')) || examples[0];
        return {
          query: query.replace(/^#.*\n/gm, '').trim(),
          explanation: parsed.summary || firstMetric?.description || '',
          remaining: '',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

interface Props {
  actionKey: string;
  actionContext?: Record<string, any>;
  conversationId?: number;
  onConversationChange?: (id: number, title: string) => void;
  onApplyQuery?: (query: string) => void;
}

export default function ChatPanel({ actionKey, actionContext, conversationId, onConversationChange, onApplyQuery }: Props) {
  const { t } = useTranslation('AICopilot');
  const { sendMessage, cancel, isStreaming } = useSSE();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<Message | null>(null);
  const convIdRef = useRef<number | undefined>(conversationId);
  // Skip next load when conversation was just created internally
  const skipNextLoadRef = useRef(false);

  // Track conversationId changes
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // Load messages when conversationId changes (only for switching to existing conversations)
  useEffect(() => {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    if (conversationId) {
      getConversation(conversationId)
        .then((res) => {
          const data = res?.dat;
          if (data?.messages) {
            const loaded: Message[] = data.messages.map((m: any) => ({
              id: `loaded_${m.id}`,
              role: m.role,
              content: m.content || '',
              thinking: m.thinking || '',
              toolCalls: m.tool_calls ? JSON.parse(m.tool_calls) : undefined,
              query: m.query || '',
              explanation: m.explanation || '',
              error: m.error || '',
            }));
            setMessages(loaded);
          }
        })
        .catch(() => {});
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Save messages to backend
  const saveMessages = useCallback(
    (userMsg: Message, assistantMsg: Message, currentConvId?: number) => {
      const msgsToSave = [
        {
          role: userMsg.role,
          content: userMsg.content,
        },
        {
          role: assistantMsg.role,
          content: assistantMsg.content || '',
          thinking: assistantMsg.thinking || '',
          tool_calls: assistantMsg.toolCalls ? JSON.stringify(assistantMsg.toolCalls) : '',
          query: assistantMsg.query || '',
          explanation: assistantMsg.explanation || '',
          error: assistantMsg.error || '',
        },
      ];

      if (currentConvId) {
        addConversationMessages(currentConvId, msgsToSave).catch(() => {});
      } else {
        // Create a new conversation with the first user message as title
        const title = userMsg.content.slice(0, 50) + (userMsg.content.length > 50 ? '...' : '');
        createConversation({
          title,
          context: JSON.stringify({ action_key: actionKey, ...actionContext }),
        })
          .then((res) => {
            const newConv = res?.dat;
            if (newConv?.id) {
              convIdRef.current = newConv.id;
              skipNextLoadRef.current = true;
              onConversationChange?.(newConv.id, title);
              addConversationMessages(newConv.id, msgsToSave).catch(() => {});
            }
          })
          .catch(() => {});
      }
    },
    [actionKey, actionContext, onConversationChange],
  );

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

      const params: AIChatRequest = {
        action_key: actionKey,
        user_input: input,
        history,
        context: actionContext,
      };

      sendMessage(params, {
        onThinking: () => {
          // No-op: text chunks already contain the full reasoning (including thoughts).
          // Separate thinking chunks are parsed subsets and would cause duplication.
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
            // Text from ReAct agent is reasoning process, accumulate into thinking
            assistantRef.current.thinking = (assistantRef.current.thinking || '') + delta;
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
          }
        },
        onDone: (response: DoneResponse) => {
          if (assistantRef.current) {
            assistantRef.current.isStreaming = false;
            // Use message as thinking (fallback if not already accumulated via streaming)
            if (response.message && !assistantRef.current.thinking) {
              assistantRef.current.thinking = response.message;
            }
            // Parse response for query/explanation
            const finalAnswer = response.response || '';
            if (finalAnswer) {
              const parsed = tryParseQueryResponse(finalAnswer);
              if (parsed) {
                assistantRef.current.query = parsed.query;
                assistantRef.current.explanation = parsed.explanation;
                assistantRef.current.content = parsed.remaining;
              } else {
                assistantRef.current.content = finalAnswer;
              }
            }
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
            // Save to backend
            saveMessages(userMsg, assistantRef.current, convIdRef.current);
          }
        },
        onError: (error) => {
          if (assistantRef.current) {
            assistantRef.current.isStreaming = false;
            assistantRef.current.error = error;
            setMessages((prev) => [...prev.slice(0, -1), { ...assistantRef.current! }]);
            // Save even on error
            saveMessages(userMsg, assistantRef.current, convIdRef.current);
          }
        },
      });
    },
    [inputValue, isStreaming, messages, actionKey, actionContext, sendMessage, saveMessages],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const presetPrompts = [t('prompts.cpu_usage'), t('prompts.memory_usage'), t('prompts.mysql_alive')];

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
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} datasourceType={actionContext?.datasource_type} onRunQuery={onApplyQuery} />)
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
