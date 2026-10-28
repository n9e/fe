/** @jest-environment jsdom */
import React from 'react';
import { message } from 'antd';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import FieldStackButton from './FieldStackButton';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, args?: any) => (args?.count === undefined ? key : `${key}:${args.count}`) }) }));

it.each([0, 1, 2, 10, 11, 1500])('only applies cardinality %s if it is within 2–10', async (count) => {
  const info = jest.spyOn(message, 'warning').mockImplementation(() => (() => {}) as any);
  const fetch = jest.fn().mockResolvedValue(count);
  const change = jest.fn();
  render(<FieldStackButton active={false} title='stack' icon={null} getUniqueCount={fetch} statsScope={{}} onChange={change} />);
  fireEvent.focus(screen.getByRole('button'));
  fireEvent.mouseEnter(screen.getByRole('button'));
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button')).not.toHaveClass('ant-btn-loading'));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(change).toHaveBeenCalledTimes(count >= 2 && count <= 10 ? 1 : 0);
  if (count < 2 || count > 10) expect(info).toHaveBeenCalledWith(expect.objectContaining({ duration: 10, content: expect.anything() }));
  info.mockRestore();
});

it('ignores a previous query response, including its loading cleanup', async () => {
  let resolve!: (count: number) => void;
  const fetch = jest.fn(
    () =>
      new Promise<number>((r) => {
        resolve = r;
      }),
  );
  const onChange = jest.fn();
  const props = { active: false, title: 'stack', icon: null, getUniqueCount: fetch, statsScope: {}, onChange };
  const view = render(<FieldStackButton {...props} />);
  fireEvent.click(screen.getByRole('button'));
  view.rerender(<FieldStackButton {...props} statsScope={{}} />);
  await act(async () => {
    resolve(3);
  });
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).not.toHaveClass('ant-btn-loading');
});

it('reports a failure and allows retry; cancelling never fetches', async () => {
  const error = jest.spyOn(message, 'error').mockImplementation(() => (() => {}) as any);
  const fetch = jest.fn().mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce(2);
  const onChange = jest.fn();
  const props = { active: false, title: 'stack', icon: null, getUniqueCount: fetch, statsScope: {}, onChange };
  const view = render(<FieldStackButton {...props} />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(error).toHaveBeenCalledWith(expect.objectContaining({ duration: 10, content: expect.anything() })));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  view.rerender(<FieldStackButton {...props} active />);
  fireEvent.click(screen.getByRole('button'));
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenCalledTimes(2);
  error.mockRestore();
});

it.each(['warning', 'error'] as const)('keeps %s feedback for 10 seconds and dismisses only that notice', async (type) => {
  const noticeSpy = jest.spyOn(message, type).mockImplementation(() => (() => {}) as any);
  const destroy = jest.spyOn(message, 'destroy').mockImplementation(() => {});
  const fetch = type === 'warning' ? jest.fn().mockResolvedValue(1500) : jest.fn().mockRejectedValue(new Error('network'));
  const props = { active: false, title: 'stack', icon: null, getUniqueCount: fetch, statsScope: {}, onChange: jest.fn() };
  const view = render(<FieldStackButton {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'stack' }));
  await waitFor(() => expect(noticeSpy).toHaveBeenCalledTimes(1));
  const notice = noticeSpy.mock.calls[0][0] as { key: string; duration: number; content: React.ReactNode };
  expect(notice.duration).toBe(10);
  expect(notice.key).toMatch(/^log-field-stack-/);
  render(<>{notice.content}</>);
  expect(screen.getByText(type === 'warning' ? 'field_stack.unsupported:1500' : 'field_stack.failed')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'field_stack.close' }));
  expect(destroy).toHaveBeenLastCalledWith(notice.key);
  view.rerender(<FieldStackButton {...props} statsScope={{}} />);
  expect(destroy.mock.calls.every(([key]) => key === notice.key)).toBe(true);
  expect(props.onChange).not.toHaveBeenCalled();
  noticeSpy.mockRestore();
  destroy.mockRestore();
});

it('keeps the real warning visible beyond 3 seconds, closes on X, and expires automatically', async () => {
  jest.useFakeTimers();
  try {
    render(<FieldStackButton active={false} title='stack' icon={null} getUniqueCount={jest.fn().mockResolvedValue(1500)} statsScope={{}} onChange={jest.fn()} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'stack' }));
    });
    act(() => jest.advanceTimersByTime(3500));
    expect(screen.getByText('field_stack.unsupported:1500')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'field_stack.close' }));
    act(() => jest.advanceTimersByTime(500));
    expect(screen.queryByText('field_stack.unsupported:1500')).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'stack' }));
    });
    expect(screen.getByText('field_stack.unsupported:1500')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(10500));
    expect(screen.queryByText('field_stack.unsupported:1500')).not.toBeInTheDocument();
  } finally {
    act(() => {
      message.destroy();
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  }
});
