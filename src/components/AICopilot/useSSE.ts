import { useRef, useState, useCallback } from 'react';
import type { QueryGeneratorRequest, StreamChunk, DoneResponse } from './types';

interface SSECallbacks {
  onThinking: (delta: string) => void;
  onToolCall: (name: string, input?: string) => void;
  onToolResult: (content: string) => void;
  onText: (delta: string) => void;
  onDone: (response: DoneResponse) => void;
  onError: (error: string) => void;
}

export default function useSSE() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async (params: QueryGeneratorRequest, callbacks: SSECallbacks) => {
    cancel();

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);

    try {
      console.log('[useSSE] Sending request to /api/n9e/query-generator', { params });
      const fetchStart = performance.now();

      const response = await fetch('/api/n9e/query-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      console.log('[useSSE] Response received', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        elapsed: `${(performance.now() - fetchStart).toFixed(0)}ms`,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[useSSE] HTTP error', { status: response.status, body: text });
        callbacks.onError(text || `HTTP ${response.status}`);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error('[useSSE] No response body (reader is null)');
        callbacks.onError('No response body');
        setIsStreaming(false);
        return;
      }

      console.log('[useSSE] SSE stream started, reading chunks...');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const rawText = decoder.decode(value, { stream: true });
        console.log('[useSSE] Chunk received', { length: rawText.length, raw: rawText.slice(0, 500) });
        buffer += rawText;
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventText of events) {
          if (!eventText.trim()) continue;

          const lines = eventText.split('\n');
          let eventType = '';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              data = line.slice(6);
            }
          }

          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            console.log('[useSSE] Event parsed', { eventType, type: parsed.type, contentLength: (parsed.content || parsed.delta || '').length });

            if (eventType === 'done' || parsed.type === 'done') {
              callbacks.onDone(parsed as DoneResponse);
              setIsStreaming(false);
              return;
            }

            if (eventType === 'error' || parsed.type === 'error') {
              callbacks.onError(parsed.content || parsed.error || 'Unknown error');
              setIsStreaming(false);
              return;
            }

            const chunk = parsed as StreamChunk;
            switch (chunk.type) {
              case 'thinking':
                callbacks.onThinking(chunk.delta || chunk.content || '');
                break;
              case 'tool_call':
                callbacks.onToolCall(chunk.metadata?.name || '', chunk.metadata?.input);
                break;
              case 'tool_result':
                callbacks.onToolResult(chunk.content || '');
                break;
              case 'text':
                callbacks.onText(chunk.delta || chunk.content || '');
                break;
            }
          } catch (parseErr) {
            console.warn('[useSSE] Malformed JSON in SSE event', { eventType, data, error: parseErr });
          }
        }
      }

      console.log('[useSSE] Stream ended normally');
      setIsStreaming(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('[useSSE] Network/fetch error', { name: err.name, message: err.message, stack: err.stack });
        callbacks.onError(err.message || 'Network error');
      } else {
        console.log('[useSSE] Request aborted by user');
      }
      setIsStreaming(false);
    }
  }, [cancel]);

  return { sendMessage, cancel, isStreaming };
}
