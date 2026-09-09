/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

import ChatPanel from './ChatPanel';
import { IAiChatMessage, IAiChatStreamChunk } from './types';

const startStream = jest.fn();
const stopStream = jest.fn();
const maybeScrollToBottom = jest.fn();
const scrollToBottom = jest.fn();
let streamCallbacks: { onChunk?: (chunk: IAiChatStreamChunk) => void; onFinish?: () => void } = {};

const inProgress: IAiChatMessage = {
  chat_id: 'chat-1',
  seq_id: 1,
  is_finish: false,
  query: { content: '问题', page_from: { url: '/alert-rules' } },
  response: [{ content_type: 'markdown', content: '', stream_id: 'stream-1', is_finish: false }],
};

const getMessageDetail = jest.fn();

jest.mock('./services', () => ({
  createChat: jest.fn(),
  getMessageHistory: jest.fn(() => Promise.resolve([inProgress])),
  getMessageDetail: (...args: unknown[]) => getMessageDetail(...args),
  sendMessage: jest.fn(),
  cancelMessage: jest.fn(),
}));

jest.mock('./useStream', () => ({
  useAiChatStream: (options: typeof streamCallbacks) => {
    streamCallbacks = options;
    return { start: startStream, stop: stopStream };
  },
}));

jest.mock('@/components/IconFont', () => () => null);
jest.mock('./context', () => ({
  useAiChatContext: () => ({ shareReadonly: false }),
}));

jest.mock('./utils', () => {
  const actual = jest.requireActual('./utils');
  return {
    ...actual,
    useAutoScroll: () => ({ maybeScrollToBottom, scrollToBottom }),
  };
});

jest.mock('./MessageBlocks', () => ({
  EmptyConversation: () => <div>empty</div>,
  MessageItem: ({ message, isStreaming }: { message: IAiChatMessage; isStreaming: boolean }) => (
    <output data-testid='message' data-streaming={String(isStreaming)}>
      {message.response?.map((response) => response.content).join('')}
    </output>
  ),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ChatPanel 流式刷新（jsdom 集成）', () => {
  beforeEach(() => {
    startStream.mockClear();
    stopStream.mockClear();
    getMessageDetail.mockReset();
    getMessageDetail.mockResolvedValue(inProgress);
    streamCallbacks = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('把高频 chunk 合并为最多每 50ms 一次的 React state 刷新，并在结束时立即 flush', async () => {
    render(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/alert-rules' }} />);

    await waitFor(() => expect(startStream).toHaveBeenCalledWith('stream-1'));
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent(''));
    jest.useFakeTimers();

    act(() => {
      streamCallbacks.onChunk?.({ type: 'text', delta: '第一段' });
      streamCallbacks.onChunk?.({ type: 'text', delta: '第二段' });
      jest.advanceTimersByTime(49);
    });
    expect(screen.getByTestId('message')).toHaveTextContent('');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByTestId('message')).toHaveTextContent('第一段第二段');

    await act(async () => {
      streamCallbacks.onChunk?.({ type: 'text', delta: '末尾' });
      streamCallbacks.onFinish?.();
      await Promise.resolve();
    });
    expect(screen.getByTestId('message')).toHaveTextContent('第一段第二段末尾');
  });
});
