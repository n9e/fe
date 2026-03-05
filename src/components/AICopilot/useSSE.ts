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
      const response = await fetch('/api/n9e/query-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        callbacks.onError(text || `HTTP ${response.status}`);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        callbacks.onError('No response body');
        setIsStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
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
          } catch {
            // Skip malformed JSON
          }
        }
      }

      setIsStreaming(false);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        callbacks.onError(err.message || 'Network error');
      }
      setIsStreaming(false);
    }
  }, [cancel]);

  return { sendMessage, cancel, isStreaming };
}
