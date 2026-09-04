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

const ask = jest.fn();
let run: AiQueryRun = { phase: 'idle', steps: [] };

jest.mock('./useAiQueryRun', () => ({
  useAiQueryRun: () => ({ run, ask }),
}));

const pageFrom = { url: '/metric/explorer', param: { datasource_id: 849 } } as const;

function renderPanel(overrides: Partial<React.ComponentProps<typeof AiQueryPanel>> = {}) {
  const props = {
    pageFrom,
    contextLabel: 'dev-prometheus',
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
    expect(screen.getByPlaceholderText('panel.follow_up_placeholder')).toBeTruthy();
  });

  it('sends what the user typed and titles the panel with it', async () => {
    renderPanel();
    const input = screen.getByPlaceholderText('panel.follow_up_placeholder');

    await userEvent.type(input, '查主机 CPU{enter}');

    expect(ask).toHaveBeenCalledWith('查主机 CPU');
    expect(screen.getByText('查主机 CPU')).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('shows the steps it took and writes the answer into the field on arrival', async () => {
    const { props, rerender } = renderPanel();
    run = {
      phase: 'done',
      steps: [{ label: 'panel.step.command', done: true }],
      value: 'cpu_usage_active{cpu="cpu-total"}',
      explanation: '按 ident 区分主机。',
    };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    expect(screen.getByText('panel.step.command')).toBeTruthy();
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
    const { props, rerender } = renderPanel();
    run = { phase: 'done', steps: [], value: 'up' };
    await act(async () => {
      rerender(<AiQueryPanel {...props} />);
    });

    await userEvent.click(screen.getByText('panel.undo'));

    expect(props.onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('panel.written_back')).toBeNull();
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
    renderPanel();
    await userEvent.type(screen.getByPlaceholderText('panel.follow_up_placeholder'), '查主机 CPU{enter}');
    ask.mockClear();

    await userEvent.click(screen.getByText('panel.another_way'));
    expect(ask).toHaveBeenCalledWith('panel.another_way_prompt');
    // The panel still belongs to the question the user asked...
    expect(screen.getByText('查主机 CPU')).toBeTruthy();
    // ...so that is what Regenerate resends.
    await userEvent.click(screen.getByText('panel.regenerate'));
    expect(ask).toHaveBeenLastCalledWith('查主机 CPU');
  });
});
