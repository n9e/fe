import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Spin } from 'antd';
import type { TextAreaRef } from 'antd/lib/input/TextArea';
import { LoadingOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CornerDownLeft } from 'lucide-react';

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
  IAiChatTurnScope,
} from './types';
import { uiActionRuntime } from './uiActionRuntime';
import { applyStreamChunk, buildStreamingMessage, cn, findStreamResponse, upsertMessage, useAutoScroll } from './utils';
import { useAiChatStream } from './useStream';
import { useAiChatContext } from './context';
import { normalizeError } from '@/utils/appError';
import { reportPageError } from '@/utils/pageError';

import './query-dock.less';

const POLLING_INTERVAL = 3000;
const STREAM_RENDER_INTERVAL = 50;

export default function ChatPanel(props: IAiChatProps) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    placeholder,
    suggestion,
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
    prepareTurn,
    onConversationInteract,
    onBusyChange,
    active = true,
  } = props;
  const slim = variant === 'slim';
  const { shareReadonly } = useAiChatContext();
  // Read through a ref: callers rebuild this object freely on render, and a
  // new identity must not be mistaken for a new conversation.
  const queryPageFromRef = useRef(queryPageFrom);
  queryPageFromRef.current = queryPageFrom;
  // A page may hand a reader instead of an object, so what goes out with a
  // message is the page as it is at that moment, not as it was at mount.
  const currentPageFrom = () => {
    const source = queryPageFromRef.current;
    return typeof source === 'function' ? source() : source;
  };
  const [activeChat, setActiveChat] = useState<IAiChatHistoryItem>();
  const [messages, setMessages] = useState<IAiChatMessage[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const activeRef = useRef(active);
  activeRef.current = active;
  // Slim: the composer takes focus when the dock opens or starts over, so the
  // user can type at once and Esc reaches the dock as the key legend promises.
  const composerRef = useRef<TextAreaRef>(null);
  useEffect(() => {
    if (slim && active) composerRef.current?.focus();
  }, [slim, active]);
  const turnGenerationRef = useRef(0);
  const pendingTurnRef = useRef<{ scope?: IAiChatTurnScope; locator?: IAiChatMessageLocator; content: string }>();
  const finishingTurnsRef = useRef(new Set<string>());
  const [inputValue, setInputValue] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftHint, setDraftHint] = useState(false);
  // The question being sent, shown at once: the server-side message it becomes
  // only exists after chat/new and message/new have both returned.
  const [pendingContent, setPendingContent] = useState<string>();
  // Which suggestion the arrow keys have moved to; Tab fills it, Enter sends it.
  const [highlight, setHighlight] = useState(0);
  useEffect(() => {
    onBusyChange?.(submitting);
    if (!submitting) setDraftHint(false);
  }, [submitting, onBusyChange]);
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
  // The chat this panel created itself. A parent that hands it back as
  // `chatId` is confirming, not switching: nothing to stop, nothing to load.
  const ownChatIdRef = useRef<string>();
  const onTurnRef = useRef(onTurn);
  onTurnRef.current = onTurn;

  const runPageAction = useCallback(async (message: IAiChatMessage) => {
    if (!liveTurnsRef.current.has(`${message.chat_id}:${message.seq_id}`)) return;
    const last = message.response?.[message.response.length - 1];
    if (last?.content_type !== EAiChatContentType.PageAction) return;
    const request = last.param as IAiChatPageActionRequest | undefined;
    if (!request?.call_id || !request.name || executedCallsRef.current.has(request.call_id)) return;
    executedCallsRef.current.add(request.call_id);
    if (!activeRef.current) return;
    const outcome = pendingTurnRef.current?.scope
      ? await pendingTurnRef.current.scope.executePageAction(request)
      : await uiActionRuntime.execute({ callId: request.call_id, name: request.name, args: request.args ?? {} });
    setPageActionOutcomes((previous) => ({ ...previous, [request.call_id]: outcome }));
    return outcome;
  }, []);

  // 在会话切换提交后、异步回调执行前同步更新 ref，避免旧会话回包写回当前界面。
  useLayoutEffect(() => {
    if (visibleChatIdRef.current === chatId) return;

    visibleChatIdRef.current = chatId;
    if (!chatId) {
      activeChatRef.current = undefined;
    } else if (activeChatRef.current?.chat_id !== chatId) {
      activeChatRef.current = { chat_id: chatId, title: '', last_update: 0, page_from: currentPageFrom() };
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
      const generation = turnGenerationRef.current;
      const key = `${locator.chat_id}:${locator.seq_id}`;
      const isCurrentTurn = () => {
        const pending = pendingTurnRef.current?.locator;
        return (
          activeRef.current &&
          generation === turnGenerationRef.current &&
          isCurrentChat(locator.chat_id) &&
          (!pending || (pending.chat_id === locator.chat_id && pending.seq_id === locator.seq_id))
        );
      };
      if (!isCurrentTurn() || finishingTurnsRef.current.has(key)) return false;
      let detail: IAiChatMessage;
      try {
        detail = await getMessageDetail(locator);
      } catch (error) {
        if (!isCurrentTurn()) return false;
        throw error;
      }
      if (!isCurrentTurn() || finishingTurnsRef.current.has(key)) return false;

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
        // Polling and stream completion can return the same turn together.
        // Only this owner may announce completion after the page action settles.
        finishingTurnsRef.current.add(key);
        cleanupPolling();
        setStreamingLocator(undefined);
        streamBufferRef.current = {
          locator: undefined,
          segments: [],
        };
        const actionOutcome = detail.err_code ? undefined : await runPageAction(detail);
        if (!isCurrentTurn()) return false;
        setSubmitting(false);
        setPendingContent(undefined);
        pendingTurnRef.current?.scope?.finish?.();
        pendingTurnRef.current = undefined;
        onTurnRef.current?.({ phase: 'done', message: detail, actionOutcome, reason: detail.err_code === -2 ? 'stopped' : detail.err_code ? 'error' : undefined });
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
                page_from: previous?.page_from || currentPageFrom(),
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
          setPendingContent(undefined);
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
    if (chatId && chatId === ownChatIdRef.current && activeChatRef.current?.chat_id === chatId) {
      return;
    }
    // First send creates the chat locally before the parent lifts `chatId`.
    // loadMessages (and friends) changing identity must not tear that down or
    // the turn is cancelled with "已停止，尚未修改" and the send looks dead.
    if (!chatId && (ownChatIdRef.current || pendingTurnRef.current)) {
      return;
    }
    turnGenerationRef.current += 1;
    pendingTurnRef.current?.scope?.cancel();
    pendingTurnRef.current = undefined;
    liveTurnsRef.current.clear();
    cancelScheduledStreamRender();
    cleanupPolling();
    stopStream();
    setSubmitting(false);
    setPendingContent(undefined);
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
            page_from: currentPageFrom(),
          };
    activeChatRef.current = nextChat;
    setActiveChat(nextChat);
    loadMessages(chatId);
  }, [cancelScheduledStreamRender, chatId, cleanupPolling, loadMessages, stopStream]);

  useEffect(() => {
    return () => {
      turnGenerationRef.current += 1;
      const pending = pendingTurnRef.current;
      pending?.scope?.cancel();
      pendingTurnRef.current = undefined;
      liveTurnsRef.current.clear();
      if (pending?.locator) void cancelMessage(pending.locator).catch(() => {});
      cancelScheduledStreamRender();
      cleanupPolling();
      stopStream();
    };
  }, [cancelScheduledStreamRender, cleanupPolling, stopStream]);

  const initialMessageSentRef = useRef(false);

  const createNewChat = useCallback(
    async (generation: number) => {
      try {
        const chat = await createChat(currentPageFrom());
        if (generation !== turnGenerationRef.current || !activeRef.current) return;
        ownChatIdRef.current = chat.chat_id;
        activeChatRef.current = chat;
        setActiveChat(chat);
        setMessages([]);
        return chat;
      } catch (error) {
        if (generation !== turnGenerationRef.current || !activeRef.current) return;
        handleError(error instanceof Error ? error : new Error('create chat failed'));
        return undefined;
      }
    },
    [handleError],
  );

  const sendUserMessage = useCallback(
    async (action?: IAiChatAction, overrideContent?: string) => {
      if (submitting || pendingTurnRef.current || shareReadonly || !activeRef.current) return;
      const content = (overrideContent ?? inputValue).trim();
      if (!content) return;

      const generation = ++turnGenerationRef.current;
      const pending = { scope: prepareTurn?.(), content, locator: undefined as IAiChatMessageLocator | undefined };
      pendingTurnRef.current = pending;
      const pageFrom = currentPageFrom();
      setSubmitting(true);
      setPendingContent(content);
      setInputValue('');
      setDraftHint(false);
      try {
        const currentChat = chatId && activeChat?.chat_id !== chatId ? undefined : activeChat;
        const chat = currentChat || (chatId ? { chat_id: chatId, title: '', last_update: 0, page_from: currentPageFrom() } : await createNewChat(generation));
        if (generation !== turnGenerationRef.current || !activeRef.current) {
          return;
        }
        if (!chat) {
          setInputValue((draft) => draft || content);
          pendingTurnRef.current = undefined;
          setSubmitting(false);
          setPendingContent(undefined);
          return;
        }
        // Lift the id before message/new so the chatId effect sees a stable
        // owned conversation instead of re-entering the !chatId reset path.
        if (!chatId) {
          onChatChange?.(chat);
        }

        const query = {
          content,
          action: action || queryAction,
          page_from: pageFrom || chat.page_from,
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
        if (generation !== turnGenerationRef.current || !activeRef.current) {
          void cancelMessage({ chat_id: result.chat_id, seq_id: result.seq_id }).catch(handleError);
          return;
        }
        pending.locator = { chat_id: result.chat_id, seq_id: result.seq_id };
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

        setPendingContent(undefined);
        mergeMessage(optimisticMessage);
        onTurnRef.current?.({ phase: 'running', message: optimisticMessage });
        scrollToBottom('smooth');
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
        if (generation !== turnGenerationRef.current || !activeRef.current) {
          return;
        }
        pendingTurnRef.current?.scope?.finish?.();
        pendingTurnRef.current = undefined;
        setSubmitting(false);
        setPendingContent(undefined);
        if (!pending.locator) setInputValue((draft) => draft || content);
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
      prepareTurn,
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

  const handleStop = useCallback(() => {
    const pending = pendingTurnRef.current;
    const locator = pending?.locator ?? streamBufferRef.current.locator;
    // Revoke execution before any network cancellation: late responses must
    // never regain the right to write into the page or finish another turn.
    turnGenerationRef.current += 1;
    pending?.scope?.cancel();
    pendingTurnRef.current = undefined;
    liveTurnsRef.current.clear();
    cancelScheduledStreamRender();
    stopStream();
    cleanupPolling();
    setSubmitting(false);
    setPendingContent(undefined);
    setStreamingLocator(undefined);
    streamBufferRef.current = { locator: undefined, segments: [] };
    const message = locator && messagesRef.current.find((item) => item.chat_id === locator.chat_id && item.seq_id === locator.seq_id);
    if (message) {
      const stopped = { ...message, is_finish: true, err_code: -2 };
      mergeMessage(stopped);
      onTurnRef.current?.({ phase: 'done', message: stopped, reason: 'stopped' });
    }
    if (locator) void cancelMessage(locator).catch((error) => handleError(error instanceof Error ? error : new Error('cancel message failed')));
  }, [cancelScheduledStreamRender, cleanupPolling, handleError, mergeMessage, stopStream]);

  const stopRef = useRef(handleStop);
  stopRef.current = handleStop;
  useEffect(() => {
    if (!active) stopRef.current();
  }, [active]);

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
      shape={slim && submitting ? 'default' : 'circle'}
      size={slim ? 'small' : undefined}
      disabled={shareReadonly}
      aria-label={submitting ? t('input.stop') : t('input.send')}
      icon={submitting ? slim ? undefined : <PauseCircleOutlined /> : <IconFont type='icon-ic_send' style={{ color: '#fff', fontSize: 14 }} />}
      onClick={() => {
        if (submitting) {
          handleStop();
        } else {
          sendUserMessage();
        }
      }}
    >
      {slim && submitting ? t('input.stop') : null}
    </Button>
  );

  const prompts = (promptList ?? []).map((prompt) => (typeof prompt === 'string' ? { label: prompt, value: prompt } : prompt));
  const pendingItem =
    slim && pendingContent && !messages.length ? (
      <MessageItem
        key='pending'
        message={{ chat_id: '', seq_id: 0, query: { content: pendingContent, page_from: currentPageFrom() }, response: [], cur_step: t('message.generating'), is_finish: false }}
        isStreaming={false}
        onActionClick={sendUserMessage}
        onOKForFormSelectContent={sendUserMessage}
        maybeScrollToBottom={maybeScrollToBottom}
        pageActionOutcomes={pageActionOutcomes}
      />
    ) : null;
  const hasConversation = messagesLoading || messageItems.length > 0 || !!welcomeContent || !!pendingItem;
  const listHidden = slim && (collapsed || !hasConversation);
  // Empty slim: the suggestions float under the bar the way the conversation
  // will, one per row. They go away as soon as the user types or sends —
  // otherwise a cancelled first turn flashes them back under a "stopped"
  // status and looks like the send did nothing useful.
  const suggestionsOpen = slim && !collapsed && !hasConversation && !submitting && prompts.length > 0 && !inputValue.trim();
  const highlighted = prompts[Math.min(highlight, prompts.length - 1)];
  const sendPrompt = (value: string) => {
    void sendUserMessage(undefined, value);
  };
  const suggestionSheet = suggestionsOpen ? (
    <div role='listbox' aria-label={t('dock.try')} className='ai-query-dock-sheet absolute left-0 right-0 top-full z-20 overflow-hidden rounded-b-lg rounded-t-none border'>
      <div className='px-3 pb-1 pt-2 text-xs text-primary'>{t('dock.try')}</div>
      <div className='pb-1'>
        {prompts.map((prompt, index) => (
          <button
            key={prompt.value}
            type='button'
            role='option'
            aria-selected={index === highlight}
            tabIndex={-1}
            className={cn('ai-query-dock-prompt', index === highlight && 'is-active')}
            onMouseEnter={() => setHighlight(index)}
            // mousedown, not click: the composer keeps focus, so the next Enter
            // still lands in the box rather than on a button.
            onMouseDown={(event) => {
              event.preventDefault();
              sendPrompt(prompt.value);
            }}
          >
            {prompt.label}
          </button>
        ))}
      </div>
      <div className='ai-query-dock-keys'>
        <kbd>Tab</kbd>
        <span>{t('dock.key_fill')}</span>
        <i />
        <kbd>
          <CornerDownLeft size={11} strokeWidth={2} aria-hidden='true' />
        </kbd>
        <span>{t('dock.key_send')}</span>
        <i />
        <kbd>Esc</kbd>
        <span>{t('dock.close')}</span>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('flex w-full min-h-0', slim ? 'relative' : 'h-full')} {...(slim ? { 'data-ai-surface': 'query-dock' } : {})}>
      <div className='flex w-full min-w-0 flex-1 flex-col'>
        <div
          ref={chatBodyRef}
          onPointerDown={onConversationInteract}
          onWheel={onConversationInteract}
          onFocusCapture={onConversationInteract}
          className={cn(
            'min-h-0 w-full best-looking-scroll',
            slim
              ? cn('ai-query-dock-sheet absolute left-0 right-0 top-full z-20 max-h-[52vh] overflow-y-auto overscroll-contain rounded-b-lg rounded-t-none border p-3')
              : 'h-full flex-1',
            listHidden && 'hidden',
          )}
        >
          <div ref={chatContentRef} className={cn('flex w-full flex-col', slim ? 'max-w-[880px]' : 'mx-auto min-h-full max-w-[900px]')}>
            {messagesLoading ? (
              <div className='flex flex-1 items-center justify-center'>
                <Spin indicator={<LoadingOutlined />} />
              </div>
            ) : (
              <div className={cn('flex-1 flex flex-col', slim ? 'gap-3' : 'gap-8')}>
                {pendingItem ||
                  (messageItems.length
                    ? messageItems
                    : welcomeContent
                    ? welcomeContent
                    : !slim && (
                        <EmptyConversation
                          prompts={promptList?.map((prompt) => (typeof prompt === 'string' ? prompt : prompt.value))}
                          onPromptClick={(prompt) => {
                            setInputValue(prompt);
                          }}
                        />
                      ))}
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            slim
              ? cn(
                  'ai-query-dock-input flex w-full items-center gap-2 border bg-transparent px-2 py-1',
                  // The bar and whatever floats under it read as one surface.
                  listHidden && !suggestionsOpen ? 'rounded-lg' : 'rounded-t-lg rounded-b-none border-b-0',
                )
              : 'mx-auto mt-4 w-full max-w-[900px] rounded-lg fc-border shadow-md',
            inputContainerClassName,
          )}
        >
          {slim && inputPrefix}
          <div className={slim ? 'ai-query-dock-composer' : 'contents'}>
            <Input.TextArea
              ref={composerRef}
              autoSize={slim ? { minRows: 1, maxRows: 4 } : { minRows: 3, maxRows: 8 }}
              bordered={false}
              value={inputValue}
              placeholder={shareReadonly ? t('input.share_readonly_placeholder') : slim && submitting ? t('dock.placeholder_draft') : placeholder ?? t('input.placeholder')}
              disabled={shareReadonly}
              onChange={(event) => {
                setInputValue(event.target.value);
                setDraftHint(false);
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              onKeyDown={(event) => {
                if (isComposing) return;
                if (suggestionsOpen && highlighted) {
                  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    setHighlight((previous) => (previous + (event.key === 'ArrowDown' ? 1 : prompts.length - 1)) % prompts.length);
                    return;
                  }
                  if (event.key === 'Tab' && !event.shiftKey) {
                    event.preventDefault();
                    setInputValue(highlighted.value);
                    return;
                  }
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendPrompt(highlighted.value);
                    return;
                  }
                } else if (slim && suggestion && !inputValue.trim() && event.key === 'Tab' && !event.shiftKey) {
                  // The placeholder is the model's suggested next message; Tab takes it.
                  event.preventDefault();
                  setInputValue(suggestion);
                  return;
                }
                if (event.key !== 'Enter') return;
                if (event.shiftKey) return;
                event.preventDefault();
                if (slim && (submitting || pendingTurnRef.current)) {
                  setDraftHint(true);
                  return;
                }
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
        {slim && draftHint && (
          <div className='ai-query-dock-draft-hint' role='status'>
            {t('dock.wait_to_send')}
          </div>
        )}
        {suggestionSheet}
      </div>
    </div>
  );
}
