/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment-timezone';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options = {}) => {
      const messages = jest.requireActual('./interaction/locales').default.timePickerInteraction.zh_CN;
      if (key !== 'rangeLimit' && key !== 'futureTime' && !key.startsWith('limit')) return key;
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
import { getRangeError, describeTimeRange } from './utils';

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
  [8, '8小时'],
  [744, '31天'],
  [25, '1天 1小时'],
  [24, '1天'],
  [1.5, '1小时 30分钟'],
])('displays a %s hour limit as %s without changing validation', (limitHour, duration) => {
  render(<Picker limitHour={limitHour} value={{ start: 'now-1h', end: 'now' }} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(screen.getByText(`最多可回溯 ${duration}`)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'apply' })).toBeEnabled();
  fireEvent.change(screen.getByLabelText('start'), { target: { value: 'now-100d' } });
  expect(screen.getByRole('button', { name: 'apply' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'apply' })).toHaveAttribute('title', `最多可回溯 ${duration}`);
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

it.each([
  ['now-8h', 'now', undefined],
  ['now-8h-1s', 'now', 'lookback'],
  ['now-1d', 'now-23h', 'lookback'],
  ['now-1h', 'now+1s', 'future'],
  ['now+1h', 'now+2h', 'future'],
  ['now', 'now-1h', 'reversed'],
  ['not-a-date', 'now', 'invalid'],
])('validates %s to %s against the exact rolling window', (start, end, expected) => {
  const now = moment('2026-10-29T14:00:00+08:00');
  expect(getRangeError({ start, end }, 8, now)).toBe(expected);
});

it('uses absolute instants across timezone offsets and resolves now only once', () => {
  const now = moment.tz('2026-11-01 01:30:00', 'America/New_York').add(1, 'hour');
  const start = now.clone().subtract(8, 'hours');
  const end = now.clone().utc();
  expect(getRangeError({ start, end }, 8, now)).toBeUndefined();
  expect(getRangeError({ start: start.clone().subtract(1, 'millisecond'), end }, 8, now)).toBe('lookback');
  const changingClock = jest.spyOn(moment, 'now');
  let tick = now.valueOf();
  changingClock.mockImplementation(() => tick++);
  expect(getRangeError({ start: 'now-8h', end: 'now' }, 8)).toBeUndefined();
  changingClock.mockRestore();
});

it.each([8, undefined])('blocks future typed bounds even with limitHour=%s', (limitHour) => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-29T06:00:00Z'));
  const onChange = jest.fn();
  render(<Picker limitHour={limitHour} value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.change(screen.getByLabelText('end'), { target: { value: 'now+1s' } });
  expect(screen.getByRole('button', { name: 'apply' })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('不能选择未来时间');
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('end'), { target: { value: 'now' } });
  fireEvent.change(screen.getByLabelText('start'), { target: { value: 'now-8h' } });
  expect(screen.getByRole('button', { name: 'apply' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange).toHaveBeenCalledWith({ start: 'now-8h', end: 'now' });
});

it.each([
  ['2026-10-29 14:00', '2026-10-29', '2026-10-29'],
  ['2026-10-29 02:00', '2026-10-28', '2026-10-29'],
  ['2026-11-01 02:00', '2026-10-31', '2026-11-01'],
])('clips calendar days to the 8h window at %s, including midnight and month boundaries', (clock, first, last) => {
  jest.useFakeTimers().setSystemTime(moment(clock).toDate());
  const onChange = jest.fn();
  render(<Picker limitHour={8} value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.click(screen.getByLabelText('end'));
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
  const tooOld = moment().subtract(2, 'days').format('YYYY-MM-DD');
  expect(document.querySelector(`td[title="${tomorrow}"]`)).toHaveClass('ant-picker-cell-disabled');
  if (!document.querySelector(`td[title="${tooOld}"]`)) fireEvent.click(document.querySelector('.ant-picker-header-prev-btn')!);
  expect(document.querySelector(`td[title="${tooOld}"]`)).toHaveClass('ant-picker-cell-disabled');
  fireEvent.click(document.querySelector(`td[title="${first}"] .ant-picker-cell-inner`)!);
  fireEvent.click(document.querySelector(`td[title="${last}"] .ant-picker-cell-inner`)!);
  expect(screen.getByLabelText('start')).toHaveValue('now-8h');
  expect(screen.getByLabelText('end')).toHaveValue('now');
  act(() => {
    jest.advanceTimersByTime(65000);
  });
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange).toHaveBeenCalledWith({ start: 'now-8h', end: 'now' });
});

it('preserves complete historical calendar days and forbids future dates without a lookback limit', () => {
  jest.useFakeTimers().setSystemTime(moment('2026-10-29 14:00').toDate());
  const onChange = jest.fn();
  render(<Picker value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.click(screen.getByLabelText('start'));
  expect(document.querySelector('td[title="2026-10-30"]')).toHaveClass('ant-picker-cell-disabled');
  fireEvent.click(document.querySelector('td[title="2026-10-27"] .ant-picker-cell-inner')!);
  fireEvent.click(document.querySelector('td[title="2026-10-28"] .ant-picker-cell-inner')!);
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange.mock.calls[0][0].start.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe('2026-10-27 00:00:00.000');
  expect(onChange.mock.calls[0][0].end.format('YYYY-MM-DD HH:mm:ss.SSS')).toBe('2026-10-28 23:59:59.999');
});

it('filters future/expired presets and disables those same ranges in history', () => {
  jest.useFakeTimers().setSystemTime(moment('2026-10-29 06:00').toDate());
  const onChange = jest.fn();
  localStorage.setItem(
    'flashcat-timeRangePicker-absolute-history',
    JSON.stringify([
      { start: 'now-1h', end: 'now+1h' },
      { start: 'now-8h-1s', end: 'now' },
      { start: 'now-8h', end: 'now' },
    ]),
  );
  render(<Picker limitHour={8} value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const history = screen.getAllByRole('button', { name: /^recentRanges:/ });
  expect(history[0]).toBeDisabled();
  expect(history[1]).toBeDisabled();
  expect(history[2]).toBeEnabled();
  expect(screen.queryByText('rangeOptions.Last 12 hours')).toBeNull();
  expect(screen.queryByText('rangeOptions.Today')).toBeNull();
  expect(screen.queryByText('rangeOptions.This week')).toBeNull();
  expect(screen.getByText('rangeOptions.Today so far')).toBeInTheDocument();
  fireEvent.click(screen.getByText('rangeOptions.Last 6 hours'));
  expect(onChange).toHaveBeenCalledWith({ start: 'now-6h', end: 'now' });
});

it.each(['apply', 'history', 'preset'])('rechecks an expired absolute range when clicking %s', (entry) => {
  const now = moment('2026-10-29 14:00');
  jest.useFakeTimers().setSystemTime(now.toDate());
  const onChange = jest.fn();
  const range = { start: now.clone().subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss'), end: now.format('YYYY-MM-DD HH:mm:ss') };
  localStorage.setItem('flashcat-timeRangePicker-absolute-history', JSON.stringify([range]));
  render(<Picker limitHour={8} value={range} onChange={onChange} ajustTimeOptions={() => [{ ...range, display: 'Boundary' }]} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const target =
    entry === 'apply'
      ? screen.getByRole('button', { name: 'apply' })
      : entry === 'history'
      ? screen.getByRole('button', { name: /^recentRanges:/ })
      : screen.getByText('rangeOptions.Boundary');
  jest.setSystemTime(now.clone().add(1, 'second').toDate());
  fireEvent.click(target);
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('alert')).toHaveTextContent('最多可回溯 8小时');
});

it('formats the summary by the requested precision without rounding its query snapshot', () => {
  const value = { start: moment.utc('2026-10-27T08:10:12.345Z'), end: moment.utc('2026-10-27T09:20:34.567Z') };
  const { rerender } = render(<TimeRangeSummary value={value} timezone='utc' showSecond={false} />);
  expect(screen.getByText('08:10')).toBeInTheDocument();
  expect(screen.queryByText('08:10:12')).toBeNull();
  rerender(<TimeRangeSummary value={value} timezone='utc' showSecond />);
  expect(screen.getByText('08:10:12')).toBeInTheDocument();
  expect(value.start.millisecond()).toBe(345);
});

it('hides stored seconds in a minute-precision input while retaining the exact range when applied', () => {
  const value = { start: '2026-10-27 08:10:12.345', end: '2026-10-27 09:20:34.567' };
  const onChange = jest.fn();
  render(<Picker showSecond={false} value={value} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  expect(screen.getByLabelText('start')).toHaveValue('2026-10-27 08:10');
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange.mock.calls[0][0].start.valueOf()).toBe(moment(value.start).valueOf());
  const cached = JSON.parse(localStorage.getItem('flashcat-timeRangePicker-absolute-history')!)[0];
  expect(moment(cached.start).valueOf()).toBe(moment(value.start).valueOf());
  expect(moment(cached.end).valueOf()).toBe(moment(value.end).valueOf());
});

it.each([
  [{ start: '2026-10-27 01:02:03.456', end: 'now' }, '2026-10-27 01:02:03.456 ~ now'],
  [{ start: 'now-8h', end: '2026-10-27 02:03:04.567' }, 'now-8h ~ 2026-10-27 02:03:04.567'],
  [{ start: '2026-10-27 01:02:03.456', end: '2026-10-27 02:03:04.567' }, '2026-10-27 01:02:03.456 ~ 2026-10-27 02:03:04.567'],
  [{ start: 'now-1h-30m', end: 'now' }, 'now-1h-30m ~ now'],
])('labels mixed or compound ranges without an empty or misleading description', (range, expected) => {
  expect(describeTimeRange(range, 'YYYY-MM-DD HH:mm:ss.SSS')).toBe(expected);
});

it('keeps manually typed seconds with now readable and reusable in history', () => {
  jest.useFakeTimers().setSystemTime(moment('2026-10-29 15:00').toDate());
  const onChange = jest.fn();
  render(<Picker showMillisecond value={{ start: 'now-1h', end: 'now' }} onChange={onChange} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  fireEvent.change(screen.getByLabelText('start'), { target: { value: '2026-10-27 01:02:03.456' } });
  fireEvent.click(screen.getByRole('button', { name: 'apply' }));
  expect(onChange.mock.calls[0][0].start.valueOf()).toBe(moment('2026-10-27 01:02:03.456').valueOf());
  expect(onChange.mock.calls[0][0].end).toBe('now');
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const entry = screen.getByRole('button', { name: 'recentRanges: 2026-10-27 01:02:03.456 ~ now' });
  expect(entry).toHaveTextContent('2026-10-27 01:02:03.456 ~ now');
  expect(entry).toBeEnabled();
  fireEvent.click(entry);
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange.mock.calls[1][0].start.valueOf()).toBe(onChange.mock.calls[0][0].start.valueOf());
  expect(onChange.mock.calls[1][0].end).toBe('now');
});

it('omits malformed historical ranges but keeps valid expired ranges visible and disabled', () => {
  localStorage.setItem(
    'flashcat-timeRangePicker-absolute-history',
    JSON.stringify([
      { start: 'not-a-date', end: 'now' },
      { start: '2026-10-27 01:00:00', end: 'now' },
    ]),
  );
  jest.useFakeTimers().setSystemTime(moment('2026-10-29 15:00').toDate());
  render(<Picker limitHour={8} value={{ start: 'now-1h', end: 'now' }} />);
  fireEvent.click(document.querySelector('.flashcat-timeRangePicker-target')!);
  const entries = screen.getAllByRole('button', { name: /^recentRanges:/ });
  expect(entries).toHaveLength(1);
  expect(entries[0]).toHaveTextContent('2026-10-27 01:00 ~ now');
  expect(entries[0]).toBeDisabled();
});
