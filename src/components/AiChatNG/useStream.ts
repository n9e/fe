import { useCallback, useEffect, useRef, useState } from 'react';
import i18next from 'i18next';
import { basePrefix } from '@/App';
import { AccessTokenKey } from '@/utils/constant';
import { IAiChatStreamChunk } from './types';
import { normalizeStreamChunk } from './utils';

interface IUseAiChatStreamOptions {
  onChunk?: (chunk: IAiChatStreamChunk) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

export function useAiChatStream(options: IUseAiChatStreamOptions = {}) {
  const { onChunk, onFinish, onError } = options;
  const abortControllerRef = useRef<AbortController | null>(null);
  const [streaming, setStreaming] = useState(false);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStreaming(false);
  }, []);

  const start = useCallback(
    async (streamId: string) => {
      if (!streamId) return;
      stop();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setStreaming(true);

      try {
        const response = await fetch(`${basePrefix}/api/n9e/stream`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            Authorization: `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`,
            'X-Language': i18next.language,
          },
          body: JSON.stringify({ stream_id: streamId }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`stream request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';

          chunks.forEach((entry) => {
            const lines = entry
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean);
            if (!lines.length) return;

            const eventLine = lines.find((line) => line.startsWith('event:'));
            if (eventLine?.slice(6).trim() === 'finish') {
              onFinish?.();
              stop();
              return;
            }

            const dataLine = lines.find((line) => line.startsWith('data:'));
            if (!dataLine) return;

            const payload = dataLine.slice(5).trim();
            if (!payload) return;

            try {
              const parsed = normalizeStreamChunk(JSON.parse(payload) as IAiChatStreamChunk);
              onChunk?.(parsed);
              if (parsed.done || parsed.type === 'done') {
                onFinish?.();
                stop();
              }
            } catch (error) {
              onError?.(error instanceof Error ? error : new Error('stream parse failed'));
            }
          });
        }
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
        const nextError = error instanceof Error ? error : new Error('stream error');
        onError?.(nextError);
        stop();
      }
    },
    [onChunk, onError, onFinish, stop],
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    streaming,
    start,
    stop,
  };
}
