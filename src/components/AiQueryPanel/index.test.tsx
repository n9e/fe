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
let run: AiQueryRun = { phase: 'idle', steps: [] };

jest.mock('./useAiQueryRun', () => ({
  useAiQueryRun: () => ({ run, ask, stop }),
}));

const pageFrom = { url: '/metric/explorer', param: { datasource_id: 849 } } as const;

/** Mirrors the host page: whatever the panel adopts becomes the field's value,
 *  which is how the panel tells "I wrote this" from "the user edited it". */
function renderLive() {
  const onUndo = jest.fn();
  function Host() {
    const [value, setValue] = React.useState<string | undefined>(undefined);
    const before = React.useRef<string | undefined>(undefined);
    return (
      <AiQueryPanel
        pageFrom={pageFrom}
        value={value}
        onAdopt={(next) => {
          if (value !== next) before.current = value;
          setValue(next);
        }}
        onUndo={() => {
          onUndo();
          setValue(before.current);
        }}
        onClose={jest.fn()}
      />
    );
  }
  return { onUndo, ...render(<Host />) };
}

function renderPanel(overrides: Partial<React.ComponentProps<typeof AiQueryPanel>> = {}) {
  const props = {
    pageFrom,
    contextLabel: 'dev-prometheus',
    // The field mirrors whatever the panel writes, as the real page does.
    value: undefined as string | undefined,
    onAdopt: jest.fn(),
    onUndo: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  return { props, ...render(<AiQueryPanel {...props} />) };
}

beforeEach(() => {
  jest.clearAllMocks();
  run = { phase: 'idle', steps: [] };
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
      steps: [{ label: 'panel.step.command' }],
      value: 'cpu_usage_active{cpu="cpu-total"}',
      explanation: '按 ident 区分主机。',
    };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('panel.verified_by')).toBeTruthy();
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
    run = { phase: 'done', steps: [], value: 'up' };
    const { onUndo } = renderLive();

    await waitFor(() => expect(screen.getByText('panel.written_back')).toBeTruthy());
    await userEvent.click(screen.getByText('panel.undo'));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('panel.written_back')).toBeNull();
    expect(screen.getByText('panel.restored')).toBeTruthy();
  });

  it('says plainly when nothing was delivered, and writes nothing', async () => {
    const { props, rerender } = renderPanel();
    run = { phase: 'done', steps: [], explanation: '该数据源没有 CPU 相关指标。' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('panel.nothing_delivered')).toBeTruthy();
    expect(screen.getByText('该数据源没有 CPU 相关指标。')).toBeTruthy();
    expect(props.onAdopt).not.toHaveBeenCalled();
  });

  it('keeps the original question when asked for another way', async () => {
    const { props, rerender } = renderPanel();
    await userEvent.type(screen.getByPlaceholderText('panel.first_placeholder'), '查主机 CPU{enter}');
    // There has to be a query before rewriting it means anything.
    run = { phase: 'done', steps: [], value: 'up' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });
    ask.mockClear();

    await userEvent.click(screen.getByText('panel.another_way'));
    expect(ask).toHaveBeenCalledWith('panel.another_way_prompt');
    // The panel still belongs to the question the user asked...
    expect(screen.getByText('查主机 CPU')).toBeTruthy();
    // ...so that is what Regenerate resends.
    await userEvent.click(screen.getByText('panel.regenerate'));
    expect(ask).toHaveBeenLastCalledWith('查主机 CPU');
  });

  it('offers a way out of a run instead of locking the panel for five minutes', async () => {
    const { props, rerender } = renderPanel();
    run = { phase: 'running', steps: [], activity: '正在验证查询' };
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
    run = { phase: 'failed', steps: [], error: 'dial tcp 127.0.0.1:443: connection refused' };
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
    run = { phase: 'done', steps: [], value: 'up' };
    renderLive();

    await waitFor(() => expect(screen.getByText('panel.undo')).toBeTruthy());
    await userEvent.click(screen.getByText('panel.undo'));
    await userEvent.click(screen.getByText('panel.refill'));

    expect(screen.getByText('panel.written_back')).toBeTruthy();
    // Re-filling is a local write; asking again could return a different query.
    expect(ask).not.toHaveBeenCalled();
  });

  it('notices the user editing the field by hand and stops claiming it', async () => {
    run = { phase: 'done', steps: [], value: 'up' };
    const { props, rerender } = renderPanel({ value: 'up' });
    await waitFor(() => expect(screen.getByText('panel.written_back')).toBeTruthy());

    await act(async () => {
      rerender(<AiQueryPanel {...props} value='up{job="node"}' />);
    });

    expect(screen.queryByText('panel.written_back')).toBeNull();
    expect(screen.getByText('panel.field_changed')).toBeTruthy();
  });

});
