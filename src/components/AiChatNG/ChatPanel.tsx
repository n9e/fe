import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import { LoadingOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import IconFont from '@/components/IconFont';

import { cancelMessage, createChat, getMessageDetail, getMessageHistory, sendMessage } from './services';
import { NAME_SPACE } from './constants';
import { EmptyConversation, MessageItem } from './MessageBlocks';
import {
  AiChatPageActionOutcomes,
  EAiChatContentType,
  IAiChatAction,
  IAiChatHistoryItem,
  IAiChatMessage,
  IAiChatMessageLocator,
  IAiChatPageActionRequest,
  IAiChatProps,
  IAiChatStreamSegment,
} from './types';
import { uiActionRuntime } from './uiActionRuntime';
import { applyStreamChunk, buildStreamingMessage, cn, findStreamResponse, upsertMessage, useAutoScroll } from './utils';
import { useAiChatStream } from './useStream';
import { useAiChatContext } from './context';
import { normalizeError } from '@/utils/appError';
import { reportPageError } from '@/utils/pageError';

const POLLING_INTERVAL = 3000;
const STREAM_RENDER_INTERVAL = 50;

export default function ChatPanel(props: IAiChatProps) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    placeholder,
    chatId,
    queryPageFrom,
    queryAction,
    promptList,
    initialMessage,
    onExecuteQueryForQueryContent,
    onChatChange,
    onError,
    welcomeSlot,
    inputContainerClassName,
    variant = 'full',
    collapsed = false,
    inputPrefix,
    inputSuffix,
    onTurn,
  } = props;
  const slim = variant === 'slim';
  const { shareReadonly } = useAiChatContext();
  // Read through a ref: callers rebuild this object freely on render, and a
  // new identity must not be mistaken for a new conversation.
  const queryPageFromRef = useRef(queryPageFrom);
  queryPageFromRef.current = queryPageFrom;
  const [activeChat, setActiveChat] = useState<IAiChatHistoryItem>();
  const [messages, setMessages] = useState<IAiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [streamingLocator, setStreamingLocator] = useState<IAiChatMessageLocator>();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const pollingTimerRef = useRef<number>();
  const streamRenderTimerRef = useRef<number>();
  const startStreamRef = useRef<(streamId: string) => Promise<void> | void>();
  const streamBufferRef = useRef<{ locator?: IAiChatMessageLocator; segments: IAiChatStreamSegment[] }>({ locator: undefined, segments: [] });
  const activeChatRef = useRef<IAiChatHistoryItem>();
  const visibleChatIdRef = useRef<string | undefined>(chatId);
  const messageLoadRequestRef = useRef(0);
  const [pageActionOutcomes, setPageActionOutcomes] = useState<AiChatPageActionOutcomes>({});
  // Turns this panel sent in this session. Only these may run a page action:
  // a message loaded from history was written for a page that may no longer
  // be on screen, and a reload must not replay a write.
  const liveTurnsRef = useRef(new Set<string>());
  const executedCallsRef = useRef(new Set<string>());
  const onTurnRef = useRef(onTurn);
  onTurnRef.current = onTurn;

  const runPageAction = useCallback(async (message: IAiChatMessage) => {
    if (!liveTurnsRef.current.has(`${message.chat_id}:${message.seq_id}`)) return;
    const last = message.response?.[message.response.length - 1];
    if (last?.content_type !== EAiChatContentType.PageAction) return;
    const request = last.param as IAiChatPageActionRequest | undefined;
    if (!request?.call_id || !request.name || executedCallsRef.current.has(request.call_id)) return;
    executedCallsRef.current.add(request.call_id);
    const outcome = await uiActionRuntime.execute({ callId: request.call_id, name: request.name, args: request.args ?? {} });
    setPageActionOutcomes((previous) => ({ ...previous, [request.call_id]: outcome }));
  }, []);

  // 在会话切换提交后、异步回调执行前同步更新 ref，避免旧会话回包写回当前界面。
  useLayoutEffect(() => {
    if (visibleChatIdRef.current === chatId) return;

    visibleChatIdRef.current = chatId;
    if (!chatId) {
      activeChatRef.current = undefined;
    } else if (activeChatRef.current?.chat_id !== chatId) {
      activeChatRef.current = { chat_id: chatId, title: '', last_update: 0, page_from: queryPageFromRef.current };
    }
  }, [chatId]);

  const isCurrentChat = useCallback((targetChatId: string) => {
    return visibleChatIdRef.current === targetChatId || (!visibleChatIdRef.current && activeChatRef.current?.chat_id === targetChatId);
  }, []);
  const { maybeScrollToBottom, scrollToBottom } = useAutoScroll(chatBodyRef, chatContentRef);

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

  // 流式 chunk 先写入 ref 缓冲，再按固定节奏批量刷新到 React state，避免每个 chunk 都触发整棵消息树渲染。
  const flushStreamingMessage = useCallback(() => {
    const { locator, segments } = streamBufferRef.current;
    if (!locator) return;

    setMessages((previous) => {
      const target = previous.find((item) => item.chat_id === locator.chat_id && item.seq_id === locator.seq_id);
      if (!target) return previous;
      return upsertMessage(previous, buildStreamingMessage(target, segments));
    });
  }, []);

  const cancelScheduledStreamRender = useCallback(() => {
    if (streamRenderTimerRef.current) {
      window.clearTimeout(streamRenderTimerRef.current);
      streamRenderTimerRef.current = undefined;
    }
  }, []);

  const scheduleStreamRender = useCallback(() => {
    if (streamRenderTimerRef.current) return;

    streamRenderTimerRef.current = window.setTimeout(() => {
      streamRenderTimerRef.current = undefined;
      flushStreamingMessage();
    }, STREAM_RENDER_INTERVAL);
  }, [flushStreamingMessage]);

  const flushStreamingMessageImmediately = useCallback(() => {
    cancelScheduledStreamRender();
    flushStreamingMessage();
  }, [cancelScheduledStreamRender, flushStreamingMessage]);

  const syncMessageDetail = useCallback(
    async (locator: IAiChatMessageLocator, options?: { startStream?: boolean }) => {
      if (!isCurrentChat(locator.chat_id)) return false;

      const detail = await getMessageDetail(locator);
      if (!isCurrentChat(locator.chat_id)) return false;

      const streamingState = streamBufferRef.current;
      const shouldOverlayStream =
        streamingState.locator?.chat_id === locator.chat_id && streamingState.locator?.seq_id === locator.seq_id && streamingState.segments.length > 0 && !detail.is_finish;

      const nextMessage = shouldOverlayStream ? buildStreamingMessage(detail, streamingState.segments) : detail;
      mergeMessage(nextMessage);

      if (!detail.is_finish) {
        onTurnRef.current?.({ phase: 'running', message: nextMessage });
        const streamResponse = findStreamResponse(detail);
        const isCurrentStream = streamingState.locator?.chat_id === locator.chat_id && streamingState.locator?.seq_id === locator.seq_id;
        if ((options?.startStream || !isCurrentStream) && streamResponse?.stream_id) {
          setStreamingLocator(locator);
          streamBufferRef.current = {
            locator,
            segments: isCurrentStream ? streamingState.segments : [],
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
          segments: [],
        };
        await runPageAction(detail);
        onTurnRef.current?.({ phase: 'done', message: detail, reason: detail.err_code === -2 ? 'stopped' : detail.err_code ? 'error' : undefined });
      }

      return !detail.is_finish;
    },
    [cleanupPolling, isCurrentChat, mergeMessage, runPageAction],
  );

  const { start: startStream, stop: stopStream } = useAiChatStream({
    onChunk: (chunk) => {
      const locator = streamBufferRef.current.locator;
      if (!locator) return;

      if (chunk.type === 'thinking' || chunk.type === 'text' || chunk.type === 'step') {
        const previousSegments = streamBufferRef.current.segments;
        const nextSegments = applyStreamChunk(previousSegments, chunk);
        if (nextSegments !== previousSegments) {
          streamBufferRef.current.segments = nextSegments;
          scheduleStreamRender();
        }
      }

      if (chunk.type === 'error' && chunk.error) {
        handleError(new Error(chunk.error));
      }
    },
    onFinish: () => {
      const locator = streamBufferRef.current.locator;
      if (!locator) return;
      flushStreamingMessageImmediately();
      syncMessageDetail(locator).catch((error) => handleError(error instanceof Error ? error : new Error('sync message failed')));
    },
    onError: handleError,
  });

  // 流式消息更新后，如果用户未手动滚动则跟随到底部
  useEffect(() => {
    if (streamingLocator) {
      maybeScrollToBottom('auto');
    }
  }, [messages, streamingLocator, maybeScrollToBottom]);

  useEffect(() => {
    startStreamRef.current = startStream;
  }, [startStream]);

  const startPolling = useCallback(
    (locator: IAiChatMessageLocator) => {
      if (!isCurrentChat(locator.chat_id)) return;
      cleanupPolling();
      pollingTimerRef.current = window.setInterval(() => {
        if (!isCurrentChat(locator.chat_id)) {
          cleanupPolling();
          return;
        }
        syncMessageDetail(locator).catch((error) => handleError(error instanceof Error ? error : new Error('poll message failed')));
      }, POLLING_INTERVAL);
    },
    [cleanupPolling, handleError, isCurrentChat, syncMessageDetail],
  );

  const loadMessages = useCallback(
    async (targetChatId: string) => {
      const requestId = ++messageLoadRequestRef.current;
      // 记下发起时所在的页面：请求还没回来用户就翻走了的话，这个 403 属于上一页，
      // 不能拿它去顶掉用户当前正看着的那一屏
      const sourcePathname = window.location.pathname;
      const isLatestRequest = () => requestId === messageLoadRequestRef.current && isCurrentChat(targetChatId);
      setMessagesLoading(true);
      try {
        const nextMessages = await getMessageHistory({ chat_id: targetChatId });
        if (!isLatestRequest()) return;

        setMessages(nextMessages);
        const previous = activeChatRef.current;
        const nextChat =
          previous?.chat_id === targetChatId
            ? previous
            : {
                chat_id: targetChatId,
                title: previous?.title || '',
                last_update: previous?.last_update || 0,
                page_from: previous?.page_from || queryPageFromRef.current,
              };
        activeChatRef.current = nextChat;
        setActiveChat(nextChat);
        onChatChange?.(nextChat);

        const unfinishedMessage = [...nextMessages].reverse().find((message) => !message.is_finish);
        if (unfinishedMessage) {
          const locator = {
            chat_id: unfinishedMessage.chat_id,
            seq_id: unfinishedMessage.seq_id,
          };
          setSubmitting(true);
          if (await syncMessageDetail(locator, { startStream: true })) {
            startPolling(locator);
          }
        }

        requestAnimationFrame(() => scrollToBottom('auto'));
      } catch (error) {
        if (isLatestRequest()) {
          setSubmitting(false);
          // 读不到这个会话（多半是没有 FlashAI 权限，或会话不属于自己）：
          // 这个请求带着 silence，不报出来就是白屏转圈，所以在这里显式交给整页错误
          if ((error as { status?: number })?.status === 403 && window.location.pathname === sourcePathname) {
            reportPageError(
              normalizeError({
                status: 403,
                message: (error as { message?: string })?.message || '',
                data: (error as { data?: any })?.data,
                action: 'ai_chat.load_messages',
                path: sourcePathname,
              }),
            );
            return;
          }
          handleError(error instanceof Error ? error : new Error('load messages failed'));
        }
      } finally {
        if (isLatestRequest()) {
          setMessagesLoading(false);
        }
      }
    },
    [handleError, isCurrentChat, onChatChange, scrollToBottom, startPolling, syncMessageDetail],
  );

  useEffect(() => {
    cleanupPolling();
    stopStream();
  }, [cleanupPolling, stopStream]);

  useEffect(() => {
    cancelScheduledStreamRender();
    cleanupPolling();
    stopStream();
    setSubmitting(false);
    setStreamingLocator(undefined);
    // 切会话时未 flush 的流式缓冲有意丢弃：切回时由 loadMessages 从服务端重拉兜底。
    streamBufferRef.current = {
      locator: undefined,
      segments: [],
    };

    if (!chatId) {
      messageLoadRequestRef.current += 1;
      activeChatRef.current = undefined;
      setActiveChat(undefined);
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    const nextChat =
      activeChatRef.current?.chat_id === chatId
        ? activeChatRef.current
        : {
            chat_id: chatId,
            title: '',
            last_update: 0,
            page_from: queryPageFromRef.current,
          };
    activeChatRef.current = nextChat;
    setActiveChat(nextChat);
    loadMessages(chatId);
  }, [cancelScheduledStreamRender, chatId, cleanupPolling, loadMessages, stopStream]);

  useEffect(() => {
    return () => {
      cancelScheduledStreamRender();
      cleanupPolling();
      stopStream();
    };
  }, [cancelScheduledStreamRender, cleanupPolling, stopStream]);

  const initialMessageSentRef = useRef(false);

  const createNewChat = useCallback(async () => {
    try {
      const chat = await createChat(queryPageFromRef.current);
      activeChatRef.current = chat;
      setActiveChat(chat);
      setMessages([]);
      return chat;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('create chat failed'));
      return undefined;
    }
  }, [handleError]);

  const sendUserMessage = useCallback(
    async (action?: IAiChatAction, overrideContent?: string) => {
      if (submitting || shareReadonly) return;
      const content = (overrideContent ?? inputValue).trim();
      if (!content) return;

      setSubmitting(true);
      try {
        const currentChat = chatId && activeChat?.chat_id !== chatId ? undefined : activeChat;
        const chat = currentChat || (chatId ? { chat_id: chatId, title: '', last_update: 0, page_from: queryPageFromRef.current } : await createNewChat());
        if (!chat) {
          setSubmitting(false);
          return;
        }

        const query = {
          content,
          action: action || queryAction,
          page_from: queryPageFromRef.current || chat.page_from,
        };

        // What the page can do right now. Read at send time: registrations
        // come and go with the page, and this is also what closes a confirm
        // scope of 'turn' in the runtime.
        const manifest = uiActionRuntime.manifest();
        const result = await sendMessage({
          chat_id: chat.chat_id,
          query,
          manifest: manifest.length ? manifest : undefined,
        });
        liveTurnsRef.current.add(`${result.chat_id}:${result.seq_id}`);

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
        onTurnRef.current?.({ phase: 'running', message: optimisticMessage });
        scrollToBottom('smooth');
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

        if (await syncMessageDetail(locator, { startStream: true })) {
          startPolling(locator);
        }
      } catch (error) {
        setSubmitting(false);
        const nextError = error instanceof Error ? error : new Error('send message failed');
        handleError(nextError);
      }
    },
    [
      activeChat,
      chatId,
      createNewChat,
      handleError,
      inputValue,
      mergeMessage,
      onChatChange,
      queryAction,
      scrollToBottom,
      shareReadonly,
      startPolling,
      submitting,
      syncMessageDetail,
      t,
    ],
  );

  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      sendUserMessage(undefined, initialMessage);
    }
  }, [initialMessage, sendUserMessage]);

  const handleStop = useCallback(async () => {
    if (!streamingLocator) return;
    try {
      cancelScheduledStreamRender();
      stopStream();
      cleanupPolling();
      await cancelMessage(streamingLocator);
      const nextMessage = await getMessageDetail(streamingLocator);
      mergeMessage(nextMessage);
      onTurnRef.current?.({ phase: 'done', message: nextMessage, reason: 'stopped' });
      setStreamingLocator(undefined);
      streamBufferRef.current = {
        locator: undefined,
        segments: [],
      };
      setSubmitting(false);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('cancel message failed'));
    }
  }, [cancelScheduledStreamRender, cleanupPolling, handleError, mergeMessage, stopStream, streamingLocator]);

  const messageItems = useMemo(() => {
    return messages.map((messageItem) => (
      <MessageItem
        key={`${messageItem.chat_id}-${messageItem.seq_id}`}
        message={messageItem}
        isStreaming={streamingLocator?.chat_id === messageItem.chat_id && streamingLocator?.seq_id === messageItem.seq_id}
        onExecuteQueryForQueryContent={onExecuteQueryForQueryContent}
        onActionClick={sendUserMessage}
        onOKForFormSelectContent={sendUserMessage}
        maybeScrollToBottom={maybeScrollToBottom}
        pageActionOutcomes={pageActionOutcomes}
      />
    ));
  }, [onExecuteQueryForQueryContent, maybeScrollToBottom, messages, pageActionOutcomes, sendUserMessage, streamingLocator?.chat_id, streamingLocator?.seq_id]);

  const welcomeContent = typeof welcomeSlot === 'function' ? welcomeSlot((prompt) => sendUserMessage(undefined, prompt)) : welcomeSlot;

  const sendButton = (
    <Button
      type='primary'
      shape='circle'
      size={slim ? 'small' : undefined}
      disabled={shareReadonly}
      aria-label={submitting ? t('input.stop') : t('input.send')}
      icon={submitting ? <PauseCircleOutlined /> : <IconFont type='icon-ic_send' style={{ color: '#fff', fontSize: 14 }} />}
      onClick={() => {
        if (submitting) {
          handleStop();
        } else {
          sendUserMessage();
        }
      }}
    />
  );

  // Slim has no room for the greeting: the suggestions become chips.
  const promptChips =
    slim && promptList?.length ? (
      <div className='flex flex-wrap gap-1.5'>
        {promptList.map((prompt) => (
          <button
            key={prompt}
            type='button'
            className='cursor-pointer rounded-full fc-border bg-transparent px-2.5 py-0.5 text-xs text-main hover:border-primary hover:text-primary'
            onClick={() => setInputValue(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    ) : null;
  // A floating box with nothing in it is noise, so slim keeps it closed until there is something to show.
  const listHidden = slim && (collapsed || (!messagesLoading && !messageItems.length && !welcomeContent && !promptChips));

  return (
    <div className={cn('flex w-full min-h-0', slim ? 'relative' : 'h-full')}>
      <div className='flex w-full min-w-0 flex-1 flex-col'>
        <div
          ref={chatBodyRef}
          className={cn(
            'min-h-0 w-full best-looking-scroll',
            slim
              ? 'absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-[52vh] overflow-y-auto overscroll-contain rounded-lg fc-border bg-fc-100 p-3 shadow-md'
              : 'h-full flex-1',
            listHidden && 'hidden',
          )}
        >
          <div ref={chatContentRef} className={cn('mx-auto flex w-full flex-col', !slim && 'min-h-full max-w-[900px]')}>
            {messagesLoading ? (
              <div className='flex flex-1 items-center justify-center'>
                <Spin indicator={<LoadingOutlined />} />
              </div>
            ) : (
              <div className={cn('flex-1 flex flex-col', slim ? 'gap-4' : 'gap-8')}>
                {messageItems.length ? (
                  messageItems
                ) : welcomeContent ? (
                  welcomeContent
                ) : slim ? (
                  promptChips
                ) : (
                  <EmptyConversation
                    prompts={promptList}
                    onPromptClick={(prompt) => {
                      setInputValue(prompt);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            slim ? 'flex w-full items-center gap-2 rounded-md fc-border bg-fc-100 px-2 py-1' : 'mx-auto mt-4 w-full max-w-[900px] rounded-lg fc-border shadow-md',
            inputContainerClassName,
          )}
        >
          {slim && inputPrefix}
          <Input.TextArea
            autoSize={slim ? { minRows: 1, maxRows: 4 } : { minRows: 3, maxRows: 8 }}
            bordered={false}
            value={inputValue}
            placeholder={shareReadonly ? t('input.share_readonly_placeholder') : placeholder ?? t('input.placeholder')}
            disabled={shareReadonly}
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
            className={
              slim
                ? 'min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-main placeholder:text-[13px] placeholder:text-placeholder'
                : 'bg-transparent px-5 py-3.5 text-base text-main placeholder:text-[14px] placeholder:text-placeholder'
            }
          />
          {slim ? (
            <>
              {sendButton}
              {inputSuffix}
            </>
          ) : (
            <div className='mt-3 flex items-center justify-between gap-2 px-2 pb-2'>
              <div />
              <div className='flex items-center gap-2'>{sendButton}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
