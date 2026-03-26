import { clsx, type ClassValue } from 'clsx';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EAiChatContentType, IAiChatMessage, IAiChatMessageResponse, IAiChatStreamChunk } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useAutoScroll(containerRef: React.RefObject<HTMLElement>) {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const frameRef = useRef<number>();
  const threshold = 48;

  const isNearBottom = useCallback(() => {
    const element = containerRef.current;
    if (!element) return false;
    return element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
  }, [containerRef]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const element = containerRef.current;
      if (!element) return;
      cancelAnimationFrame(frameRef.current || 0);
      frameRef.current = requestAnimationFrame(() => {
        element.scrollTo({ top: element.scrollHeight, behavior });
      });
    },
    [containerRef],
  );

  const maybeScrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      if (autoScrollEnabled && isNearBottom()) {
        scrollToBottom(behavior);
      }
    },
    [autoScrollEnabled, isNearBottom, scrollToBottom],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleScroll = () => {
      setAutoScrollEnabled(isNearBottom());
    };

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [containerRef, isNearBottom]);

  return {
    autoScrollEnabled,
    scrollToBottom,
    maybeScrollToBottom,
    setAutoScrollEnabled,
  };
}

export function formatChatTime(timestamp?: number) {
  if (!timestamp) return '';
  return moment.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function findStreamResponse(message?: IAiChatMessage): IAiChatMessageResponse | undefined {
  return message?.response?.find((item) => !!item.stream_id) || message?.response?.[0];
}

export function upsertMessage(messages: IAiChatMessage[], nextMessage: IAiChatMessage) {
  const index = messages.findIndex((item) => item.chat_id === nextMessage.chat_id && item.seq_id === nextMessage.seq_id);
  if (index === -1) {
    return [...messages, nextMessage];
  }

  const next = [...messages];
  next[index] = nextMessage;
  return next;
}

export function buildStreamingMessage(message: IAiChatMessage, thinking = '', text = ''): IAiChatMessage {
  const nextResponses = [...(message.response || [])];
  const streamId = findStreamResponse(message)?.stream_id;

  const upsertResponse = (predicate: (item: IAiChatMessageResponse) => boolean, nextItem: IAiChatMessageResponse, prepend = false) => {
    const index = nextResponses.findIndex(predicate);
    if (index === -1) {
      if (prepend) {
        nextResponses.unshift(nextItem);
      } else {
        nextResponses.push(nextItem);
      }
      return;
    }

    nextResponses[index] = {
      ...nextResponses[index],
      ...nextItem,
    };
  };

  if (thinking.trim()) {
    upsertResponse(
      (item) => [EAiChatContentType.Thinking, EAiChatContentType.Reasoning].includes(item.content_type as EAiChatContentType),
      {
        content_type: EAiChatContentType.Thinking,
        content: thinking,
        is_finish: false,
        is_from_ai: true,
      },
      true,
    );
  }

  if (text || streamId) {
    upsertResponse((item) => item.content_type === EAiChatContentType.Markdown, {
      content_type: EAiChatContentType.Markdown,
      content: text,
      stream_id: streamId,
      is_finish: false,
      is_from_ai: true,
    });
  }

  return {
    ...message,
    response: nextResponses,
  };
}

export function normalizeStreamChunk(chunk: IAiChatStreamChunk): IAiChatStreamChunk {
  if (chunk.type || chunk.delta || chunk.content || chunk.error) {
    return chunk;
  }

  if (chunk.p === 'reason') {
    return {
      type: 'thinking',
      delta: chunk.v || '',
      content: chunk.v || '',
    };
  }

  if (chunk.p === 'content') {
    return {
      type: 'text',
      delta: chunk.v || '',
      content: chunk.v || '',
    };
  }

  return chunk;
}
