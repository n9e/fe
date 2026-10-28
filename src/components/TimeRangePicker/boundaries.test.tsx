/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment-timezone';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options = {}) => {
      const messages = jest.requireActual('./interaction/locales').default.timePickerInteraction.zh_CN;
      if (key !== 'rangeLimit' && !key.startsWith('limit')) return key;
      return messages[key].replace(/{{(\w+)}}/g, (_, name) => options[name]);
    },
    i18n: { language: 'en_US' },
  }),
}));
jest.mock('rc-picker/es/generate/moment', () => jest.requireActual('rc-picker/lib/generate/moment'));
jest.mock('./TimeZonePicker', () => () => null);
jest.mock('@/utils/momentLocale', () => ({}));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
import Picker from './TimeRangePicker';
import TimePointPicker from './TimePointPicker';
import TimeRangeSummary from './TimeRangeSummary';
import AutoRefresh from './AutoRefresh';
import { message } from 'antd';

afterEach(() => {
  cleanup();
  localStorage.clear();
  jest.useRealTimers();
});

it('keeps a provided query snapshot when time advances and shows both DST offsets', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-11-01T09:00:00Z'));
  const resolvedRange = { start: moment.utc('2026-11-01T05:30:00.123Z'), end: moment.utc('2026-11-01T06:30:00.456Z') };
  const { rerender } = render(<TimeRangeSummary value={{ start: 'now-1h', end: 'now' }} resolvedRange={resolvedRange} timezone='America/New_York' showMillisecond />);
  expect(screen.getByText('01:30:00.123')).toBeInTheDocument();
  expect(screen.getByText('01:30:00.456')).toBeInTheDocument();
  expect(screen.getByText('UTC-04:00')).toBeInTheDocument();
  expect(screen.getByText('→ UTC-05:00')).toBeInTheDocument();
  jest.setSystemTime(new Date('2026-11-01T10:00:00Z'));
  rerender(<TimeRangeSummary value={{ start: 'now-1h', end: 'now' }} resolvedRange={resolvedRange} timezone='America/New_York' showMillisecond />);
  expect(screen.getByText('01:30:00.123')).toBeInTheDocument();
});

it('applies cross-month bounds together without losing milliseconds', () => {
  const onChange = jest.fn();
  render(<Picker showMillisecond value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.change(screen.getByLabelText('start'), { target: { value: '2026-09-30 23:59:59.123' } });
  fireEvent.change(screen.getByLabelText('end'), { target: { value: '2026-10-01 00:00:00.456' } });
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange.mock.calls[0][0].end.diff(onChange.mock.calls[0][0].start)).toBe(1333);
});

it('enforces lookback limits for typed bounds and recent history', () => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-22T04:00:00Z'));
  const old = moment().subtract(3, 'days');
  localStorage.setItem(
    'flashcat-timeRangePicker-absolute-history',
    JSON.stringify([{ start: old.format('YYYY-MM-DD HH:mm:ss'), end: old.clone().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss') }]),
  );
  render(<Picker limitHour={24} value={{ start: 'now-1h', end: 'now' }} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(screen.getByRole('button', { name: /^recentRanges:/ })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('start'), { target: { value: 'now-2d' } });
  expect(screen.getByRole('button', { name: 'apply' })).toBeDisabled();
});

it('preserves single-time precision, callbacks, and disabled dates while suppressing hover during controlled open', async () => {
  jest.useFakeTimers();
  const onOpenChange = jest.fn();
  const onChange = jest.fn();
  const value = moment.tz('2026-10-22 12:34:56.789', 'Asia/Shanghai');
  const disabledDate = (day: moment.Moment) => day.isAfter(value, 'day');
  const { rerender } = render(
    <TimePointPicker value={value} isLatest={false} format='YYYY-MM-DD HH:mm:ss.SSS' showTime disabledDate={disabledDate} onChange={onChange} onOpenChange={onOpenChange} />,
  );
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('2026-10-22 12:34:56.789');
  fireEvent.mouseEnter(document.querySelector('.ant-picker')!);
  await act(async () => {
    jest.advanceTimersByTime(200);
  });
  expect(screen.getByText('12:34:56.789')).toBeInTheDocument();
  expect(screen.getByText('history')).toBeInTheDocument();
  rerender(<TimePointPicker value={value} isLatest={false} format='YYYY-MM-DD HH:mm' showTime disabledDate={disabledDate} onChange={onChange} onOpenChange={onOpenChange} />);
  expect(screen.getByText('12:34')).toBeInTheDocument();
  expect(screen.queryByText('12:34:56.789')).toBeNull();
  expect(value.millisecond()).toBe(789);
  fireEvent.mouseDown(input);
  fireEvent.mouseUp(input);
  fireEvent.click(input);
  fireEvent.keyDown(input, { key: 'ArrowDown', which: 40, keyCode: 40 });
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(onChange).not.toHaveBeenCalled();
  expect(document.querySelector('td[title="2026-10-23"]')).toHaveClass('ant-picker-cell-disabled');
  rerender(<TimePointPicker value={value} open isLatest={false} disabledDate={disabledDate} />);
  fireEvent.mouseEnter(document.querySelector('.ant-picker')!);
  await act(async () => {
    jest.advanceTimersByTime(200);
  });
  expect(document.querySelector('.fc-time-range-tooltip:not(.ant-tooltip-hidden)')).toBeNull();
});

it('does not overlap externally reported queries and stops polling when switched Off', async () => {
  jest.useFakeTimers();
  const onRefresh = jest.fn();
  const { rerender } = render(<AutoRefresh loading intervalSeconds={5} onRefresh={onRefresh} />);
  await act(async () => {
    jest.advanceTimersByTime(20000);
  });
  expect(onRefresh).not.toHaveBeenCalled();
  rerender(<AutoRefresh loading={false} intervalSeconds={5} onRefresh={onRefresh} />);
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(onRefresh).toHaveBeenCalledTimes(1);
  rerender(<AutoRefresh intervalSeconds={0} onRefresh={onRefresh} />);
  await act(async () => {
    jest.advanceTimersByTime(20000);
  });
  expect(onRefresh).toHaveBeenCalledTimes(1);
});

it('releases a failed refresh and allows the next scheduled request', async () => {
  jest.useFakeTimers();
  const toast = jest.spyOn(message, 'error').mockReturnValue((() => {}) as any);
  const onRefresh = jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
  render(<AutoRefresh intervalSeconds={5} onRefresh={onRefresh} />);
  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(toast).toHaveBeenCalledWith('offline');
  expect(document.querySelector('[aria-busy="true"]')).toBeNull();
  await act(async () => {
    jest.advanceTimersByTime(800);
  });
  expect(screen.getByRole('button', { name: 'refresh' })).toBeEnabled();
  await act(async () => {
    jest.advanceTimersByTime(4200);
  });
  expect(onRefresh).toHaveBeenCalledTimes(2);
  toast.mockRestore();
});

it.each([
  [744, '31天'],
  [25, '1天 1小时'],
  [24, '1天'],
  [1.5, '1小时 30分钟'],
])('displays a %s hour limit as %s without changing validation', (limitHour, duration) => {
  render(<Picker limitHour={limitHour} value={{ start: 'now-1h', end: 'now' }} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(screen.getByText(`时间范围不能超过 ${duration}`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'apply' })).toBeEnabled();
  fireEvent.change(screen.getByLabelText('start'), { target: { value: 'now-100d' } });
  expect(screen.getByRole('button', { name: 'apply' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'apply' })).toHaveAttribute('title', `时间范围不能超过 ${duration}`);
});

it('labels an unrestricted filter without creating a range or allowing a redundant clear', () => {
  const onChange = jest.fn();
  const { rerender } = render(<Picker emptyLabel='全部时间' allowClear onChange={onChange} />);
  const trigger = screen.getByRole('button', { name: /全部时间/ });
  expect(trigger).not.toHaveClass('flashcat-timeRangePicker-target-allowClear');
  fireEvent.click(trigger);
  expect(screen.getByLabelText('start')).toHaveValue('');
  expect(screen.getByLabelText('end')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'apply' })).toBeDisabled();
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.keyDown(document, { key: 'Escape' });
  rerender(<Picker emptyLabel='全部时间' value={{ start: 'now-1h', end: 'now' }} allowClear onChange={onChange} />);
  expect(document.querySelector('.flashcat-timeRangePicker-target')).toHaveClass('flashcat-timeRangePicker-target-allowClear');
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target .anticon-close-circle')!);
  expect(onChange).toHaveBeenCalledWith(undefined);
  rerender(<Picker emptyLabel='全部时间' allowClear onChange={onChange} />);
  expect(screen.getByRole('button', { name: /全部时间/ })).toBeInTheDocument();
});
