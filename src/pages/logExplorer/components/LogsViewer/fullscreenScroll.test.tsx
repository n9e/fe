/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LogsViewer from './index';
import { OptionsType } from './types';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ isPlus: false }) }));
jest.mock('@/utils/constant', () => ({ DatasourceCateEnum: { doris: 'doris' } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/components/IconFont', () => ({ type }: { type: string }) => <span>{type}</span>);
jest.mock('@/components/TimeRangePicker', () => ({ parseRange: jest.fn() }));
jest.mock('./components/HistogramChart', () => () => null);
jest.mock('./components/OriginSettings', () => require('react').forwardRef(() => null));
jest.mock('./Raw', () => () => <div>raw results</div>);
jest.mock('./Table', () => () => <div>table results</div>);
jest.mock('./Clustering/Table', () => () => null);
jest.mock('./Clustering/Histogram', () => () => null);
jest.mock('./utils/usePinnedHistogram', () => () => {});

beforeEach(() => {
  const original = window.getComputedStyle;
  jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const style = original(element);
    if (element.classList.contains('n9e-logs-view-modal')) Object.defineProperty(style, 'overflowY', { value: 'auto' });
    return style;
  });
  jest.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(function (this: HTMLElement) {
    return (this.hasAttribute('data-log-results') ? [{}] : []) as unknown as DOMRectList;
  });
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => window.setTimeout(() => callback(0), 0));
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(window.clearTimeout);
});
afterEach(() => jest.restoreAllMocks());

it.each(['origin', 'table'] as const)('rebinds %s load-more to fullscreen and back without a parent rerender', async (logMode) => {
  const onScroll = jest.fn();
  const view = render(
    <div data-testid='page' style={{ overflowY: 'auto' }}>
      <LogsViewer loading={false} logs={[]} fields={[]} organizeFields={[]} options={{ logMode } as OptionsType} hideHistogram showLogMode={false} onScrollCapture={onScroll} />
    </div>,
  );
  const page = screen.getByTestId('page');
  const shell = view.container.querySelector<HTMLElement>('[data-log-viewer-shell]')!;
  fireEvent.scroll(page);
  await waitFor(() => expect(onScroll).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: 'icon-ArrowFullScreen' }));
  expect(shell).toHaveClass('n9e-logs-view-modal');
  fireEvent.scroll(shell);
  await waitFor(() => expect(onScroll).toHaveBeenCalledTimes(2));
  fireEvent.scroll(page);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  expect(onScroll).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'icon-ArrowOffScreen' }));
  fireEvent.scroll(shell);
  fireEvent.scroll(page);
  await waitFor(() => expect(onScroll).toHaveBeenCalledTimes(3));
});
