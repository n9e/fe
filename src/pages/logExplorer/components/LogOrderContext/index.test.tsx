/** @jest-environment jsdom */
import React from 'react';
import { message } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import LogOrderContext from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('../../constants', () => ({ NAME_SPACE: 'log_explorer' }));
// jsdom 没有实现 scrollTo，打开抽屉后会滚到当前行
Element.prototype.scrollTo = jest.fn();

const log = { __log_stream_id__: 's1', __log_seq__: '100', timestamp: 1793164672156, message: '> Could not find gaussdbjdbc' };
const page = {
  logs: [
    { __index_number__: -1, __log_stream_id__: 's1', __log_seq__: '50', timestamp: 1793164672156, message: '  > Could not resolve all files' },
    { __index_number__: 0, ...log, message: '     Searched in the following locations:' },
  ],
  back_cursor: { seq: '50', time: '1793164672156', index: -1 },
  forward_cursor: { seq: '100', time: '1793164672156', index: 0 },
  back_scan_limited: false,
  forward_scan_limited: false,
  has_back: false,
  has_forward: false,
};

it('raw layout drops the time and field name and keeps leading spaces', async () => {
  render(<LogOrderContext log={log} timeField='timestamp' fetchPage={() => Promise.resolve(page as any)} />);
  fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
  const row = () => document.querySelector('tr[data-row-key="0"] td:last-child > div') as HTMLElement;
  await waitFor(() => expect(row()).not.toBeNull());
  expect(row().textContent).toBe('[1793164672156]message:      Searched in the following locations:');

  fireEvent.click(screen.getByRole('switch'));
  expect(row().textContent).toBe('     Searched in the following locations:');
  expect(row().className).toContain('font-mono');
});

it('explains why a paging button is greyed out and shows only the stream tag', async () => {
  const withHost = { ...log, agent_hostname: 'host-a' };
  render(<LogOrderContext log={withHost} timeField='timestamp' fetchPage={() => Promise.resolve({ ...page, has_back: true } as any)} />);
  fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
  const later = await screen.findByRole('button', { name: /log_order_context.later/ });
  await waitFor(() => expect(later).toBeDisabled());

  fireEvent.mouseEnter(later.parentElement as HTMLElement);
  expect(await screen.findByText('log_order_context.later_disabled_tip')).toBeTruthy();
  fireEvent.mouseEnter(screen.getByRole('button', { name: /log_order_context.earlier/ }).parentElement as HTMLElement);
  expect(await screen.findByText('log_order_context.earlier_tip')).toBeTruthy();

  expect(screen.getByText('__log_stream_id__=s1')).toBeTruthy();
  expect(screen.queryByText(/agent_hostname=/)).toBeNull();
});

it('greys out the entry with a reason when the row has no order fields', async () => {
  const { container } = render(<LogOrderContext log={{ timestamp: 1, message: 'x' }} timeField='timestamp' fetchPage={jest.fn()} />);
  const entry = screen.getByRole('button', { name: 'log_order_context.title' });
  expect(entry).toBeDisabled();
  fireEvent.mouseEnter(entry.parentElement as HTMLElement);
  expect(await screen.findByText('log_order_context.no_fields_tip')).toBeTruthy();

  container.remove();
  const empty = render(<LogOrderContext timeField='timestamp' fetchPage={jest.fn()} />);
  expect(empty.container.innerHTML).toBe('');
});

it('greys out the entry and explains the missing time when the time value is empty', async () => {
  render(<LogOrderContext log={{ timestamp: '', __log_stream_id__: 's1', __log_seq__: '100' }} timeField='timestamp' fetchPage={jest.fn()} />);
  const entry = screen.getByRole('button', { name: 'log_order_context.title' });
  expect(entry).toBeDisabled();
  fireEvent.mouseEnter(entry.parentElement as HTMLElement);
  expect(await screen.findByText('log_order_context.no_time_tip')).toBeInTheDocument();
});

const invalidPages = [
  ['missing logs', { ...page, logs: undefined }],
  ['missing back cursor', { ...page, back_cursor: undefined }],
  ['missing forward cursor', { ...page, forward_cursor: undefined }],
  ['invalid cursor', { ...page, back_cursor: { seq: '50', time: 't' } }],
  ['invalid log row', { ...page, logs: [null] }],
  ['missing response', undefined],
] as const;

it.each(invalidPages)('rejects initial %s and can reopen to retry', async (_name, invalid) => {
  const error = jest.spyOn(message, 'error').mockImplementation(() => (() => {}) as any);
  const fetchPage = jest.fn().mockResolvedValueOnce(invalid).mockResolvedValueOnce(page);
  try {
    render(<LogOrderContext log={log} timeField='timestamp' fetchPage={fetchPage} />);
    fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
    await waitFor(() => expect(error).toHaveBeenCalledWith('log_order_context.query_failed'));
    expect(document.querySelector('.ant-spin-spinning')).toBeNull();
    expect(screen.getByRole('button', { name: /log_order_context.earlier/ })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('close'));
    fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
    await waitFor(() => expect(document.querySelector('tr[data-row-key="0"]')).not.toBeNull());
    expect(fetchPage).toHaveBeenCalledTimes(2);
  } finally {
    error.mockRestore();
  }
});

it.each(['back', 'forward'] as const)('keeps logs and cursors after invalid %s page and allows retry', async (direction) => {
  const error = jest.spyOn(message, 'error').mockImplementation(() => (() => {}) as any);
  const initial = { ...page, has_back: true, has_forward: true };
  const fetchPage = jest
    .fn()
    .mockResolvedValueOnce(initial)
    .mockResolvedValueOnce({ ...page, logs: undefined })
    .mockResolvedValueOnce({ ...page, logs: [] });
  try {
    render(<LogOrderContext log={log} timeField='timestamp' fetchPage={fetchPage} />);
    fireEvent.click(screen.getByRole('button', { name: 'log_order_context.title' }));
    const button = screen.getByRole('button', { name: direction === 'back' ? /log_order_context.earlier/ : /log_order_context.later/ });
    await waitFor(() => expect(button).not.toBeDisabled());
    fireEvent.click(button);
    await waitFor(() => expect(error).toHaveBeenCalledWith('log_order_context.query_failed'));
    await waitFor(() => expect(button).not.toBeDisabled());
    expect(document.querySelectorAll('tr[data-row-key]')).toHaveLength(2);
    fireEvent.click(button);
    await waitFor(() => expect(fetchPage).toHaveBeenCalledTimes(3));
    expect(fetchPage.mock.calls[2][0]).toEqual(fetchPage.mock.calls[1][0]);
    await waitFor(() => expect(button).toBeDisabled());
    expect(document.querySelectorAll('tr[data-row-key]')).toHaveLength(2);
  } finally {
    error.mockRestore();
  }
});
