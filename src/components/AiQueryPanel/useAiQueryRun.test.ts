/** @jest-environment jsdom */
// The hook polls on a 1.2s beat, so every wait here has to outlast one tick —
// the library's 1s default would expire before the first poll lands.
import { act, renderHook, waitFor } from '@testing-library/react';

import { IAiChatMessage } from '@/components/AiChatNG/types';

import { useAiQueryRun } from './useAiQueryRun';

const createChat = jest.fn();
const sendMessage = jest.fn();
const getMessageDetail = jest.fn();

jest.mock('@/components/AiChatNG/services', () => ({
  createChat: (...args: unknown[]) => createChat(...args),
  sendMessage: (...args: unknown[]) => sendMessage(...args),
  getMessageDetail: (...args: unknown[]) => getMessageDetail(...args),
}));

const t = ((key: string) => key) as never;
const pageFrom = { url: '/metric/explorer', param: { datasource_id: 849 } } as const;

function message(overrides: Partial<IAiChatMessage> = {}): IAiChatMessage {
  return { chat_id: 'c1', seq_id: 1, query: {} as never, is_finish: true, ...overrides };
}

function setup() {
  createChat.mockResolvedValue({ chat_id: 'c1' });
  sendMessage.mockResolvedValue({ chat_id: 'c1', seq_id: 1 });
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
          { content_type: 'tool', content: 'shell', is_finish: true },
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

  it('names each step by the kind of tool that ran', async () => {
    // The kind is what a reader can act on; the tool's own name is not shown.
    getMessageDetail.mockResolvedValue(
      message({
        response: [
          { content_type: 'tool', content: 'x', is_finish: true, tool_call_statistic_type: 'read_file' },
          { content_type: 'tool', content: 'y', is_finish: true, tool_call_statistic_type: 'edit_file' },
          { content_type: 'tool', content: 'z', is_finish: true },
        ],
      }),
    );
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.phase).toBe('done'), { timeout: 5000 });

    expect(result.current.run.steps.map((step) => step.label)).toEqual(['panel.step.read_file', 'panel.step.edit_file', 'panel.step.command']);
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

  it('shows the step in flight while the turn is still running', async () => {
    getMessageDetail.mockResolvedValue(message({ is_finish: false, cur_step: '正在执行脚本', response: [] }));
    const { result } = setup();

    await act(async () => {
      result.current.ask('查主机 CPU');
    });
    await waitFor(() => expect(result.current.run.steps).toHaveLength(1), { timeout: 5000 });

    expect(result.current.run.steps[0]).toEqual({ label: '正在执行脚本', done: false });
    expect(result.current.run.phase).toBe('running');
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
