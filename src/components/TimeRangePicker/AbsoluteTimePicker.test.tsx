/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment';
import AbsoluteTimePicker from './AbsoluteTimePicker';
import type { IRawTimeRange } from './types';

let mockPanel: any;
jest.mock('@/utils/momentLocale', () => ({ momentLocaleZhCN: {} }));
jest.mock('@/utils/constant', () => ({ IS_ENT: false }));
jest.mock('rc-picker/es/generate/moment', () => ({ __esModule: true, default: {} }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'en_US' }, t: (key: string) => key }) }));
jest.mock('antd', () => {
  const React = require('react');
  const Input = ({ onPressEnter, ...props }: any) => <input {...props} />;
  Input.Group = ({ children }: any) => <div>{children}</div>;
  return {
    Input,
    Button: ({ children, icon, danger, type, size, ...props }: any) => (
      <button {...props}>
        {icon}
        {children}
      </button>
    ),
    Popover: ({ visible, children, content, onVisibleChange }: any) => (
      <>
        {React.cloneElement(children, { onClick: () => onVisibleChange(!visible) })}
        {visible && content}
      </>
    ),
  };
});
jest.mock('@ant-design/icons', () => ({ CalendarOutlined: () => <span>calendar</span> }));
jest.mock('rc-picker', () => ({
  PickerPanel: (props: any) => {
    mockPanel = props;
    return (
      <>
        <button onClick={() => props.onChange(moment('2026-11-12 09:30'))}>pick date</button>
        {props.renderExtraFooter?.()}
      </>
    );
  },
}));

const initial = { start: moment('2026-11-11 16:26'), end: moment('2026-11-13 16:22') };
function Fixture({
  bounds,
  inline = false,
  disabled = false,
  collapsible = false,
}: {
  bounds?: { start: number; end: number };
  inline?: boolean;
  disabled?: boolean;
  collapsible?: boolean;
}) {
  const [range, setRange] = useState<IRawTimeRange>(initial);
  const [panelVisible, setPanelVisible] = useState(false);
  const [rangeStatus, setRangeStatus] = useState<{ start?: string; end?: string }>({});
  return (
    <>
      <AbsoluteTimePicker
        type='start'
        inline={inline}
        panelVisible={collapsible ? panelVisible : undefined}
        onPanelVisibleChange={collapsible ? setPanelVisible : undefined}
        disabled={disabled}
        range={range}
        setRange={setRange}
        rangeStatus={rangeStatus}
        setRangeStatus={setRangeStatus}
        dateFormat='YYYY-MM-DD HH:mm'
        bounds={bounds}
        confirmText={bounds ? 'Done' : undefined}
      />
      <output data-testid='range'>
        {moment.isMoment(range.start) ? range.start.format('YYYY-MM-DD HH:mm') : range.start}|{moment(range.end).format('YYYY-MM-DD HH:mm')}
      </output>
      <output data-testid='status'>{rangeStatus.start}</output>
    </>
  );
}

test('existing callers buffer calendar edits and commit only the chosen endpoint on OK', () => {
  render(<Fixture />);
  fireEvent.click(screen.getByRole('button', { name: 'calendar' }));
  fireEvent.click(screen.getByRole('button', { name: 'pick date' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-11 16:26|2026-11-13 16:22');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-12 09:30|2026-11-13 16:22');
  expect(screen.queryByRole('button', { name: 'pick date' })).toBeNull();
});

test('bounded mode updates the draft without changing the opposite endpoint and restricts boundary times', () => {
  render(<Fixture bounds={{ start: initial.start.unix(), end: initial.end.unix() }} />);
  fireEvent.click(screen.getByRole('button', { name: 'calendar' }));
  expect(mockPanel.disabledDate(moment('2026-11-10'))).toBe(true);
  expect(mockPanel.disabledTime(initial.start).disabledMinutes(16)).toContain(25);
  expect(mockPanel.disabledTime(initial.start).disabledMinutes(16)).not.toContain(26);
  fireEvent.click(screen.getByRole('button', { name: 'pick date' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-12 09:30|2026-11-13 16:22');
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByRole('button', { name: 'pick date' })).toBeNull();
});

test('bounded input rejects incomplete dates and relative expressions, then recovers on a full date', () => {
  render(<Fixture bounds={{ start: initial.start.unix(), end: initial.end.unix() }} />);
  const input = screen.getByRole('textbox', { name: 'start' });
  for (const value of ['2026-11-', 'now-1h']) {
    fireEvent.change(input, { target: { value } });
    expect(screen.getByTestId('status').textContent).toBe('invalid');
  }
  fireEvent.change(input, { target: { value: '2026-11-12 10:20' } });
  expect(screen.getByTestId('status').textContent).toBe('');
  expect(screen.getByTestId('range').textContent).toBe('2026-11-12 10:20|2026-11-13 16:22');
});

test('inline calendar is immediately editable and has no nested popup or confirmation', () => {
  render(<Fixture inline bounds={{ start: initial.start.unix(), end: initial.end.unix() }} />);
  expect(screen.queryByRole('button', { name: 'calendar' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'pick date' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-12 09:30|2026-11-13 16:22');
  expect(mockPanel.value.format('YYYY-MM-DD HH:mm')).toBe('2026-11-12 09:30');
  fireEvent.change(screen.getByRole('textbox', { name: 'start' }), { target: { value: '2026-11-12 10:20' } });
  expect(mockPanel.value.format('YYYY-MM-DD HH:mm')).toBe('2026-11-12 10:20');
});

test('disabled inline calendar cannot change the range while a submission is running', () => {
  render(<Fixture inline disabled bounds={{ start: initial.start.unix(), end: initial.end.unix() }} />);
  expect(screen.getByRole('textbox', { name: 'start' })).toBeDisabled();
  expect(mockPanel.disabledDate(moment('2026-11-12'))).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'pick date' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-11 16:26|2026-11-13 16:22');
});

test('collapsible inline calendar keeps the input and draft when toggled', () => {
  render(<Fixture inline collapsible bounds={{ start: initial.start.unix(), end: initial.end.unix() }} />);
  const toggle = screen.getByRole('button', { name: 'start' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('button', { name: 'pick date' })).toBeNull();
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole('button', { name: 'pick date' }));
  expect(screen.getByTestId('range').textContent).toBe('2026-11-12 09:30|2026-11-13 16:22');
  fireEvent.click(toggle);
  expect(screen.queryByRole('button', { name: 'pick date' })).toBeNull();
  expect(screen.getByRole('textbox', { name: 'start' })).toHaveValue('2026-11-12 09:30');
  fireEvent.click(toggle);
  expect(mockPanel.value.format('YYYY-MM-DD HH:mm')).toBe('2026-11-12 09:30');
});
