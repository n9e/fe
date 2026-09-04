/** @jest-environment jsdom */
// Covers what the hook tests cannot: that a run actually reaches the screen,
// and that the value lands in the field by itself.
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AiQueryPanel from './index';
import { AiQueryRun } from './useAiQueryRun';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// @/utils is an ESM-only barrel under jest; the panel only needs one function.
const copyToClipBoard = jest.fn();
jest.mock('@/utils', () => ({ copyToClipBoard: (...args: unknown[]) => copyToClipBoard(...args) }));

const ask = jest.fn();
const stop = jest.fn();
let run: AiQueryRun = { phase: 'idle', tried: 0 };

jest.mock('./useAiQueryRun', () => ({
  useAiQueryRun: () => ({ run, ask, stop }),
}));

const pageFrom = { url: '/metric/explorer', param: { datasource_id: 849 } } as const;
/** Mirrors the host page: whatever the panel adopts becomes the field's value,
 *  which is how the panel tells "I wrote this" from "the user edited it".
 *  Undo is not a separate callback — it is another adopt, of the old value. */
const adopted: string[] = [];

function Host() {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  return (
    <AiQueryPanel
      pageFrom={pageFrom}
      contextLabel='dev-prometheus'
      examplePrompt='每台主机的 CPU 使用率'
      value={value}
      onAdopt={(next) => {
        adopted.push(next);
        setValue(next);
      }}
      onClose={jest.fn()}
    />
  );
}

function renderLive() {
  adopted.length = 0;
  return render(<Host />);
}

function renderPanel(overrides: Partial<React.ComponentProps<typeof AiQueryPanel>> = {}) {
  const props = {
    pageFrom,
    contextLabel: 'dev-prometheus',
    // The field mirrors whatever the panel writes, as the real page does.
    value: undefined as string | undefined,
    examplePrompt: '每台主机的 CPU 使用率',
    onAdopt: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  return { props, ...render(<AiQueryPanel {...props} />) };
}

beforeEach(() => {
  jest.clearAllMocks();
  run = { phase: 'idle', tried: 0 };
});

describe('AiQueryPanel', () => {
  it('opens ready to be typed into, naming what it is grounded in', () => {
    renderPanel();

    expect(screen.getByText('panel.untitled')).toBeTruthy();
    expect(screen.getByText(/panel.based_on/)).toBeTruthy();
    expect(screen.getByPlaceholderText('panel.first_placeholder')).toBeTruthy();
  });

  it('sends what the user typed and titles the panel with it', async () => {
    renderPanel();
    const input = screen.getByPlaceholderText('panel.first_placeholder');

    await userEvent.type(input, '查主机 CPU{enter}');

    expect(ask).toHaveBeenCalledWith('查主机 CPU');
    expect(screen.getByText('查主机 CPU')).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe('');
    // Having asked once, the box now invites a refinement rather than a first ask.
    expect(screen.getByPlaceholderText('panel.follow_up_placeholder')).toBeTruthy();
  });

  it('shows the steps it took and writes the answer into the field on arrival', async () => {
    const { props, rerender } = renderPanel();
    run = {
      phase: 'done',
      tried: 1,
      value: 'cpu_usage_active{cpu="cpu-total"}',
      explanation: '按 ident 区分主机。',
    };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('panel.tried')).toBeTruthy();
    expect(screen.getByText('cpu_usage_active{cpu="cpu-total"}')).toBeTruthy();
    expect(screen.getByText('按 ident 区分主机。')).toBeTruthy();
    await waitFor(() => expect(props.onAdopt).toHaveBeenCalledWith('cpu_usage_active{cpu="cpu-total"}'));
    // Adopting is a side effect of the answer, not of rendering.
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });
    expect(props.onAdopt).toHaveBeenCalledTimes(1);
  });

  it('offers to put the field back after it has written to it', async () => {
    const { rerender } = renderLive();
    // Go through a real ask, so the panel knows what the field held first.
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'done', tried: 0, value: 'up' };
    await act(async () => {
      rerender(<Host />);
    });

    await waitFor(() => expect(screen.getByText('panel.written_back')).toBeTruthy());
    await userEvent.click(screen.getByText('panel.undo'));

    // Undo is a write like any other: the field goes back to what it held.
    expect(adopted).toEqual(['up', '']);
    expect(screen.queryByText('panel.written_back')).toBeNull();
    expect(screen.getByText('panel.restored')).toBeTruthy();
  });

  it('says plainly when nothing was delivered, and writes nothing', async () => {
    const { props, rerender } = renderPanel();
    run = { phase: 'done', tried: 0, explanation: '该数据源没有 CPU 相关指标。' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('panel.nothing_delivered')).toBeTruthy();
    expect(screen.getByText('该数据源没有 CPU 相关指标。')).toBeTruthy();
    expect(props.onAdopt).not.toHaveBeenCalled();
  });

  it('regenerates the task, not the last thing typed into the box', async () => {
    const { props, rerender } = renderPanel();
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'done', tried: 0, value: 'up' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} value='up' />);
    });
    await userEvent.type(screen.getByPlaceholderText('panel.follow_up_placeholder'), '按 pod 分组{enter}');
    ask.mockClear();

    await userEvent.click(screen.getByLabelText('panel.regenerate'));

    // A follow-up refines the task; it does not become the task.
    expect(ask).toHaveBeenCalledWith('查主机 CPU');
    expect(screen.getByText('查主机 CPU')).toBeTruthy();
  });

  it('says nothing changed when the answer is what the field already held', async () => {
    const { props, rerender } = renderPanel({ value: 'up' });
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'done', tried: 0, value: 'up' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} value='up' />);
    });

    expect(screen.getByText('panel.unchanged')).toBeTruthy();
    // Nothing was written, so there is nothing to undo — offering one would
    // arm a button that wipes the user's own text.
    expect(screen.queryByText('panel.undo')).toBeNull();
    expect(props.onAdopt).not.toHaveBeenCalled();
  });

  it('aims undo at what the field held when the run started', async () => {
    const { props, rerender } = renderPanel({ value: 'mine' });
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'done', tried: 0, value: 'up' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} value='up' />);
    });
    expect(screen.getByText('panel.written_back')).toBeTruthy();

    // The page restores the original; the panel should recognise it as such
    // rather than reporting the user edited the field.
    await act(async () => {
      rerender(<AiQueryPanel {...props} value='mine' />);
    });
    expect(screen.getByText('panel.restored')).toBeTruthy();
    expect(screen.queryByText('panel.field_changed')).toBeNull();
  });

  it('offers a way out of a run instead of locking the panel for five minutes', async () => {
    const { props, rerender } = renderPanel();
    run = { phase: 'running', tried: 0, activity: '正在验证查询' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('正在验证查询')).toBeTruthy();
    await userEvent.click(screen.getByText('panel.stop'));
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('puts retry inside the failure, and the raw error out of the way', async () => {
    const { props, rerender } = renderPanel();
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'failed', tried: 0, error: 'dial tcp 127.0.0.1:443: connection refused' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });
    ask.mockClear();

    expect(screen.getByText('panel.failed_title')).toBeTruthy();
    // The raw failure is available on demand, never the first thing on screen.
    expect(screen.queryByText(/dial tcp/)).toBeNull();
    await userEvent.click(screen.getByText('panel.error_detail'));
    expect(screen.getByText(/dial tcp/)).toBeTruthy();

    await userEvent.click(screen.getByText('panel.retry'));
    expect(ask).toHaveBeenCalledWith('查主机 CPU');
  });

  it('refills without another model run after an undo', async () => {
    const { rerender } = renderLive();
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    run = { phase: 'done', tried: 0, value: 'up' };
    await act(async () => {
      rerender(<Host />);
    });

    await waitFor(() => expect(screen.getByText('panel.undo')).toBeTruthy());
    ask.mockClear();
    await userEvent.click(screen.getByText('panel.undo'));
    await userEvent.click(screen.getByText('panel.refill'));

    expect(screen.getByText('panel.written_back')).toBeTruthy();
    // Re-filling is a local write; asking again could return a different query.
    expect(ask).not.toHaveBeenCalled();
  });

  it('notices the user editing the field by hand and stops claiming it', async () => {
    run = { phase: 'done', tried: 0, value: 'up' };
    const { props, rerender } = renderPanel({ value: 'up' });
    await waitFor(() => expect(screen.getByText('panel.written_back')).toBeTruthy());

    await act(async () => {
      rerender(<AiQueryPanel {...props} value='up{job="node"}' />);
    });

    expect(screen.queryByText('panel.written_back')).toBeNull();
    expect(screen.getByText('panel.field_changed')).toBeTruthy();
  });

});
