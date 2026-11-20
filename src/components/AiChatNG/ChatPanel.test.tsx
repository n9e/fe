/** @jest-environment jsdom */
let mockCanAccess = true;
jest.mock('@/components/AiChat/hooks/useFlashAiAccess', () => ({ useCanAccessFlashAiChat: () => mockCanAccess }));
beforeEach(() => {
  mockCanAccess = true;
});
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { ActionManifestEntry, PageContext } from '@flashcatcloud/ai-kit/actions';

import ChatPanel from './ChatPanel';
import { PAGE_RUNTIME } from './constants';
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
const manifest = jest.fn((_options?: { continuation?: boolean }): ActionManifestEntry[] => []);
const pageContext = jest.fn((): PageContext | null => null);
jest.mock('./uiActionRuntime', () => ({
  uiActionRuntime: {
    manifest: (options?: { continuation?: boolean }) => manifest(options),
    pageContext: () => pageContext(),
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
    { content_type: 'page_action', content: '', is_finish: true, param: { call_id: 'call-7', name: 'set_metric_query', args: { promql: 'up' } } },
  ],
};

const answered: IAiChatMessage = {
  chat_id: 'chat-1',
  seq_id: 3,
  is_finish: true,
  query: { content: '', page_from: { url: '/metric/explorer' } },
  response: [{ content_type: 'markdown', content: 'No host reported in the last hour.', is_finish: true }],
};

describe('ChatPanel 页面动作', () => {
  beforeEach(() => {
    execute.mockReset();
    execute.mockResolvedValue({ ok: true, status: 'ok', action: 'set_metric_query' });
    manifest.mockReset();
    manifest.mockReturnValue([{ name: 'set_metric_query', description: 'fill', inputSchema: { type: 'object', properties: {} } }]);
    pageContext.mockReset();
    pageContext.mockReturnValue(null);
    getMessageDetail.mockReset();
  });

  // A question that ends on `last`; the page result sent back gets the model's reply.
  function serveTurn(last: IAiChatMessage['response']) {
    const services = jest.requireMock('./services');
    services.createChat.mockResolvedValue({ chat_id: 'chat-1', title: '', last_update: 0 });
    services.sendMessage
      .mockReset()
      .mockImplementation(({ query }: { query: { page_result?: unknown } }) => Promise.resolve({ chat_id: 'chat-1', seq_id: query.page_result ? 3 : 2 }));
    getMessageDetail.mockImplementation((locator: { seq_id: number }) => Promise.resolve(locator.seq_id === 2 ? { ...pageActionDone, response: last } : answered));
    return services;
  }
  function ask(question: string) {
    const box = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(box, { target: { value: question } });
    fireEvent.keyDown(box, { key: 'Enter' });
  }

  it('runs the action once and hands its result back as the answer to that call', async () => {
    const services = serveTurn(pageActionDone.response);
    const onTurn = jest.fn();

    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} onTurn={onTurn} />);
    ask('每台主机的 CPU');

    // The question says the page can be operated; the model looks at it when it needs to.
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenNthCalledWith(1, expect.objectContaining({ query: expect.objectContaining({ page_runtime: PAGE_RUNTIME, page_actions: undefined }) })),
    );
    await waitFor(() => expect(execute).toHaveBeenCalledWith({ callId: 'call-7', name: 'set_metric_query', args: { promql: 'up' } }));
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          query: expect.objectContaining({
            content: '',
            page_runtime: PAGE_RUNTIME,
            page_result: { call_id: 'call-7', content: { ok: true, status: 'ok', action: 'set_metric_query' } },
          }),
        }),
      ),
    );
    await waitFor(() => expect(onTurn).toHaveBeenCalledWith(expect.objectContaining({ phase: 'done', message: answered, actionOutcome: expect.objectContaining({ ok: true }) })));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(onTurn.mock.calls.filter(([turn]) => turn.phase === 'done')).toHaveLength(1);
    // Only the user's question starts a turn; the result sent back stays inside it.
    expect(manifest.mock.calls.map(([options]) => options)).toEqual([{ continuation: false }, { continuation: true }]);
  });

  it('attaches what the page can do to every request of an entry opened to operate it', async () => {
    const services = serveTurn(pageActionDone.response);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} attachPageActions />);
    ask('每台主机的 CPU');

    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    for (const [request] of services.sendMessage.mock.calls) {
      expect(request.query.page_actions).toEqual([expect.objectContaining({ name: 'set_metric_query' })]);
    }
  });

  it('still hands the result back when the action took the page away with its actions', async () => {
    const services = serveTurn(pageActionDone.response);
    manifest.mockReturnValueOnce([{ name: 'set_metric_query', description: 'fill', inputSchema: { type: 'object', properties: {} } }]).mockReturnValue([]);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} />);
    ask('每台主机的 CPU');

    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    expect(services.sendMessage.mock.calls[1][0].query).toEqual(
      expect.objectContaining({ page_runtime: PAGE_RUNTIME, page_result: expect.objectContaining({ call_id: 'call-7' }) }),
    );
  });

  it('says nothing about the page when it has no actions', async () => {
    manifest.mockReturnValue([]);
    const services = serveTurn([{ content_type: 'markdown', content: 'hi', is_finish: true }]);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} attachPageActions />);
    ask('hello');

    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    expect(services.sendMessage.mock.calls[0][0].query).not.toHaveProperty('page_runtime');
  });

  it('ends the turn on an action the user declined instead of sending it back', async () => {
    const services = serveTurn(pageActionDone.response);
    execute.mockResolvedValue({ ok: false, status: 'declined', action: 'set_metric_query', message: 'changed' });
    const onTurn = jest.fn();
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} onTurn={onTurn} />);
    ask('每台主机的 CPU');

    await waitFor(() => expect(onTurn).toHaveBeenCalledWith(expect.objectContaining({ phase: 'done', actionOutcome: expect.objectContaining({ status: 'declined' }) })));
    expect(services.sendMessage).toHaveBeenCalledTimes(1);
  });

  it('answers a request to look at the page with what the page can do', async () => {
    pageContext.mockReturnValue({ title: 'Metric explorer' });
    const observation = { page: { title: 'Metric explorer' }, actions: [{ name: 'set_metric_query', description: 'fill', inputSchema: { type: 'object', properties: {} } }] };
    const services = serveTurn([{ content_type: 'page_observe', content: '', is_finish: true, param: { call_id: 'look-1' } }]);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} />);
    ask('改成按服务分组');

    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ query: expect.objectContaining({ page_result: { call_id: 'look-1', content: observation } }) }),
      ),
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('ends the turn once and cancels the accepted page result when following it fails', async () => {
    const services = serveTurn(pageActionDone.response);
    services.cancelMessage.mockReset().mockResolvedValue(undefined);
    getMessageDetail.mockImplementation((locator: { seq_id: number }) => (locator.seq_id === 2 ? Promise.resolve(pageActionDone) : Promise.reject(new Error('offline'))));
    const onTurn = jest.fn();
    const onError = jest.fn();
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} onTurn={onTurn} onError={onError} />);
    ask('每台主机的 CPU');

    await waitFor(() => expect(onTurn).toHaveBeenCalledWith(expect.objectContaining({ phase: 'done', reason: 'error' })));
    expect(onTurn.mock.calls.filter(([turn]) => turn.phase === 'done')).toHaveLength(1);
    expect(services.cancelMessage).toHaveBeenCalledWith({ chat_id: 'chat-1', seq_id: 3 });
    expect(onError).toHaveBeenCalled();
  });

  it('cancels a page result that is accepted after the user stopped', async () => {
    const services = serveTurn(pageActionDone.response);
    let accept!: (value: { chat_id: string; seq_id: number }) => void;
    services.sendMessage.mockImplementationOnce(() => Promise.resolve({ chat_id: 'chat-1', seq_id: 2 }));
    services.sendMessage.mockImplementationOnce(() => new Promise((resolve) => (accept = resolve)));
    services.cancelMessage.mockReset().mockResolvedValue(undefined);
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} />);
    ask('每台主机的 CPU');

    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', { name: 'input.stop' }));
    await act(async () => {
      accept({ chat_id: 'chat-1', seq_id: 3 });
    });
    expect(services.cancelMessage).toHaveBeenCalledWith({ chat_id: 'chat-1', seq_id: 3 });
    expect(getMessageDetail).not.toHaveBeenCalledWith({ chat_id: 'chat-1', seq_id: 3 });
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
    // A question ends on a page action; the page result sent back gets the model's reply.
    // Generated ids start high so they never meet the ids a test resolves by hand.
    let sequence = 10;
    const pageResults = new Set<number>();
    services.sendMessage.mockReset().mockImplementation(({ query }: { query: { page_result?: unknown } }) => {
      sequence += 1;
      if (query.page_result) pageResults.add(sequence);
      return Promise.resolve({ chat_id: 'chat-1', seq_id: sequence });
    });
    services.cancelMessage.mockReset();
    services.cancelMessage.mockResolvedValue(undefined);
    getMessageDetail.mockReset();
    getMessageDetail.mockImplementation((locator: { chat_id: string; seq_id: number }) =>
      Promise.resolve(pageResults.has(locator.seq_id) ? { ...answered, ...locator } : { ...pageActionDone, ...locator }),
    );
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
    jest.requireMock('./services').sendMessage.mockResolvedValueOnce({ chat_id: 'chat-1', seq_id: 2 });
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
    const { rerender } = render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} onBusyChange={onBusyChange} />);
    send();
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(box.value).toBe('');
    expect(box.placeholder).toBe('dock.placeholder_draft');
    fireEvent.change(box, { target: { value: 'Group by service instead' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    const draftHint = screen.getByText('dock.wait_to_send');
    expect(draftHint).toHaveClass('text-hint', 'opacity-70', 'ai-query-dock-draft-hint-bridge');
    expect(draftHint.previousElementSibling).toHaveClass('ai-query-dock-input');
    rerender(<ChatPanel variant='slim' collapsed queryPageFrom={{ url: '/metric/explorer' }} onBusyChange={onBusyChange} />);
    expect(draftHint).not.toHaveClass('ai-query-dock-draft-hint-bridge');
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
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalled());
    // The question goes out once; anything after it only carries page results back.
    expect(services.sendMessage.mock.calls.filter(([request]: [{ query: { page_result?: unknown } }]) => !request.query.page_result)).toHaveLength(1);
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

  it('offers the suggested follow-up in primary with a Tab key that fills it', () => {
    render(<ChatPanel variant='slim' queryPageFrom={{ url: '/metric/explorer' }} placeholder='Group by env instead' suggestion='Group by env instead' />);
    const box = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(box).toHaveClass('placeholder:text-primary');
    fireEvent.mouseDown(screen.getByRole('button', { name: /Tab/ }));
    expect(box.value).toBe('Group by env instead');
    expect(box).toHaveClass('placeholder:text-placeholder');
    expect(screen.queryByRole('button', { name: /Tab/ })).toBeNull();
  });
});

describe('ChatPanel initial skill reference', () => {
  const services = jest.requireMock('./services');
  beforeEach(() => {
    services.createChat.mockReset().mockResolvedValue({ chat_id: 'new-chat', title: '', last_update: 0 });
    services.getMessageHistory.mockReset().mockResolvedValue([]);
    let sequence = 0;
    services.sendMessage.mockReset().mockImplementation(() => Promise.resolve({ chat_id: 'new-chat', seq_id: ++sequence }));
    getMessageDetail.mockReset().mockImplementation((locator) => Promise.resolve({ ...inProgress, ...locator, is_finish: true, response: [] }));
    manifest.mockReturnValue([]);
  });

  const send = async (content: string, count: number) => {
    const box = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(box, { target: { value: content } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(count));
    await waitFor(() => expect(screen.queryByLabelText('input.stop')).toBeNull());
  };

  it('references the skill on the first message and not on follow-ups', async () => {
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} initialSkill='explorer-query' />);
    await send('show memory usage', 1);
    expect(services.sendMessage.mock.calls[0][0].query).toMatchObject({
      content: '<@explorer-query> show memory usage',
      references: [{ id: 'explorer-query', name: 'explorer-query', type: 'skill', skill: { name: 'explorer-query' } }],
    });
    await send('group by host', 2);
    expect(services.sendMessage.mock.calls[1][0].query.content).toBe('group by host');
    expect(services.sendMessage.mock.calls[1][0].query.references).toBeUndefined();
  });

  it('sends each host continuation once after the current turn is idle', async () => {
    const { rerender } = render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} continuationMessage={{ id: 1, content: 'repair the failed pattern' }} />);

    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByLabelText('input.stop')).toBeNull());
    expect(services.sendMessage.mock.calls[0][0].query.content).toBe('repair the failed pattern');

    rerender(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} continuationMessage={{ id: 1, content: 'repair the failed pattern' }} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(services.sendMessage).toHaveBeenCalledTimes(1);

    rerender(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} continuationMessage={{ id: 2, content: 'ask me for the missing field' }} />);
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    expect(services.sendMessage.mock.calls[1][0].query.content).toBe('ask me for the missing field');
  });

  it('keeps the first-message reference when sending fails and is retried', async () => {
    services.sendMessage.mockRejectedValueOnce(new Error('unavailable'));
    const onError = jest.fn();
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} initialSkill='explorer-query' onError={onError} />);
    await send('show memory usage', 1);
    await waitFor(() => expect(onError).toHaveBeenCalled());
    await send('show memory usage', 2);
    expect(services.sendMessage.mock.calls[1][0].query.references).toHaveLength(1);
  });

  it('remembers acceptance when a stopped send resolves after the dock closes', async () => {
    let accept: (value: { chat_id: string; seq_id: number }) => void = () => {};
    services.sendMessage.mockReturnValueOnce(
      new Promise((resolve) => {
        accept = resolve;
      }),
    );
    services.cancelMessage.mockResolvedValue(undefined);
    const { rerender } = render(<ChatPanel variant='slim' active queryPageFrom={{ url: '/metric/explorer' }} initialSkill='explorer-query' />);
    const box = screen.getByPlaceholderText('input.placeholder');
    fireEvent.change(box, { target: { value: 'show memory usage' } });
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    rerender(<ChatPanel variant='slim' active={false} queryPageFrom={{ url: '/metric/explorer' }} initialSkill='explorer-query' />);
    await act(async () => {
      accept({ chat_id: 'new-chat', seq_id: 1 });
    });
    rerender(<ChatPanel variant='slim' active queryPageFrom={{ url: '/metric/explorer' }} initialSkill='explorer-query' />);
    await send('group by host', 2);
    expect(services.sendMessage.mock.calls[1][0].query.references).toBeUndefined();
  });

  it('does not inject a skill into ordinary chat', async () => {
    render(<ChatPanel queryPageFrom={{ url: '/metric/explorer' }} />);
    await send('show memory usage', 1);
    expect(services.sendMessage.mock.calls[0][0].query.content).toBe('show memory usage');
    expect(services.sendMessage.mock.calls[0][0].query.references).toBeUndefined();
  });
});

it('does not mount a chat or fetch history without FlashAI access', () => {
  mockCanAccess = false;
  const services = jest.requireMock('./services');
  services.getMessageHistory.mockClear();
  services.createChat.mockClear();
  render(<ChatPanel chatId='chat-1' initialMessage='do not send' queryPageFrom={{ url: '/metric/explorer' }} />);
  expect(screen.queryByPlaceholderText('input.placeholder')).toBeNull();
  expect(services.getMessageHistory).not.toHaveBeenCalled();
  expect(services.createChat).not.toHaveBeenCalled();
});

describe('仪表盘按钮启动', () => {
  it('prefills each launch and replaces the previous draft without sending', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    const { rerender } = render(<ChatPanel queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 1, content: 'first', autoExecute: false }} />);
    expect(screen.getByRole('textbox')).toHaveValue('first');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'draft' } });
    rerender(<ChatPanel queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 2, content: 'second', autoExecute: false }} />);
    expect(screen.getByRole('textbox')).toHaveValue('second');
    expect(services.sendMessage).not.toHaveBeenCalled();
  });

  it('does not send an empty launch', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    render(<ChatPanel queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 1, content: '', autoExecute: true }} />);
    expect(services.sendMessage).not.toHaveBeenCalled();
  });

  it('sends an automatic launch to the existing chat', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockClear();
    services.sendMessage.mockResolvedValue({ chat_id: 'chat-existing', seq_id: 10 });
    render(<ChatPanel chatId='chat-existing' queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 1, content: 'check cpu', autoExecute: true }} />);
    await waitFor(() =>
      expect(services.sendMessage).toHaveBeenCalledWith(expect.objectContaining({ chat_id: 'chat-existing', query: expect.objectContaining({ content: 'check cpu' }) })),
    );
  });

  it('queues repeated automatic launches for the same conversation', async () => {
    const services = jest.requireMock('./services');
    services.sendMessage.mockReset();
    let seq = 0;
    services.sendMessage.mockImplementation(() => Promise.resolve({ chat_id: 'chat-existing', seq_id: ++seq }));
    services.getMessageHistory.mockResolvedValue([]);
    getMessageDetail.mockImplementation((locator) => Promise.resolve({ ...inProgress, ...locator, is_finish: true, response: [] }));
    const { rerender } = render(<ChatPanel chatId='chat-existing' queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 1, content: 'first', autoExecute: true }} />);
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(1));
    rerender(<ChatPanel chatId='chat-existing' queryPageFrom={{ url: '/dashboards' }} buttonLaunch={{ id: 2, content: 'second', autoExecute: true }} />);
    await waitFor(() => expect(services.sendMessage).toHaveBeenCalledTimes(2));
    expect(services.sendMessage.mock.calls.map(([request]: any[]) => request.query.content)).toEqual(['first', 'second']);
  });
});
