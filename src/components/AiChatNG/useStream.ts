import { useCallback, useEffect, useRef, useState } from 'react';
import i18next from 'i18next';
import { basePrefix } from '@/App';
import { AccessTokenKey, IS_ENT } from '@/utils/constant';
import { IAiChatStreamChunk } from './types';
import { parseStreamEntry } from './utils';

interface IUseAiChatStreamOptions {
  onChunk?: (chunk: IAiChatStreamChunk) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  /** The connection ended before the finish frame: a proxy's idle limit, a dropped network. The turn may still be running. */
  onClose?: () => void;
}

export function useAiChatStream(options: IUseAiChatStreamOptions = {}) {
  const { onChunk, onFinish, onError, onClose } = options;
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
        // The enterprise build talks to fc-model directly, the same host the
        // chat's other calls use; the open-source build streams through n9e.
        const response = await fetch(`${basePrefix}${IS_ENT ? '/api/fc-model/stream' : '/api/n9e/stream'}`, {
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
        let finished = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';

          chunks.forEach((entry) => {
            try {
              const parsed = parseStreamEntry(entry);
              const { chunk } = parsed;
              if (chunk) onChunk?.(chunk);
              if (parsed.finished || chunk?.done || chunk?.type === 'done') {
                finished = true;
                onFinish?.();
                stop();
              }
            } catch (error) {
              onError?.(error instanceof Error ? error : new Error('stream parse failed'));
            }
          });
        }
        if (!finished) {
          stop();
          onClose?.();
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
    [onChunk, onClose, onError, onFinish, stop],
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
