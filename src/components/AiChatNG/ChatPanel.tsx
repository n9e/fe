import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import { LoadingOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import IconFont from '@/components/IconFont';

import { cancelMessage, createChat, getMessageDetail, getMessageHistory, sendMessage } from './services';
import { EmptyConversation, MessageItem } from './MessageBlocks';
import { IAiChatAction, IAiChatHistoryItem, IAiChatMessage, IAiChatMessageLocator, IAiChatProps } from './types';
import { buildStreamingMessage, findStreamResponse, upsertMessage, useAutoScroll } from './utils';
import { useAiChatStream } from './useStream';

const POLLING_INTERVAL = 3000;

export default function ChatPanel(props: IAiChatProps) {
  const { t } = useTranslation('AiChat');
  const { placeholder, chatId, queryPageFrom, queryAction, promptList, onExecuteQueryForQueryContent, onChatChange, onError, welcomeSlot } = props;
  const [activeChat, setActiveChat] = useState<IAiChatHistoryItem>();
  const [messages, setMessages] = useState<IAiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [streamingLocator, setStreamingLocator] = useState<IAiChatMessageLocator>();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const pollingTimerRef = useRef<number>();
  const startStreamRef = useRef<(streamId: string) => Promise<void> | void>();
  const streamBufferRef = useRef<{ locator?: IAiChatMessageLocator; thinking: string; text: string }>({ locator: undefined, thinking: '', text: '' });
  const { maybeScrollToBottom, scrollToBottom } = useAutoScroll(chatBodyRef);

  const cleanupPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      window.clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = undefined;
    }
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      onError?.(error);
    },
    [onError],
  );

  const mergeMessage = useCallback((message: IAiChatMessage) => {
    setMessages((previous) => upsertMessage(previous, message));
  }, []);

  const syncMessageDetail = useCallback(
    async (locator: IAiChatMessageLocator, options?: { startStream?: boolean }) => {
      const detail = await getMessageDetail(locator);
      const streamingState = streamBufferRef.current;
      const shouldOverlayStream =
        streamingState.locator?.chat_id === locator.chat_id &&
        streamingState.locator?.seq_id === locator.seq_id &&
        (!!streamingState.thinking || !!streamingState.text) &&
        !detail.is_finish;

      mergeMessage(shouldOverlayStream ? buildStreamingMessage(detail, streamingState.thinking, streamingState.text) : detail);

      if (!detail.is_finish) {
        const streamResponse = findStreamResponse(detail);
        const isCurrentStream = streamingState.locator?.chat_id === locator.chat_id && streamingState.locator?.seq_id === locator.seq_id;
        if ((options?.startStream || !isCurrentStream) && streamResponse?.stream_id) {
          setStreamingLocator(locator);
          streamBufferRef.current = {
            locator,
            thinking: isCurrentStream ? streamingState.thinking : '',
            text: isCurrentStream ? streamingState.text : '',
          };
          startStreamRef.current?.(streamResponse.stream_id);
        }
      }

      if (detail.is_finish) {
        setSubmitting(false);
        cleanupPolling();
        setStreamingLocator(undefined);
        streamBufferRef.current = {
          locator: undefined,
          thinking: '',
          text: '',
        };
      }
    },
    [cleanupPolling, mergeMessage],
  );

  const { start: startStream, stop: stopStream } = useAiChatStream({
    onChunk: (chunk) => {
      const locator = streamBufferRef.current.locator;
      if (!locator) return;

      if (chunk.type === 'thinking') {
        streamBufferRef.current.thinking += chunk.delta || chunk.content || '';
      }

      if (chunk.type === 'text') {
        streamBufferRef.current.text += chunk.delta || chunk.content || '';
      }

      if (chunk.type === 'error' && chunk.error) {
        handleError(new Error(chunk.error));
      }

      setMessages((previous) => {
        const target = previous.find((item) => item.chat_id === locator.chat_id && item.seq_id === locator.seq_id);
        if (!target) return previous;
        return upsertMessage(previous, buildStreamingMessage(target, streamBufferRef.current.thinking, streamBufferRef.current.text));
      });
      maybeScrollToBottom('smooth');
    },
    onFinish: () => {
      const locator = streamBufferRef.current.locator;
      if (!locator) return;
      syncMessageDetail(locator).catch((error) => handleError(error instanceof Error ? error : new Error('sync message failed')));
    },
    onError: handleError,
  });

  useEffect(() => {
    startStreamRef.current = startStream;
  }, [startStream]);

  const loadMessages = useCallback(
    async (targetChatId: string) => {
      setMessagesLoading(true);
      try {
        const nextMessages = await getMessageHistory({ chat_id: targetChatId });
        setMessages(nextMessages);
        setActiveChat((previous) => {
          const nextChat =
            previous?.chat_id === targetChatId
              ? previous
              : {
                  chat_id: targetChatId,
                  title: previous?.title || '',
                  last_update: previous?.last_update || 0,
                  page_from: previous?.page_from || queryPageFrom,
                };
          onChatChange?.(nextChat);
          return nextChat;
        });
        requestAnimationFrame(() => scrollToBottom('auto'));
      } catch (error) {
        handleError(error instanceof Error ? error : new Error('load messages failed'));
      } finally {
        setMessagesLoading(false);
      }
    },
    [handleError, onChatChange, queryPageFrom, scrollToBottom],
  );

  useEffect(() => {
    cleanupPolling();
    stopStream();
  }, [cleanupPolling, stopStream]);

  useEffect(() => {
    if (!chatId) {
      cleanupPolling();
      stopStream();
      setActiveChat(undefined);
      setMessages([]);
      setStreamingLocator(undefined);
      streamBufferRef.current = {
        locator: undefined,
        thinking: '',
        text: '',
      };
      setSubmitting(false);
      return;
    }

    setActiveChat((previous) =>
      previous?.chat_id === chatId
        ? previous
        : {
            chat_id: chatId,
            title: '',
            last_update: 0,
            page_from: queryPageFrom,
          },
    );
    loadMessages(chatId);
  }, [chatId, cleanupPolling, loadMessages, queryPageFrom, stopStream]);

  useEffect(() => {
    return () => {
      cleanupPolling();
      stopStream();
    };
  }, [cleanupPolling, stopStream]);

  const createNewChat = useCallback(async () => {
    try {
      const chat = await createChat(queryPageFrom);
      setActiveChat(chat);
      setMessages([]);
      onChatChange?.(chat);
      return chat;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('create chat failed'));
      return undefined;
    }
  }, [handleError, onChatChange, queryPageFrom]);

  const startPolling = useCallback(
    (locator: IAiChatMessageLocator) => {
      cleanupPolling();
      pollingTimerRef.current = window.setInterval(() => {
        syncMessageDetail(locator).catch((error) => handleError(error instanceof Error ? error : new Error('poll message failed')));
      }, POLLING_INTERVAL);
    },
    [cleanupPolling, handleError, syncMessageDetail],
  );

  const sendUserMessage = useCallback(
    async (action?: IAiChatAction, overrideContent?: string) => {
      if (submitting) return;
      const content = (overrideContent ?? inputValue).trim();
      if (!content) return;

      setSubmitting(true);
      try {
        const currentChat = chatId && activeChat?.chat_id !== chatId ? undefined : activeChat;
        const chat = currentChat || (chatId ? { chat_id: chatId, title: '', last_update: 0, page_from: queryPageFrom } : await createNewChat());
        if (!chat) {
          setSubmitting(false);
          return;
        }

        const query = {
          content,
          action: action || queryAction,
          page_from: queryPageFrom || chat.page_from,
        };

        const result = await sendMessage({
          chat_id: chat.chat_id,
          query,
        });

        const optimisticMessage: IAiChatMessage = {
          chat_id: result.chat_id,
          seq_id: result.seq_id,
          query,
          response: [],
          cur_step: t('message.generating'),
          is_finish: false,
          recommend_action: [],
          err_code: 0,
        };

        mergeMessage(optimisticMessage);
        setInputValue('');
        onChatChange?.({
          ...chat,
          title: chat.title || content.slice(0, 50),
          last_update: Math.floor(Date.now() / 1000),
          is_new: false,
        });

        const locator = {
          chat_id: result.chat_id,
          seq_id: result.seq_id,
        };

        await syncMessageDetail(locator, { startStream: true });
        startPolling(locator);
      } catch (error) {
        setSubmitting(false);
        const nextError = error instanceof Error ? error : new Error('send message failed');
        handleError(nextError);
      }
    },
    [activeChat, chatId, createNewChat, handleError, inputValue, mergeMessage, onChatChange, queryAction, queryPageFrom, startPolling, submitting, syncMessageDetail, t],
  );

  const handleStop = useCallback(async () => {
    if (!streamingLocator) return;
    try {
      stopStream();
      cleanupPolling();
      await cancelMessage(streamingLocator);
      const nextMessage = await getMessageDetail(streamingLocator);
      mergeMessage(nextMessage);
      setStreamingLocator(undefined);
      streamBufferRef.current = {
        locator: undefined,
        thinking: '',
        text: '',
      };
      setSubmitting(false);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('cancel message failed'));
    }
  }, [cleanupPolling, handleError, mergeMessage, stopStream, streamingLocator]);

  const messageItems = useMemo(() => {
    return messages.map((messageItem) => (
      <MessageItem
        key={`${messageItem.chat_id}-${messageItem.seq_id}`}
        message={messageItem}
        isStreaming={streamingLocator?.chat_id === messageItem.chat_id && streamingLocator?.seq_id === messageItem.seq_id}
        onExecuteQueryForQueryContent={onExecuteQueryForQueryContent}
        onActionClick={sendUserMessage}
        maybeScrollToBottom={maybeScrollToBottom}
      />
    ));
  }, [onExecuteQueryForQueryContent, maybeScrollToBottom, messages, sendUserMessage, streamingLocator?.chat_id, streamingLocator?.seq_id]);

  return (
    <div className='flex w-full h-full min-h-0'>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div ref={chatBodyRef} className='h-full min-h-0 w-full flex-1 best-looking-scroll children:h-full'>
          <Spin spinning={messagesLoading} indicator={<LoadingOutlined />}>
            <div className='h-full flex flex-col gap-8'>
              {messageItems.length ? (
                messageItems
              ) : welcomeSlot ? (
                welcomeSlot
              ) : (
                <EmptyConversation
                  prompts={promptList}
                  onPromptClick={(prompt) => {
                    setInputValue(prompt);
                    sendUserMessage(undefined, prompt);
                  }}
                />
              )}
            </div>
          </Spin>
        </div>

        <div className='mt-4 rounded-lg fc-border'>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 8 }}
            bordered={false}
            value={inputValue}
            placeholder={placeholder ?? t('input.placeholder')}
            onChange={(event) => setInputValue(event.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              if (event.shiftKey) return;
              if (isComposing) return;
              event.preventDefault();
              sendUserMessage();
            }}
            className='bg-transparent text-base text-main placeholder:text-placeholder'
          />
          <div className='mt-3 flex items-center justify-between gap-2 px-2 pb-2'>
            <div />
            <div className='flex items-center gap-2'>
              <Button
                type='primary'
                shape='circle'
                icon={submitting ? <PauseCircleOutlined /> : <IconFont type='icon-ic_send' style={{ color: '#fff', fontSize: 14 }} />}
                onClick={() => {
                  if (submitting) {
                    handleStop();
                  } else {
                    sendUserMessage();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
