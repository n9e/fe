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
  message: { chat_id: 'c', seq_id: 1, query: { content: 'q', page_from: { url: '/x' } }, is_finish: true, response: [], ...over },
  ...extra,
});

const pageAction = { content_type: 'page_action', content: 'fill', param: { call_id: 'k1', name: 'set_metric_query', description: 'fill', args: { promql: 'up' } } };

function renderDock(open = true) {
  const onClose = jest.fn();
  const view = render(<AiQueryDock open={open} pageFrom={{ url: '/metric/explorer' }} contextLabel='ds-1' onClose={onClose} />);
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

  it('opens while the assistant works and names the step it is on', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ is_finish: false, cur_step: '查询指标序列' }, { phase: 'running' })));
    expect(screen.getByText(/查询指标序列/)).toBeTruthy();
    expect(screen.getByTestId('list').hidden).toBe(false);
  });

  it('closes the conversation once the page has something to run, and says what it was checked against', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ is_finish: false }, { phase: 'running' })));
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'tool_group', content: '', param: { items: [{ content: 'a' }, { content: 'b' }] } }, pageAction] })));
    expect(screen.getByTestId('list').hidden).toBe(true);
    expect(screen.getByText('dock.verified_on')).toBeTruthy();
    expect(screen.getByPlaceholderText('dock.placeholder_follow_up')).toBeTruthy();
  });

  it('stays open when the assistant asks something back instead', () => {
    renderDock();
    act(() => panelProps!.onTurn!(turn({ response: [{ content_type: 'input_request', content: '哪个数据源？' }] })));
    expect(screen.getByTestId('list').hidden).toBe(false);
    expect(screen.getByText('dock.asked')).toBeTruthy();
    expect(screen.getByPlaceholderText('dock.placeholder_answer')).toBeTruthy();
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
    fireEvent.click(screen.getByText('dock.expand'));
    expect(screen.getByTestId('list').hidden).toBe(false);
    expect(screen.getByText('dock.collapse')).toBeTruthy();
  });

  it('keeps one conversation across turns by remembering its id', () => {
    renderDock();
    act(() => panelProps!.onChatChange!({ chat_id: 'chat-9', title: '', last_update: 0 }));
    expect(panelProps!.chatId).toBe('chat-9');
  });

  it('keeps the conversation while closed and brings it back on reopen', () => {
    const { onClose, view } = renderDock();
    act(() => panelProps!.onChatChange!({ chat_id: 'chat-9', title: '', last_update: 0 }));
    view.rerender(<AiQueryDock open={false} pageFrom={{ url: '/metric/explorer' }} contextLabel='ds-1' onClose={onClose} />);
    expect(screen.getByTestId('list').closest('[tabindex]')!.hasAttribute('hidden')).toBe(true);
    view.rerender(<AiQueryDock open pageFrom={{ url: '/metric/explorer' }} contextLabel='ds-1' onClose={onClose} />);
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
