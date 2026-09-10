/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import AiQueryDock from './index';
import type { IAiChatProps, IAiChatTurn } from '@/components/AiChatNG/types';

// The dock is a shell around ChatPanel; the stub exposes what the shell
// passes in and lets a test drive turns the way the panel would.
let panelProps: IAiChatProps | undefined;
jest.mock('@/components/AiChatNG', () => {
  const actual = jest.requireActual('@/components/AiChatNG/types');
  return {
    ...actual,
    ChatPanel: (props: IAiChatProps) => {
      panelProps = props;
      return (
        <div>
          {props.inputPrefix}
          <input aria-label='ask' placeholder={props.placeholder} />
          {props.inputSuffix}
          <div data-testid='list' hidden={props.collapsed} />
        </div>
      );
    },
  };
});

const turn = (over: Partial<IAiChatTurn['message']>, extra?: Partial<IAiChatTurn>): IAiChatTurn => ({
  phase: 'done',
  actionOutcome: over.response?.some((item) => item.content_type === 'page_action') ? { ok: true, status: 'ok', action: 'set_metric_query', result: { empty: false } } : undefined,
  message: { chat_id: 'c', seq_id: 1, query: { content: 'q', page_from: { url: '/x' } }, is_finish: true, response: [], ...over },
  ...extra,
});

const pageAction = { content_type: 'page_action', content: 'fill', param: { call_id: 'k1', name: 'set_metric_query', description: 'fill', args: { promql: 'up' } } };

function renderDock(open = true) {
  const onClose = jest.fn();
  const view = render(<AiQueryDock open={open} pageFrom={{ url: '/metric/explorer' }} onClose={onClose} />);
  return { onClose, view };
}

beforeEach(() => {
  panelProps = undefined;
});

describe('AiQueryDock', () => {
  it('starts open with the first-question placeholder and nothing to report', () => {
    renderDock();
    expect(screen.getByText('dock.idle')).toBeTruthy();
    expect(screen.getByPlaceholderText('dock.placeholder_first')).toBeTruthy();
    expect(screen.getByTestId('list').hidden).toBe(false);
  });

  it('names the step while the assistant works, without forcing the list open', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
    expect(screen.getByTestId('list').hidden).toBe(true);
    act(() => panelProps!.onTurn!(turn({ is_finish: false, cur_step: '查询指标序列' }, { phase: 'running' })));
    expect(screen.getByText(/查询指标序列/)).toBeTruthy();
    expect(screen.getByTestId('list').hidden).toBe(true);
  });

  it('closes the conversation only after the page query succeeds', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ is_finish: false }, { phase: 'running' })));
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'tool_group', content: '', param: { items: [{ content: 'a' }, { content: 'b' }] } }, pageAction] })));
    expect(screen.getByTestId('list').hidden).toBe(true);
    expect(screen.getByText('dock.success')).toBeTruthy();
    expect(screen.getByPlaceholderText('dock.placeholder_follow_up')).toBeTruthy();
  });

  it("offers the model's follow-up hint as the next placeholder, and only after a delivery", () => {
    const { rerender } = render(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} progress={{ phase: 'success', followUp: '改成按 env 分组取平均' }} />);
    act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
    expect(screen.getByPlaceholderText('改成按 env 分组取平均')).toBeTruthy();

    rerender(
      <AiQueryDock
        open
        pageFrom={{ url: '/metric/explorer' }}
        onClose={jest.fn()}
        progress={{ phase: 'failed', message: 'query unavailable', followUp: '改成按 env 分组取平均' }}
      />,
    );
    expect(screen.getByPlaceholderText('dock.placeholder_follow_up')).toBeTruthy();
  });

  it('starts a fresh conversation on request, leaving the page to reset its own status', () => {
    const onNewConversation = jest.fn();
    render(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} onNewConversation={onNewConversation} progress={{ phase: 'success' }} />);
    expect(screen.queryByRole('button', { name: 'dock.new_conversation' })).toBeNull();
    act(() => panelProps!.onChatChange!({ chat_id: 'chat-9', title: '', last_update: 0 }));
    act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
    expect(panelProps!.chatId).toBe('chat-9');
    fireEvent.click(screen.getByRole('button', { name: 'dock.new_conversation' }));
    expect(onNewConversation).toHaveBeenCalledTimes(1);
    expect(panelProps!.chatId).toBeUndefined();
    expect(screen.getByPlaceholderText('dock.placeholder_first')).toBeTruthy();
    expect(screen.getByTestId('list').hidden).toBe(false);
    expect(screen.queryByRole('button', { name: 'dock.new_conversation' })).toBeNull();
  });

  it('says how many series came back, once delivered', () => {
    const { rerender } = render(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} />);
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'markdown', content: '按 ident 区分主机。' }, pageAction] })));
    rerender(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} progress={{ phase: 'success', count: 8 }} />);
    expect(screen.getByRole('status').textContent).toBe('dock.success_count');
  });

  it('opens the conversation when the status text is clicked', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
    expect(screen.getByTestId('list').hidden).toBe(true);
    fireEvent.click(screen.getByText('dock.success'));
    expect(screen.getByTestId('list').hidden).toBe(false);
  });

  it('stays open when the assistant asks something back instead', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'input_request', content: '哪个数据源？' }] })));
    expect(screen.getByTestId('list').hidden).toBe(false);
    expect(screen.getByText('dock.asked')).toBeTruthy();
    expect(screen.getByPlaceholderText('dock.placeholder_answer')).toBeTruthy();
  });

  it('does not reopen a manually collapsed list when the assistant asks back', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'markdown', content: '找不到' }] })));
    fireEvent.click(screen.getByRole('button', { name: 'dock.collapse' }));
    expect(screen.getByTestId('list').hidden).toBe(true);
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'input_request', content: '哪个数据源？' }] })));
    expect(screen.getByTestId('list').hidden).toBe(true);
    expect(screen.getByText('dock.asked')).toBeTruthy();
  });

  it('reports a stopped turn without pretending it delivered', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ err_code: -2 }, { reason: 'stopped' })));
    expect(screen.getByText('dock.stopped')).toBeTruthy();
  });

  it('takes Esc in two steps: fold the conversation, then close the dock', () => {
    const { onClose } = renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'markdown', content: '找不到' }] })));
    const root = screen.getByTestId('list').closest('[tabindex]')!;
    fireEvent.keyDown(root, { key: 'Escape' });
    expect(screen.getByTestId('list').hidden).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(root, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('lets the user reopen the conversation after it folded', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
    fireEvent.click(screen.getByRole('button', { name: 'dock.expand' }));
    expect(screen.getByTestId('list').hidden).toBe(false);
    expect(screen.getByRole('button', { name: 'dock.collapse' })).toBeTruthy();
  });

  it('keeps one conversation across turns by remembering its id', () => {
    renderDock();
    act(() => panelProps!.onChatChange!({ chat_id: 'chat-9', title: '', last_update: 0 }));
    expect(panelProps!.chatId).toBe('chat-9');
  });

  it('keeps the conversation while closed and brings it back on reopen', () => {
    const { onClose, view } = renderDock();
    act(() => panelProps!.onChatChange!({ chat_id: 'chat-9', title: '', last_update: 0 }));
    view.rerender(<AiQueryDock open={false} pageFrom={{ url: '/metric/explorer' }} onClose={onClose} />);
    expect(screen.getByTestId('list').closest('[tabindex]')!.hasAttribute('hidden')).toBe(true);
    view.rerender(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={onClose} />);
    expect(panelProps!.chatId).toBe('chat-9');
  });

  it('lets only one dock be open on a page, since they share one action registry', () => {
    const closeFirst = jest.fn();
    const closeSecond = jest.fn();
    const { rerender } = render(
      <>
        <AiQueryDock open pageFrom={{ url: '/a' }} onClose={closeFirst} />
        <AiQueryDock open={false} pageFrom={{ url: '/b' }} onClose={closeSecond} />
      </>,
    );
    expect(closeFirst).not.toHaveBeenCalled();
    rerender(
      <>
        <AiQueryDock open pageFrom={{ url: '/a' }} onClose={closeFirst} />
        <AiQueryDock open pageFrom={{ url: '/b' }} onClose={closeSecond} />
      </>,
    );
    expect(closeFirst).toHaveBeenCalledTimes(1);
    expect(closeSecond).not.toHaveBeenCalled();
  });
});

it('keeps the list open when a delivered action has not completed', () => {
  renderDock();
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] }, { actionOutcome: undefined })));
  expect(screen.getByTestId('list').hidden).toBe(false);
  expect(screen.queryByText('dock.success')).toBeNull();
});
it('shows the actual question while preserving a collapsed list', () => {
  renderDock();
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'input_request', content: '', param: { question: 'Group by host or service?' } }] })));
  expect(screen.getByText(/Group by host or service/)).toBeTruthy();
  expect(screen.getByTestId('list').hidden).toBe(true);
});
it('does not collapse a conversation the user opened to read while working', () => {
  renderDock();
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  act(() => panelProps!.onTurn!(turn({ is_finish: false }, { phase: 'running' })));
  fireEvent.click(screen.getByRole('button', { name: 'dock.expand' }));
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  expect(screen.getByTestId('list').hidden).toBe(false);
});
it('shows query failure details without collapsing', () => {
  render(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} progress={{ phase: 'failed', message: 'Backend unavailable' }} />);
  expect(screen.getByText(/Backend unavailable/)).toBeTruthy();
  expect(screen.getByTestId('list').hidden).toBe(false);
});
it('offers undo after a partial write and explains that no query ran', () => {
  const undo = jest.fn();
  render(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} onClose={jest.fn()} progress={{ phase: 'stopped', stage: 'filled' }} canUndo onUndo={undo} />);
  expect(screen.getByText('dock.stopped_filled')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'dock.undo' }));
  expect(undo).toHaveBeenCalled();
});

it('preserves an explicitly expanded conversation across a follow-up send', () => {
  renderDock();
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  fireEvent.click(screen.getByRole('button', { name: 'dock.expand' }));
  act(() => {
    panelProps!.prepareTurn?.();
  });
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  expect(screen.getByTestId('list').hidden).toBe(false);
});
it('clears a recoverable transport error when the turn subsequently succeeds', () => {
  renderDock();
  act(() => panelProps!.onError!(new Error('Connection interrupted')));
  expect(screen.getByText(/Connection interrupted/)).toBeTruthy();
  act(() => panelProps!.onTurn!(turn({ response: [pageAction] })));
  expect(screen.queryByText(/Connection interrupted/)).toBeNull();
  expect(screen.getByText('dock.success')).toBeTruthy();
});

it('names close as stop before the first message has arrived', () => {
  renderDock();
  act(() => panelProps!.onBusyChange!(true));
  expect(screen.getByRole('button', { name: 'dock.close_and_stop' })).toBeTruthy();
  act(() => panelProps!.onBusyChange!(false));
  expect(screen.getByRole('button', { name: 'dock.close' })).toBeTruthy();
});
