/** @jest-environment jsdom */
// The hook polls on a 1.2s beat, so every wait here has to outlast one tick —
// the library's 1s default would expire before the first poll lands.
import { act, renderHook, waitFor } from '@testing-library/react';

import { IAiChatMessage } from '@/components/AiChatNG/types';

import { useAiQueryRun } from './useAiQueryRun';

const createChat = jest.fn();
const sendMessage = jest.fn();
const getMessageDetail = jest.fn();
const cancelMessage = jest.fn();

jest.mock('@/components/AiChatNG/services', () => ({
  createChat: (...args: unknown[]) => createChat(...args),
  sendMessage: (...args: unknown[]) => sendMessage(...args),
  getMessageDetail: (...args: unknown[]) => getMessageDetail(...args),
  cancelMessage: (...args: unknown[]) => cancelMessage(...args),
}));

// Echo the count back so the tests can see it reached the copy.
const t = ((key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`)) as never;
const pageFrom = { url: '/metric/explorer', param: { datasource_id: 849 } } as const;

function message(overrides: Partial<IAiChatMessage> = {}): IAiChatMessage {
  return { chat_id: 'c1', seq_id: 1, query: {} as never, is_finish: true, ...overrides };
}

function setup() {
  createChat.mockResolvedValue({ chat_id: 'c1' });
  sendMessage.mockResolvedValue({ chat_id: 'c1', seq_id: 1 });
  cancelMessage.mockResolvedValue(undefined);
  return renderHook(() => useAiQueryRun({ pageFrom, t }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAiQueryRun', () => {
  it('surfaces the delivered value and what was said about it', async () => {
    getMessageDetail.mockResolvedValue(
      message({
        response: [
          { content_type: 'tool_group', content: '', is_finish: true, param: { command_count: 1, read_file_count: 0, edit_file_count: 0, items: [] } },
          { content_type: 'query', content: '  cpu_usage_active{cpu="cpu-total"}  ' },
          { content_type: 'markdown', content: '按 ident 区分主机。' },
        ],
      }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    // Trimmed: this string goes straight into the field.
    expect(result.current.run.value).toBe('cpu_usage_active{cpu="cpu-total"}');
    expect(result.current.run.explanation).toBe('按 ident 区分主机。');
    expect(result.current.run.steps).toHaveLength(1);
  });

  it('reads a run of tool calls off the group the backend already merged', async () => {
    // message/detail never returns bare `tool` segments: the server folds each
    // run of them into one `tool_group` carrying the counts.
    getMessageDetail.mockResolvedValue(
      message({
        response: [
          {
            content_type: 'tool_group',
            content: '',
            is_finish: true,
            param: { command_count: 3, read_file_count: 1, edit_file_count: 0, items: [] },
          },
        ],
      }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    expect(result.current.run.steps).toEqual([{ label: 'panel.step.command:3panel.step.separatorpanel.step.read_file:1' }]);
  });

  it('skips a group that counted nothing rather than showing an empty step', async () => {
    getMessageDetail.mockResolvedValue(
      message({
        response: [{ content_type: 'tool_group', content: '', is_finish: true, param: { command_count: 0, read_file_count: 0, edit_file_count: 0, items: [] } }],
      }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    expect(result.current.run.steps).toEqual([]);
  });

  it('finishes without a value when the assistant delivered none', async () => {
    // The honest failure: it looked, found nothing usable, and said so. No
    // value means the panel must not write anything into the field.
    getMessageDetail.mockResolvedValue(
      message({ response: [{ content_type: 'markdown', content: '该数据源没有 CPU 相关指标。' }] }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    expect(result.current.run.value).toBeUndefined();
    expect(result.current.run.explanation).toContain('没有 CPU 相关指标');
  });

  it('carries back a question the assistant ended its turn on', async () => {
    // Real turns do this when the page context is ambiguous. It finishes clean
    // — no error, no value — so only the question distinguishes it from a miss.
    getMessageDetail.mockResolvedValue(
      message({
        response: [
          { content_type: 'markdown', content: '这个数据源 ID 查不到。' },
          { content_type: 'input_request', content: '', is_finish: true, param: { question: '  要用哪个数据源？  ', mode: 'single' } },
        ],
      }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    expect(result.current.run.question).toBe('要用哪个数据源？');
    expect(result.current.run.value).toBeUndefined();
  });

  it('reports a backend error as a failure, keeping what it managed to say', async () => {
    getMessageDetail.mockResolvedValue(
      message({ err_code: 500, err_msg: 'model unavailable', response: [{ content_type: 'markdown', content: '正在检查指标' }] }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('failed'), { timeout: 5000 });

    expect(result.current.run.error).toBe('model unavailable');
    expect(result.current.run.explanation).toBe('正在检查指标');
  });

  it('carries the assistant own words about what it is doing right now', async () => {
    // cur_step is the one sentence worth reading while a turn is in flight, so
    // it is kept apart from the tallies rather than tacked on as another row.
    getMessageDetail.mockResolvedValue(message({ is_finish: false, cur_step: '正在执行脚本', response: [] }));
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.activity).toBe('正在执行脚本'), { timeout: 5000 });

    expect(result.current.run.steps).toHaveLength(0);
    expect(result.current.run.phase).toBe('running');
  });

  it('stops a run that is still going, and ignores the poll that lands after', async () => {
    getMessageDetail.mockResolvedValue(message({ is_finish: false, cur_step: '正在执行脚本', response: [] }));
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('running'), { timeout: 5000 });
    act(() => {
      result.current.stop();
    });

    expect(result.current.run.phase).toBe('stopped');
    // The backend is told too, so a retry does not race the abandoned run.
    expect(cancelMessage).toHaveBeenCalledWith({ chat_id: 'c1', seq_id: 1 });
    const settled = result.current.run;
    await new Promise((resolve) => setTimeout(resolve, 1600));
    expect(result.current.run).toBe(settled);
  });

  it('keeps one chat across follow-ups so context carries', async () => {
    getMessageDetail.mockResolvedValue(message({ response: [{ content_type: 'query', content: 'up' }] }));
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });
    await act(async () => {
      result.current.ask('按 pod 分组');
    });
    await waitFor(() => expect(sendMessage).toHaveBeenCalledTimes(2), { timeout: 5000 });

    expect(createChat).toHaveBeenCalledTimes(1);
  });

  it('ignores a poll that belongs to an abandoned run', async () => {
    // Asking again mid-run is normal; the older run must not write back over
    // the newer one when its poll finally lands.
    getMessageDetail.mockResolvedValue(message({ response: [{ content_type: 'query', content: 'first' }] }));
    const { result, unmount } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    unmount();
    const settled = result.current.run;

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(result.current.run).toBe(settled);
  });
});
