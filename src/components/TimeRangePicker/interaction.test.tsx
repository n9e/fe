/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { value?: number }) => (options?.value !== undefined ? `${key}:${options.value}` : key), i18n: { language: 'en_US' } }),
}));
jest.mock('rc-picker/es/generate/moment', () => jest.requireActual('rc-picker/lib/generate/moment'));
jest.mock('./TimeZonePicker', () => () => null);
jest.mock('@/utils/momentLocale', () => ({}));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
import Picker from './TimeRangePicker';
import AutoRefresh from './AutoRefresh';
import TimePointPicker from './TimePointPicker';
import { RefreshScope, useReportQueryLoading } from './RefreshScope';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

it('keeps a draft during a background refresh and applies both bounds once', () => {
  const onChange = jest.fn();
  const { rerender } = render(<Picker value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.change(screen.getByLabelText('start'), { target: { value: '2026-10-20 08:10:12.345' } });
  fireEvent.change(screen.getByLabelText('end'), { target: { value: '2026-10-20 09:20:34.567' } });
  rerender(<Picker value={{ start: 'now-1h', end: 'now', refreshFlag: 'new' }} onChange={onChange} />);
  expect((screen.getByLabelText('start') as HTMLInputElement).value).toContain('08:10:12.345');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0].start.millisecond()).toBe(345);
  expect(onChange.mock.calls[0][0].end.millisecond()).toBe(567);
});

it('discards an unapplied draft on Escape and blocks invalid/reversed bounds', () => {
  const onChange = jest.fn();
  render(<Picker value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.change(screen.getByLabelText('start'), { target: { value: 'now+1d' } });
  expect((screen.getByRole('button', { name: 'apply' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect((screen.getByLabelText('start') as HTMLInputElement).value).toBe('now-1h');
  expect(onChange).not.toHaveBeenCalled();
});

it('selects both dates in one calendar, previews the interval and only applies explicitly', () => {
  const onChange = jest.fn();
  render(<Picker value={{ start: moment('2026-10-01'), end: moment('2026-10-02') }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(document.querySelector('.fc-time-range-calendar')).toBeNull();
  fireEvent.click(screen.getByLabelText('start'));
  fireEvent.click(document.querySelector('td[title="2026-10-05"] .ant-picker-cell-inner')!);
  expect((screen.getByRole('button', { name: 'apply' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.mouseEnter(document.querySelector('td[title="2026-10-08"] .ant-picker-cell-inner')!);
  expect(document.querySelectorAll('.fc-time-range-calendar__inside').length).toBeGreaterThanOrEqual(4);
  fireEvent.click(document.querySelector('td[title="2026-10-08"] .ant-picker-cell-inner')!);
  expect(document.querySelector('.fc-time-range-calendar')).toBeNull();
  expect((screen.getByLabelText('start') as HTMLInputElement).value).toContain('2026-10-05');
  expect((screen.getByLabelText('end') as HTMLInputElement).value).toContain('2026-10-08');
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange.mock.calls[0][0].start.format('YYYY-MM-DD')).toBe('2026-10-05');
  expect(onChange.mock.calls[0][0].end.format('YYYY-MM-DD')).toBe('2026-10-08');
});

it('spins only during an actual asynchronous refresh and waits a full interval after completion', async () => {
  jest.useFakeTimers();
  let resolve!: () => void;
  const refresh = jest.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  render(<AutoRefresh onRefresh={refresh} intervalSeconds={5} />);
  expect(document.querySelector('.rotate-icon')).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(document.querySelector('.rotate-icon')).not.toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(15000);
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  await act(async () => {
    resolve();
  });
  expect(document.querySelector('.rotate-icon')).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(4999);
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(refresh).toHaveBeenCalledTimes(2);
});

it('aggregates only its own page requests, and releases loading on unmount', () => {
  const Query = ({ loading }: { loading: boolean }) => {
    useReportQueryLoading(loading);
    return null;
  };
  const View = ({ active }: { active: boolean }) => (
    <>
      <RefreshScope>
        <AutoRefresh onRefresh={() => {}} />
        {active && <Query loading />}
      </RefreshScope>
      <RefreshScope>
        <AutoRefresh onRefresh={() => {}} />
      </RefreshScope>
    </>
  );
  const { rerender } = render(<View active />);
  expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(1);
  rerender(<View active={false} />);
  expect(document.querySelectorAll('[aria-busy="true"]')).toHaveLength(0);
});

it('honors controlled Off over a cached interval and cancels timers on unmount', async () => {
  jest.useFakeTimers();
  localStorage.setItem('refresh-test', '5');
  const refresh = jest.fn();
  const { unmount } = render(<AutoRefresh localKey='refresh-test' intervalSeconds={0} onRefresh={refresh} />);
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expect(refresh).not.toHaveBeenCalled();
  unmount();
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expect(refresh).not.toHaveBeenCalled();
});

it('waits for every chart even when one fails before the others', async () => {
  const { waitForQueryBatch } = await import('./RefreshScope');
  let finish!: () => void;
  let settled = false;
  const failure = new Error('query failed');
  const pending = waitForQueryBatch([
    Promise.reject(failure),
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  ]).catch((error) => {
    settled = true;
    return error;
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  finish();
  expect(await pending).toBe(failure);
});

it('allows manual bounds after an unfinished calendar selection', () => {
  const onChange = jest.fn();
  render(<Picker value={{ start: moment('2026-10-01'), end: moment('2026-10-02') }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(document.querySelector('.fc-time-range-calendar')).toBeNull();
  fireEvent.click(screen.getByLabelText('start'));
  fireEvent.click(document.querySelector('td[title="2026-10-05"] .ant-picker-cell-inner')!);
  fireEvent.change(screen.getByLabelText('start'), { target: { value: '2026-10-10 08:00' } });
  fireEvent.change(screen.getByLabelText('end'), { target: { value: '2026-10-11 09:00' } });
  const apply = screen.getByRole('button', { name: 'apply' }) as HTMLButtonElement;
  expect(apply.disabled).toBe(false);
  fireEvent.click(apply);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0].start.format('YYYY-MM-DD HH:mm')).toBe('2026-10-10 08:00');
});

it('opens the calendar from either input and Escape closes only the calendar first', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-10T04:00:00Z'));
  const onChange = jest.fn();
  render(<Picker value={{ start: moment('2026-10-01'), end: moment('2026-11-02') }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(document.querySelector('.fc-time-range-calendar')).toBeNull();
  fireEvent.click(screen.getByLabelText('end'));
  expect(document.querySelector('td[title="2026-11-02"]')).not.toBeNull();
  fireEvent.click(document.querySelector('td[title="2026-11-05"] .ant-picker-cell-inner')!);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(document.querySelector('.fc-time-range-calendar')).toBeNull();
  expect(screen.getByRole('button', { name: 'apply' })).not.toBeNull();
  expect((screen.getByRole('button', { name: 'apply' }) as HTMLButtonElement).disabled).toBe(false);
  expect((screen.getByLabelText('end') as HTMLInputElement).value).toContain('2026-11-02');
  fireEvent.click(screen.getByLabelText('start'));
  expect(document.querySelector('td[title="2026-10-01"]')).not.toBeNull();
  expect(onChange).not.toHaveBeenCalled();
});

it('keeps the visible updating label for 800ms without delaying the next refresh', async () => {
  jest.useFakeTimers();
  const refresh = jest.fn(() => Promise.resolve());
  const { unmount } = render(<AutoRefresh intervalSeconds={5} onRefresh={refresh} />);
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'refreshing' })).not.toBeNull();
  expect(document.querySelector('.auto-refresh-button--updating')).not.toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(799);
  });
  expect(document.querySelector('.auto-refresh-button--updating')).not.toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(document.querySelector('.auto-refresh-button--updating')).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(4200);
  });
  expect(refresh).toHaveBeenCalledTimes(2);
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});

it('applies a visible history button with both stored endpoints', () => {
  localStorage.setItem('flashcat-timeRangePicker-absolute-history', JSON.stringify([{ start: '2026-10-20 08:10:12.345', end: '2026-10-21 09:20:34.567' }]));
  const onChange = jest.fn();
  render(<Picker showMillisecond value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const entry = screen.getByRole('button', { name: /^recentRanges:/ });
  expect(entry.textContent).toContain('2026-10-21 09:20');
  expect(entry.textContent).toContain('durationDays:1');
  expect(entry.title).toContain('2026-10-20 08:10:12.345');
  expect(entry.title).toContain('2026-10-21 09:20:34.567');
  fireEvent.click(entry);
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0].start.millisecond()).toBe(345);
  expect(onChange.mock.calls[0][0].end.millisecond()).toBe(567);
});

it.each([
  [0, 'durationSeconds:0'],
  [30, 'durationSeconds:30'],
  [59, 'durationSeconds:59'],
  [60, 'durationMinutes:1'],
  [90, 'durationMinutes:2'],
  [3599, 'durationHours:1'],
  [7200, 'durationHours:2'],
  [86399, 'durationDays:1'],
  [691199, 'durationDays:8'],
])('compacts a %s-second history without changing the applied timestamps', (seconds, duration) => {
  const start = moment('2026-10-13 00:00:00');
  const end = start.clone().add(Number(seconds), 'seconds');
  localStorage.setItem('flashcat-timeRangePicker-absolute-history', JSON.stringify([{ start: start.format('YYYY-MM-DD HH:mm:ss'), end: end.format('YYYY-MM-DD HH:mm:ss') }]));
  const onChange = jest.fn();
  render(<Picker showSecond value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const entry = screen.getByRole('button', { name: /^recentRanges:/ });
  expect(entry.textContent).toContain(duration);
  expect(entry.title).toContain(end.format('YYYY-MM-DD HH:mm:ss'));
  fireEvent.click(entry);
  expect(onChange.mock.calls[0][0].start.valueOf()).toBe(start.valueOf());
  expect(onChange.mock.calls[0][0].end.valueOf()).toBe(end.valueOf());
});

it('removes the interval tooltip immediately when opening the menu and keeps options clickable', async () => {
  jest.useFakeTimers();
  const onIntervalSecondsChange = jest.fn();
  render(<AutoRefresh onRefresh={() => {}} intervalTooltip='interval help' onIntervalSecondsChange={onIntervalSecondsChange} />);
  const trigger = screen.getByRole('button', { name: /Off/ });
  fireEvent.mouseEnter(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent('interval help');
  fireEvent.click(trigger);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('menuitem', { name: '5s' }));
  expect(onIntervalSecondsChange).toHaveBeenCalledWith(5);
  expect(screen.getByRole('button', { name: /5s/ })).toBeInTheDocument();
});

it('hides the point summary immediately for the calendar and forwards the range footer action', () => {
  jest.useFakeTimers();
  const rangeAction = jest.fn();
  render(<TimePointPicker value={moment('2026-10-20 08:00')} showTime showNow={false} renderExtraFooter={() => <button onClick={rangeAction}>adjust range</button>} />);
  fireEvent.mouseEnter(document.querySelector('.ant-picker')!);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent('08:00:00');
  fireEvent.mouseDown(screen.getByRole('textbox'));
  fireEvent.mouseUp(screen.getByRole('textbox'));
  fireEvent.click(screen.getByRole('textbox'));
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'adjust range' }));
  expect(rangeAction).toHaveBeenCalledTimes(1);
});

it('suppresses point summaries while the external range editor is open without leaving a stale hover', () => {
  jest.useFakeTimers();
  const value = moment('2026-10-20 08:00');
  const { rerender } = render(<TimePointPicker value={value} />);
  const trigger = document.querySelector('.ant-picker')!;
  fireEvent.mouseEnter(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
  rerender(<TimePointPicker value={value} tooltipDisabled />);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.mouseEnter(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  rerender(<TimePointPicker value={value} />);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  fireEvent.mouseLeave(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  fireEvent.mouseEnter(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByRole('tooltip')).toBeInTheDocument();
});

it('preserves the button and tooltip trigger across loading states without accepting duplicate refreshes', async () => {
  jest.useFakeTimers();
  let finish!: () => void;
  const refresh = jest.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(<AutoRefresh onRefresh={refresh} />);
  const button = screen.getByRole('button', { name: 'refresh' });
  const trigger = button.parentElement!;
  fireEvent.click(button);
  expect(screen.getByRole('button', { name: 'refreshing' })).toBe(button);
  expect(button.parentElement).toBe(trigger);
  expect(button).toHaveClass('auto-refresh-button--updating');
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(refresh).toHaveBeenCalledTimes(1);
  fireEvent.mouseEnter(trigger);
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByRole('tooltip')).toHaveTextContent('refreshing');
  await act(async () => {
    finish();
  });
  act(() => {
    jest.advanceTimersByTime(600);
  });
  expect(screen.getByRole('button', { name: 'refresh' })).toBe(button);
  expect(button.parentElement).toBe(trigger);
  expect(button).toBeEnabled();
  expect(button).not.toHaveClass('auto-refresh-button--updating');
});

it('edits a configured frequency without starting queries or inheriting a page loading state', async () => {
  jest.useFakeTimers();
  const refresh = jest.fn();
  const onIntervalSecondsChange = jest.fn();
  const { rerender } = render(<AutoRefresh mode='settings' loading intervalSeconds={5} onRefresh={refresh} onIntervalSecondsChange={onIntervalSecondsChange} />);
  expect(screen.queryByRole('button', { name: 'refreshing' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'refresh' })).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(15000);
  });
  expect(refresh).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /5s/ }));
  fireEvent.click(screen.getByRole('menuitem', { name: '10s' }));
  expect(onIntervalSecondsChange).toHaveBeenCalledWith(10);
  await act(async () => {
    jest.advanceTimersByTime(20000);
  });
  expect(refresh).not.toHaveBeenCalled();
  rerender(<AutoRefresh mode='live' intervalSeconds={10} onRefresh={refresh} />);
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expect(refresh).toHaveBeenCalledTimes(1);
});
