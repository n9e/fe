/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { GuidanceProvider, HelpTip, StackHelp, useGuidance } from './index';

jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
// Exercise our coordination/timing rather than Ant Design's hover implementation.
jest.mock('antd', () => ({
  Tooltip: ({ children, visible, onVisibleChange, title }) => {
    const React = require('react');
    return (
      <div>
        {React.cloneElement(children, { onMouseEnter: () => onVisibleChange(true), onClick: () => onVisibleChange(!visible) })}
        {visible && <aside role='tooltip'>{title}</aside>}
      </div>
    );
  },
}));

let intersect: IntersectionObserverCallback;
function Query({ configured = false, docs = () => {} }: { configured?: boolean; docs?: () => void }) {
  const guide = useGuidance('query', !configured);
  return (
    <>
      <input aria-label='query' onFocus={() => guide.schedule(800)} onInput={guide.cancel} onBlur={guide.stopPending} />
      <HelpTip kind='query' guide={guide} onDocs={docs} defaultSearch />
    </>
  );
}
function Fixture({ user = 'one', configured = false, ready = true, docs = () => {} }: { user?: string; configured?: boolean; ready?: boolean; docs?: () => void }) {
  return (
    <GuidanceProvider userKey={user}>
      <Query configured={configured} docs={docs} />
      <StackHelp ready={ready} />
    </GuidanceProvider>
  );
}
const tick = (time: number) =>
  act(() => {
    jest.advanceTimersByTime(time);
  });
const visibleChart = (visible = true) =>
  act(() => {
    intersect?.([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  jest.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
  jest.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  global.IntersectionObserver = jest.fn().mockImplementation((callback) => {
    intersect = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('delays a focused query tip and records it only after it is actually shown', () => {
  render(<Fixture />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(799);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(localStorage.getItem('log-explorer-guidance:v1:one:query')).toBeNull();
  tick(1);
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.default_search');
  fireEvent.click(screen.getByLabelText('guidance.close'));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(localStorage.getItem('log-explorer-guidance:v1:one:query')).toBe('1');
  visibleChart();
  tick(2000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('cancels before showing when typing or leaving the input, without consuming the visit allowance', () => {
  render(<Fixture />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(300);
  fireEvent.input(screen.getByLabelText('query'), { target: { value: 'error' } });
  tick(800);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.focus(screen.getByLabelText('query'));
  fireEvent.blur(screen.getByLabelText('query'));
  tick(800);
  visibleChart();
  tick(2000);
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.stack_intro');
  expect(localStorage.getItem('log-explorer-guidance:v1:one:query')).toBeNull();
});

it('keeps only one manual or automatic tip open and leaves manual help available after the first visit', () => {
  render(<Fixture />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(800);
  fireEvent.mouseEnter(screen.getByLabelText('guidance.stack_title'));
  expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.stack_intro');
  fireEvent.click(screen.getByLabelText('guidance.close'));
  fireEvent.mouseEnter(screen.getByLabelText('guidance.query_title'));
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.query_intro');
});

it('does not repeat after remount but keeps independent first-use state for another account', () => {
  const first = render(<Fixture />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(800);
  first.unmount();
  const second = render(<Fixture />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(800);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  second.unmount();
  render(<Fixture user='two' />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(800);
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
});

it('skips configured inputs and charts that are not ready, while retaining their manual help', () => {
  render(<Fixture configured ready={false} />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(3000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(global.IntersectionObserver).not.toHaveBeenCalled();
  fireEvent.mouseEnter(screen.getByLabelText('guidance.query_title'));
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
});

it('requires a visible chart and postpones automatic help around another dialog', () => {
  render(<Fixture />);
  visibleChart();
  tick(1000);
  visibleChart(false);
  tick(2000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  const dialog = document.createElement('div');
  dialog.className = 'ant-modal-wrap';
  document.body.append(dialog);
  visibleChart();
  tick(2000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  dialog.remove();
  visibleChart();
  tick(2000);
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.stack_intro');
});

it('expires automatic tips and opens the existing document entry explicitly', () => {
  const docs = jest.fn();
  render(<Fixture docs={docs} />);
  fireEvent.focus(screen.getByLabelText('query'));
  tick(800);
  tick(8000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.mouseEnter(screen.getByLabelText('guidance.query_title'));
  fireEvent.click(screen.getByText('guidance.docs →'));
  expect(docs).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('does not interrupt editing with the chart tip', () => {
  render(<Fixture />);
  act(() => screen.getByLabelText('query').focus());
  fireEvent.input(screen.getByLabelText('query'));
  visibleChart();
  tick(2000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

it('waits for a background tab to become visible before starting the chart delay', () => {
  const visibility = jest.spyOn(document, 'visibilityState', 'get');
  visibility.mockReturnValue('hidden');
  render(<Fixture />);
  visibleChart();
  tick(3000);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  expect(localStorage.getItem('log-explorer-guidance:v1:one:stack')).toBeNull();
  visibility.mockReturnValue('visible');
  fireEvent(document, new Event('visibilitychange'));
  tick(1999);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  tick(1);
  expect(screen.getByRole('tooltip')).toHaveTextContent('guidance.stack_intro');
});
