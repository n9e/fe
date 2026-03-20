import { useRef, useCallback } from 'react';

/**
 * Hook to consume an SSE stream from /api/n9e/stream.
 * The stream sends events in the format:
 *   data: {"v":"chunk text","p":"content"}  (or p:"reason")
 *   event: finish
 *   data:
 */
export default function useStream() {
  const abortRef = useRef<AbortController | null>(null);

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const startStream = useCallback(
    (streamId: string, onContent: (delta: string) => void, onReason?: (delta: string) => void, onFinish?: () => void) => {
      cancelStream();

      const controller = new AbortController();
      abortRef.current = controller;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      };

      fetch('/api/n9e/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({ stream_id: streamId }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok || !response.body) {
            onFinish?.();
            return;
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n');
            buffer = parts.pop() || '';

            for (const line of parts) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              // Handle "event: finish"
              if (trimmed === 'event: finish') {
                onFinish?.();
                cancelStream();
                return;
              }

              // Handle "data: {...}"
              if (trimmed.startsWith('data:')) {
                const dataStr = trimmed.slice(5).trim();
                if (!dataStr) continue;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.v) {
                    if (parsed.p === 'reason') {
                      onReason?.(parsed.v);
                    } else {
                      onContent(parsed.v);
                    }
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }

          onFinish?.();
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('[useStream] error:', err);
          }
          onFinish?.();
        });
    },
    [cancelStream],
  );

  return { startStream, cancelStream };
}
