import { clsx, type ClassValue } from 'clsx';
import moment from 'moment';
import { twMerge } from 'tailwind-merge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EAiChatContentType, IAiChatMessage, IAiChatMessageResponse, IAiChatStreamChunk, IAiChatStreamSegment } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AUTO_SCROLL_THRESHOLD = 48;
// 程序滚动派发的 scroll 事件晚于滚动本身，需要一个静默窗口避免被当成用户滚动；smooth 还要覆盖整段动画
const INSTANT_SCROLL_SETTLE_DELAY = 100;
const SMOOTH_SCROLL_SETTLE_DELAY = 400;

/**
 * 跟随滚动。是否跟随只取决于用户意图（followRef），位置判定仅用于从用户滚动中推断意图。
 * @param containerRef 滚动容器
 * @param contentRef 容器内的内容盒，高度变化（Markdown 渲染、折叠面板动画等）时同步跟随
 */
export function useAutoScroll(containerRef: React.RefObject<HTMLElement>, contentRef?: React.RefObject<HTMLElement>) {
  const [autoScrollEnabled, setAutoScrollEnabledState] = useState(true);
  const followRef = useRef(true);
  const programmaticRef = useRef(false);
  const frameRef = useRef<number>();
  const releaseTimerRef = useRef<number>();

  const setAutoScrollEnabled = useCallback((next: boolean) => {
    followRef.current = next;
    setAutoScrollEnabledState(next);
  }, []);

  const isNearBottom = useCallback(() => {
    const element = containerRef.current;
    if (!element) return false;
    return element.scrollHeight - element.scrollTop - element.clientHeight <= AUTO_SCROLL_THRESHOLD;
  }, [containerRef]);

  const endProgrammaticScroll = useCallback(() => {
    window.clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = undefined;
    programmaticRef.current = false;
  }, []);

  const requestScrollToBottom = useCallback(
    (behavior: ScrollBehavior) => {
      const element = containerRef.current;
      if (!element) return;
      programmaticRef.current = true;
      cancelAnimationFrame(frameRef.current || 0);
      frameRef.current = requestAnimationFrame(() => {
        const target = containerRef.current;
        if (!target) {
          programmaticRef.current = false;
          return;
        }
        target.scrollTo({ top: target.scrollHeight, behavior });
        window.clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = window.setTimeout(endProgrammaticScroll, behavior === 'smooth' ? SMOOTH_SCROLL_SETTLE_DELAY : INSTANT_SCROLL_SETTLE_DELAY);
      });
    },
    [containerRef, endProgrammaticScroll],
  );

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      setAutoScrollEnabled(true);
      requestScrollToBottom(behavior);
    },
    [requestScrollToBottom, setAutoScrollEnabled],
  );

  const maybeScrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      if (!followRef.current) return;
      requestScrollToBottom(behavior);
    },
    [requestScrollToBottom],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleScroll = () => {
      if (programmaticRef.current) return;
      setAutoScrollEnabled(isNearBottom());
    };

    // 用户一介入（滚轮、触摸、拖拽滚动条、按键）就结束程序滚动窗口，保证向上翻看能立即暂停跟随
    const handleUserIntent = () => {
      endProgrammaticScroll();
    };

    // 点击消息内容不是滚动意图，只有按在滚动条上才算
    const handlePointerDown = (event: MouseEvent) => {
      const { left } = element.getBoundingClientRect();
      if (event.clientX - left > element.clientWidth) {
        endProgrammaticScroll();
      }
    };

    element.addEventListener('scroll', handleScroll);
    element.addEventListener('wheel', handleUserIntent, { passive: true });
    element.addEventListener('touchmove', handleUserIntent, { passive: true });
    element.addEventListener('pointerdown', handlePointerDown, { passive: true });
    element.addEventListener('keydown', handleUserIntent);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      element.removeEventListener('wheel', handleUserIntent);
      element.removeEventListener('touchmove', handleUserIntent);
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('keydown', handleUserIntent);
    };
  }, [containerRef, endProgrammaticScroll, isNearBottom, setAutoScrollEnabled]);

  useEffect(() => {
    const element = contentRef?.current;
    if (!element || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      maybeScrollToBottom('auto');
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [contentRef, maybeScrollToBottom]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current || 0);
      window.clearTimeout(releaseTimerRef.current);
    };
  }, []);

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
