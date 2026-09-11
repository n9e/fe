/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ChatPanel from './ChatPanel';
import { IAiChatMessage, IAiChatStreamChunk } from './types';

const startStream = jest.fn();
const stopStream = jest.fn();
const maybeScrollToBottom = jest.fn();
const scrollToBottom = jest.fn();
let streamCallbacks: { onChunk?: (chunk: IAiChatStreamChunk) => void; onFinish?: () => void; onClose?: () => void } = {};

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
    manifest.mockReturnValue([{ name: 'set_metric_query', description: 'fill', inputSchema: {} }]);
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
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ manifest: [{ name: 'set_metric_query', description: 'fill', inputSchema: {} }] })),
    );
    await waitFor(() => expect(execute).toHaveBeenCalledWith({ callId: 'call-7', name: 'set_metric_query', args: { promql: 'up' } }));
    expect(execute).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(onTurn).toHaveBeenCalledWith(expect.objectContaining({ phase: 'done' })));
    expect(onTurn.mock.calls[0][0].phase).toBe('running');
  });

  it('keeps the conversation running when the caller hands it an equal but new page-info object', async () => {
    const services = jest.requireMock('./services');
    services.getMessageHistory.mockClear();
    getMessageDetail.mockResolvedValue(inProgress);
    const { rerender } = render(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/metric/explorer' }} />);
    await waitFor(() => expect(startStream).toHaveBeenCalledWith('stream-1'));
    const historyLoads = services.getMessageHistory.mock.calls.length;
    stopStream.mockClear();

    // A parent re-rendering with a fresh object is routine; it is not a new conversation.
    rerender(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/metric/explorer' }} />);
    rerender(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/metric/explorer' }} />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(services.getMessageHistory.mock.calls.length).toBe(historyLoads);
    expect(stopStream).not.toHaveBeenCalled();
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

  it('resumes polling when the stream ends before the turn finishes', async () => {
    render(<ChatPanel chatId='chat-1' queryPageFrom={{ url: '/alert-rules' }} />);
    await waitFor(() => expect(startStream).toHaveBeenCalledWith('stream-1'));
    const polledBefore = getMessageDetail.mock.calls.length;
    jest.useFakeTimers();

    act(() => {
      streamCallbacks.onClose?.();
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    expect(getMessageDetail.mock.calls.length).toBeGreaterThan(polledBefore);
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

describe('ChatPanel turn cancellation and completion', () => {
  function pending<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => {
      resolve = done;
    });
    return { promise, resolve };
  }
  beforeEach(() => {
    const services = jest.requireMock('./services');
    services.createChat.mockResolvedValue({ chat_id: 'chat-1', title: '', last_update: 0 });
    services.sendMessage.mockResolvedValue({ chat_id: 'chat-1', seq_id: 2 });
    services.cancelMessage.mockReset();
    services.cancelMessage.mockResolvedValue(undefined);
    getMessageDetail.mockReset();
    getMessageDetail.mockResolvedValue(pageActionDone);
    execute.mockReset();
    execute.mockResolvedValue({ ok: true, status: 'ok', action: 'set_metric_query' });
    streamCallbacks = {};
  });
  function send() {
    const box = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(box, { target: { value: 'CPU per host' } });
    fireEvent.keyDown(box, { key: 'Enter' });
  }
  it('captures the page before chat creation and cancels a send that returns after close', async () => {
    const services = jest.requireMock('./services');
    const sent = pending<{ chat_id: string; seq_id: number }>();
    services.sendMessage.mockReturnValueOnce(sent.promise);
    const scope = { executePageAction: jest.fn(), cancel: jest.fn() };
    const prepareTurn = jest.fn(() => scope);
    const { rerender } = render(<ChatPanel active queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={prepareTurn} />);
    send();
    expect(prepareTurn).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalled());
    rerender(<ChatPanel active={false} queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={prepareTurn} />);
    expect(scope.cancel).toHaveBeenCalled();
    await act(async () => {
      sent.resolve({ chat_id: 'chat-1', seq_id: 2 });
    });
    expect(scope.executePageAction).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
    expect(services.cancelMessage).toHaveBeenCalledWith({ chat_id: 'chat-1', seq_id: 2 });
  });
  it('keeps stop available until the page action has completed', async () => {
    const action = pending<any>();
    const onTurn = jest.fn();
    const scope = { executePageAction: jest.fn(() => action.promise), cancel: jest.fn() };
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={() => scope} onTurn={onTurn} />);
    send();
    await waitFor(() => expect(scope.executePageAction).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'input.stop' })).toBeTruthy();
    expect(onTurn.mock.calls.some(([turn]) => turn.phase === 'done')).toBe(false);
    await act(async () => {
      action.resolve({ ok: true, status: 'ok', action: 'set_metric_query', result: { empty: false } });
    });
    expect(onTurn.mock.calls.filter(([turn]) => turn.phase === 'done')).toHaveLength(1);
  });
  it('stops immediately and ignores late completion from the stopped action', async () => {
    const action = pending<any>();
    const onTurn = jest.fn();
    const scope = { executePageAction: jest.fn(() => action.promise), cancel: jest.fn() };
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={() => scope} onTurn={onTurn} />);
    send();
    await waitFor(() => expect(scope.executePageAction).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'input.stop' }));
    expect(scope.cancel).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'input.send' })).toBeTruthy();
    await act(async () => {
      action.resolve({ ok: true, status: 'ok', action: 'set_metric_query' });
    });
    expect(onTurn.mock.calls.filter(([turn]) => turn.phase === 'done').every(([turn]) => turn.reason === 'stopped')).toBe(true);
  });
  it('waits once for concurrent polling and stream completion of the same action', async () => {
    const action = pending<any>();
    const first = pending<IAiChatMessage>();
    const second = pending<IAiChatMessage>();
    const scope = { executePageAction: jest.fn(() => action.promise), cancel: jest.fn() };
    const onTurn = jest.fn();
    getMessageDetail.mockResolvedValueOnce({ ...pageActionDone, is_finish: false, response: [{ content_type: 'markdown', content: '', stream_id: 'stream-2' }] });
    getMessageDetail.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={() => scope} onTurn={onTurn} />);
    send();
    await waitFor(() => expect(startStream).toHaveBeenCalledWith('stream-2'));
    await act(async () => {
      streamCallbacks.onFinish?.();
      streamCallbacks.onFinish?.();
    });
    await act(async () => {
      first.resolve(pageActionDone);
      second.resolve(pageActionDone);
    });
    expect(scope.executePageAction).toHaveBeenCalledTimes(1);
    expect(onTurn.mock.calls.some(([turn]) => turn.phase === 'done')).toBe(false);
    await act(async () => {
      action.resolve({ ok: true, status: 'ok', action: 'set_metric_query' });
    });
    expect(onTurn.mock.calls.filter(([turn]) => turn.phase === 'done')).toHaveLength(1);
  });
  it('preserves a draft typed during send and explains Enter while busy', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    const sent = pending<{ chat_id: string; seq_id: number }>();
    services.sendMessage.mockReturnValueOnce(sent.promise);
    const onBusyChange = jest.fn();
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} onBusyChange={onBusyChange} />);
    send();
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(box.value).toBe('');
    expect(box.placeholder).toBe('dock.placeholder_draft');
    fireEvent.change(box, { target: { value: 'Group by service instead' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(screen.getByText('dock.wait_to_send')).toBeTruthy();
    expect(services.sendMessage).toHaveBeenCalledTimes(1);
    await act(async () => {
      sent.resolve({ chat_id: 'chat-1', seq_id: 2 });
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'input.send' })).toBeTruthy());
    expect(box.value).toBe('Group by service instead');
    expect(onBusyChange.mock.calls.some(([busy]) => busy)).toBe(true);
    expect(onBusyChange.mock.calls.at(-1)).toEqual([false]);
  });
  it('keeps a replacement turn cancellable when a stopped send returns late', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    const oldSend = pending<{ chat_id: string; seq_id: number }>();
    const newSend = pending<{ chat_id: string; seq_id: number }>();
    services.sendMessage.mockReturnValueOnce(oldSend.promise).mockReturnValueOnce(newSend.promise);
    const firstScope = { executePageAction: jest.fn(), cancel: jest.fn() };
    const nextScope = { executePageAction: jest.fn(), cancel: jest.fn() };
    const prepareTurn = jest.fn().mockReturnValueOnce(firstScope).mockReturnValueOnce(nextScope);
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} prepareTurn={prepareTurn} />);
    send();
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(box, { target: { value: 'Use memory instead' } });
    fireEvent.click(screen.getByRole('button', { name: 'input.stop' }));
    expect(box.value).toBe('Use memory instead');
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    await act(async () => {
      oldSend.resolve({ chat_id: 'chat-1', seq_id: 2 });
    });
    expect(nextScope.cancel).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'input.stop' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'input.stop' }));
    expect(nextScope.cancel).toHaveBeenCalledTimes(1);
    await act(async () => {
      newSend.resolve({ chat_id: 'chat-1', seq_id: 3 });
    });
    expect(nextScope.executePageAction).not.toHaveBeenCalled();
  });
  it('sends the full question when a suggestion is clicked', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} promptList={[{ label: 'Host CPU', value: 'Generate a query for host CPU usage' }]} />);
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Host CPU' }));
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ query: expect.objectContaining({ content: 'Generate a query for host CPU usage' }) })),
    );
  });

  it('lets the keyboard pick a suggestion: arrows move, Tab fills, Enter sends', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    const promptList = [
      { label: 'Host CPU', value: 'Generate a query for host CPU usage' },
      { label: 'Host memory', value: 'Generate a query for host memory usage' },
    ];
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} promptList={promptList} />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(screen.getByRole('option', { name: 'Host CPU' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(screen.getByRole('option', { name: 'Host memory' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(box, { key: 'Tab' });
    expect(box.value).toBe('Generate a query for host memory usage');
    // Typing hides the list; clearing brings it back and Enter sends the highlighted one.
    expect(screen.queryByRole('listbox')).toBeNull();
    fireEvent.change(box, { target: { value: '' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ query: expect.objectContaining({ content: 'Generate a query for host memory usage' }) })),
    );
  });

  it('shows the question at once, while the chat is still being created', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    const creating = pending<{ chat_id: string; title: string; last_update: number }>();
    services.createChat.mockReturnValueOnce(creating.promise);
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} promptList={[{ label: 'Host CPU', value: 'Generate a query for host CPU usage' }]} />);
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Host CPU' }));
    // MessageBlocks is stubbed here; the message element standing in for the bubble is what matters.
    expect(screen.getByTestId('message')).toBeTruthy();
    expect(screen.queryByRole('listbox')).toBeNull();
    await act(async () => {
      creating.resolve({ chat_id: 'chat-1', title: '', last_update: 0 });
    });
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
  });

  it('reads the page info at send time when given a reader', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    let promql = 'up';
    render(<ChatPanel variant='slim' queryPageFrom={() => ({ url: '/metric/explorer', param: { promql } })} />);
    promql = 'rate(up[1m])';
    send();
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ page_from: { url: '/metric/explorer', param: { promql: 'rate(up[1m])' } } }) }),
      ),
    );
  });

  it('focuses the composer as soon as the dock is active', () => {
    render(<ChatPanel variant='slim' active queryPageFrom={{ url: '/metric/explorer' }} />);
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it("fills the host's suggested follow-up on Tab when the composer is empty", () => {
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} placeholder='Group by env instead' suggestion='Group by env instead' />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.keyDown(box, { key: 'Tab' });
    expect(box.value).toBe('Group by env instead');
  });
});
