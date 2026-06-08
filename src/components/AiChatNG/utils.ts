import { clsx, type ClassValue } from 'clsx';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EAiChatContentType, IAiChatMessage, IAiChatMessageResponse, IAiChatStreamChunk, IAiChatStreamSegment } from './types';

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

export function applyStreamChunk(segments: IAiChatStreamSegment[], chunk: IAiChatStreamChunk): IAiChatStreamSegment[] {
  const next = [...segments];
  const last = next[next.length - 1];
  const delta = chunk.delta || chunk.content || '';

  switch (chunk.type) {
    case 'thinking':
    case 'text': {
      const kind = chunk.type === 'thinking' ? 'thinking' : 'text';
      if (!delta) return next;
      if (last && !last.done && last.kind === kind) {
        // 同类未收口段 → 追加
        next[next.length - 1] = { ...last, content: last.content + delta };
      } else {
        // 类型切换或上一段已收口 → 收口旧段、开新段
        if (last && !last.done) next[next.length - 1] = { ...last, done: true };
        next.push({ kind, content: delta, done: false });
      }
      return next;
    }
    case 'step': {
      // 轮边界：收口当前未完成段
      if (last && !last.done) next[next.length - 1] = { ...last, done: true };
      return next;
    }
    default:
      return next;
  }
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

export function buildStreamingMessage(message: IAiChatMessage, segments: IAiChatStreamSegment[]): IAiChatMessage {
  const streamId = findStreamResponse(message)?.stream_id;

  const segmentBlocks: IAiChatMessageResponse[] = segments
    .filter((seg) => seg.content.trim())
    .map((seg) => ({
      content_type: seg.kind === 'thinking' ? EAiChatContentType.Thinking : EAiChatContentType.Markdown,
      content: seg.content,
      is_finish: seg.done,
      is_from_ai: true,
    }));

  // 保留 stream_id 锚点（findStreamResponse / 重连逻辑依赖它）
  if (segmentBlocks.length && streamId) {
    segmentBlocks[0].stream_id = streamId;
  }

  // 流式期间 detail 的 response 只有空的占位 markdown 块，直接以段列表替换；
  // 防御性保留其它类型块（理论上进行中不会出现）
  const otherBlocks = (message.response || []).filter(
    (item) => ![EAiChatContentType.Thinking, EAiChatContentType.Reasoning, EAiChatContentType.Markdown].includes(item.content_type as EAiChatContentType),
  );

  return { ...message, response: [...segmentBlocks, ...otherBlocks] };
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

  if (chunk.p === 'step') {
    return { type: 'step', content: chunk.v || '' };
  }

  return chunk;
}
