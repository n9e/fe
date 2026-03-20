import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Input, Button, Space } from 'antd';
import { SendOutlined, StopOutlined, LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import Markdown from '@/components/Markdown';
import ThinkingBlock from './ThinkingBlock';
import QueryResultBlock from './QueryResultBlock';
import useStream from './useStream';
import { createChat, sendMessage, getMessageDetail, getMessageHistory, cancelMessage } from './services';
import type { AssistantChat, AssistantMessageDetail, AssistantAction, AssistantPageInfo } from './types';

const { TextArea } = Input;
const POLL_INTERVAL = 3000;

// Try to extract query/explanation from response content
function tryParseQueryResponse(text: string): { query: string; explanation: string; remaining: string } | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.query && typeof parsed.query === 'string') {
      const remaining = text.replace(jsonMatch[0], '').trim();
      return { query: parsed.query, explanation: parsed.explanation || '', remaining };
    }
    if (parsed.metrics && Array.isArray(parsed.metrics)) {
      const firstMetric = parsed.metrics[0];
      const examples = firstMetric?.promql_examples;
      if (examples && examples.length > 0) {
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
  chatId?: string;
  onChatChange?: (chat: AssistantChat) => void;
  onApplyQuery?: (query: string) => void;
}

export default function ChatPanel({ actionKey, actionContext, chatId, onChatChange, onApplyQuery }: Props) {
  const { t } = useTranslation('AICopilot');
  const { startStream, cancelStream } = useStream();

  const [messages, setMessages] = useState<AssistantMessageDetail[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Streaming content keyed by "chatId:seqId"
  const [streamContent, setStreamContent] = useState<Record<string, string>>({});
  const [streamReason, setStreamReason] = useState<Record<string, string>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string | undefined>(chatId);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skipNextLoadRef = useRef(false);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Load messages when chatId changes
  useEffect(() => {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    if (chatId) {
      getMessageHistory({ chat_id: chatId })
        .then((res) => {
          setMessages(res?.dat || []);
        })
        .catch(() => {});
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      cancelStream();
    };
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = (pollChatId: string, seqId: number) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await getMessageDetail({ chat_id: pollChatId, seq_id: seqId });
        const detail = res?.dat;
        if (detail) {
          setMessages((prev) => {
            const newList = [...prev];
            const idx = newList.findIndex((m) => m.chat_id === pollChatId && m.seq_id === seqId);
            if (idx >= 0) {
              newList[idx] = detail;
            }
            return newList;
          });
          if (detail.is_finish) {
            stopPolling();
            cancelStream();
            setIsLoading(false);
          }
        }
      } catch {
        // Keep polling on transient errors
      }
    }, POLL_INTERVAL);
  };

  const handleSend = useCallback(
    async (text?: string) => {
      const input = (text || inputValue).trim();
      if (!input || isLoading) return;

      setInputValue('');
      setIsLoading(true);

      try {
        // Build structured page_from and action from context
        const pageFrom: AssistantPageInfo = {
          page: actionContext?.datasource_type || 'explorer',
          param: {
            datasource_type: actionContext?.datasource_type,
            datasource_id: actionContext?.datasource_id,
          },
        };

        const action: AssistantAction = {
          key: actionKey,
          param: {
            datasource_type: actionContext?.datasource_type,
            datasource_id: actionContext?.datasource_id,
          },
        };

        // Ensure we have a chat
        let currentChatId = chatIdRef.current;
        if (!currentChatId) {
          const chatRes = await createChat({
            page: pageFrom.page,
            param: pageFrom.param,
          });
          const newChat = chatRes?.dat;
          if (!newChat?.chat_id) {
            setIsLoading(false);
            return;
          }
          currentChatId = newChat.chat_id;
          chatIdRef.current = currentChatId;
          skipNextLoadRef.current = true;
          onChatChange?.(newChat);
        }

        // Send message
        const msgRes = await sendMessage({
          chat_id: currentChatId,
          query: {
            content: input,
            action,
            page_from: pageFrom,
          },
        });

        const seqId = msgRes?.dat?.seq_id;
        if (!seqId) {
          setIsLoading(false);
          return;
        }

        // Add placeholder message
        const placeholder: AssistantMessageDetail = {
          chat_id: currentChatId,
          seq_id: seqId,
          model_id: 0,
          query: { content: input, action, page_from: pageFrom },
          response: [],
          cur_step: '',
          is_finish: false,
          feedback: { chat_id: currentChatId, seq_id: seqId, status: 0 },
          recommend_action: [],
          err_code: 0,
          err_title: '',
          err_msg: '',
          executed_tools: false,
        };
        setMessages((prev) => [...prev, placeholder]);

        // Start polling for message detail
        startPolling(currentChatId, seqId);

        // Start streaming - the first poll will return the stream_id, but
        // we can also get it from the first poll result. Let's do an initial
        // detail fetch to get the stream_id.
        setTimeout(async () => {
          try {
            const detailRes = await getMessageDetail({ chat_id: currentChatId!, seq_id: seqId });
            const detail = detailRes?.dat;
            if (detail) {
              setMessages((prev) => {
                const newList = [...prev];
                const idx = newList.findIndex((m) => m.seq_id === seqId && m.chat_id === currentChatId);
                if (idx >= 0) newList[idx] = detail;
                return newList;
              });

              // Find stream_id and start SSE
              const streamId = detail.response?.[0]?.stream_id;
              if (streamId && !detail.is_finish) {
                const key = `${currentChatId}:${seqId}`;
                startStream(
                  streamId,
                  (delta) => {
                    setStreamContent((prev) => ({ ...prev, [key]: (prev[key] || '') + delta }));
                  },
                  (delta) => {
                    setStreamReason((prev) => ({ ...prev, [key]: (prev[key] || '') + delta }));
                  },
                );
              }

              if (detail.is_finish) {
                stopPolling();
                setIsLoading(false);
              }
            }
          } catch {
            // Polling will catch up
          }
        }, 500);
      } catch {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, actionKey, actionContext, onChatChange, startStream],
  );

  const handleCancel = useCallback(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.is_finish) {
      cancelMessage({ chat_id: lastMsg.chat_id, seq_id: lastMsg.seq_id }).catch(() => {});
    }
    stopPolling();
    cancelStream();
    setIsLoading(false);
    setMessages((prev) => {
      const newList = [...prev];
      if (newList.length > 0) {
        newList[newList.length - 1] = { ...newList[newList.length - 1], is_finish: true };
      }
      return newList;
    });
  }, [messages, cancelStream]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const presetPrompts = [t('prompts.cpu_usage'), t('prompts.memory_usage'), t('prompts.mysql_alive')];
  const datasourceType = actionContext?.datasource_type;
  const language = datasourceType === 'prometheus' ? 'promql' : 'sql';

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
          messages.map((msg) => {
            const key = `${msg.chat_id}:${msg.seq_id}`;
            const liveContent = streamContent[key];
            const liveReason = streamReason[key];

            // Determine display content
            const responseItem = msg.response?.[0];
            const finalContent = responseItem?.is_finish ? responseItem.content : liveContent || responseItem?.content || '';
            const isAssistantFinished = msg.is_finish !== false;

            // Try parse query from final content
            let parsedQuery: string | undefined;
            let parsedExplanation: string | undefined;
            let displayContent = finalContent;
            if (isAssistantFinished && finalContent) {
              const parsed = tryParseQueryResponse(finalContent);
              if (parsed) {
                parsedQuery = parsed.query;
                parsedExplanation = parsed.explanation;
                displayContent = parsed.remaining;
              }
            }

            return (
              <React.Fragment key={key}>
                {/* User message */}
                {msg.query?.content && (
                  <div className='ai-copilot-message ai-copilot-message-user'>
                    <div className='ai-copilot-message-content'>
                      <div className='ai-copilot-message-text'>{msg.query.content}</div>
                    </div>
                  </div>
                )}

                {/* Assistant message */}
                <div className='ai-copilot-message ai-copilot-message-assistant'>
                  <div className='ai-copilot-message-content'>
                    {/* Thinking/reasoning */}
                    {liveReason && <ThinkingBlock thinking={liveReason} isStreaming={!isAssistantFinished} />}

                    {/* Loading step */}
                    {!isAssistantFinished && !finalContent && (
                      <div className='ai-copilot-message-loading'>
                        <LoadingOutlined style={{ marginRight: 6 }} />
                        <span>{msg.cur_step || t('thinking')}</span>
                      </div>
                    )}

                    {/* Markdown content */}
                    {displayContent && <Markdown content={displayContent} />}

                    {/* Query result */}
                    {parsedQuery && <QueryResultBlock query={parsedQuery} explanation={parsedExplanation} language={language} onRunQuery={onApplyQuery} />}

                    {/* Error */}
                    {msg.err_msg && <div className='ai-copilot-message-error'>{msg.err_msg}</div>}
                  </div>
                </div>
              </React.Fragment>
            );
          })
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
          disabled={isLoading}
        />
        <div className='ai-copilot-input-actions'>
          {isLoading ? (
            <Button size='small' danger icon={<StopOutlined />} onClick={handleCancel}>
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
