/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

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

const execute = jest.fn();
const manifest = jest.fn(() => [] as unknown[]);
jest.mock('./uiActionRuntime', () => ({
  uiActionRuntime: {
    manifest: () => manifest(),
    execute: (...args: unknown[]) => execute(...args),
    has: () => true,
  },
}));

const pageActionDone: IAiChatMessage = {
  chat_id: 'chat-1',
  seq_id: 2,
  is_finish: true,
  query: { content: '每台主机的 CPU', page_from: { url: '/metric/explorer' } },
  response: [
    { content_type: 'markdown', content: '找到了', is_finish: true },
    { content_type: 'page_action', content: 'fill', is_finish: true, param: { call_id: 'call-7', name: 'set_metric_query', description: 'fill', args: { promql: 'up' } } },
  ],
};

describe('ChatPanel 页面动作', () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({ ok: true, status: 'ok', action: 'set_metric_query' });
    manifest.mockReset();
    manifest.mockReturnValue([{ name: 'set_metric_query', description: 'fill', schema: {} }]);
    getMessageDetail.mockReset();
  });

  it('runs the action the model asked for, once, on the turn this panel sent', async () => {
    const services = jest.requireMock('./services');
    services.createChat.mockResolvedValue({ chat_id: 'chat-1', title: '', last_update: 0 });
    services.sendMessage.mockResolvedValue({ chat_id: 'chat-1', seq_id: 2 });
    getMessageDetail.mockResolvedValue(pageActionDone);
    const onTurn = jest.fn();

    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} onTurn={onTurn} />);
    const box = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(box, { target: { value: '每台主机的 CPU' } });
    fireEvent.keyDown(box, { key: 'Enter' });

    // The page's actions ride along with the message.
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ manifest: [{ name: 'set_metric_query', description: 'fill', schema: {} }] })));
    await waitFor(() => expect(execute).toHaveBeenCalledWith({ callId: 'call-7', name: 'set_metric_query', args: { promql: 'up' } }));
    expect(execute).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onTurn).toHaveBeenCalledWith(expect.objectContaining({ phase: 'done' })));
    expect(onTurn.mock.calls[0][0].phase).toBe('running');
  });

  it('never replays an action from a message it only loaded', async () => {
    const services = jest.requireMock('./services');
    services.getMessageHistory.mockResolvedValueOnce([pageActionDone]);

    render(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/metric/explorer' }} />);
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent('找到了'));

    expect(execute).not.toHaveBeenCalled();
  });
});

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
