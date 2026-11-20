/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { message } from 'antd';
import CopyableText, { CopyableTag } from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('antd', () => ({ Tooltip: ({ children }: { children: React.ReactNode }) => children, message: { error: jest.fn() } }));
jest.mock('./placement', () => ({ measureCopyPlacement: () => ({ side: 'outside', style: {} }) }));

const writeText = jest.fn();
beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  Object.defineProperty(document, 'execCommand', { configurable: true, value: jest.fn().mockReturnValue(false) });
});

test.each([undefined, 'auto', 'inside'] as const)('copies the complete raw value without opening the row (%s)', async (placement) => {
  const open = jest.fn();
  const raw = '  支付/payment-api-' + 'a'.repeat(300) + '\n  ';
  render(
    <div onClick={open}>
      <CopyableText value={raw} placement={placement}>
        <a href='#detail'>payment…</a>
      </CopyableText>
    </div>,
  );
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(raw));
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('link'));
  expect(open).toHaveBeenCalledTimes(1);
});

test('only opts selected consumers into floating controls', () => {
  const { container } = render(
    <>
      <CopyableText value='cloud' />
      <CopyableText value='network' overlay />
      <CopyableText value='application' placement='auto' />
    </>,
  );
  const items = container.querySelectorAll('.fc-copyable-text');
  expect(items[0].className).toBe('fc-copyable-text');
  expect(items[1].className).toBe('fc-copyable-text fc-copyable-text--overlay');
  expect(items[2].className).toBe('fc-copyable-text fc-copyable-text--floating');
});

test('floating tags copy full KV without triggering filtering', async () => {
  const filter = jest.fn();
  const { container } = render(
    <span onClick={filter}>
      <CopyableTag text='retry=0' copyValue='retry:0' placement='auto' />
    </span>,
  );
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('retry:0'));
  expect(filter).not.toHaveBeenCalled();
});

test('does not offer placeholder copies and preserves zero and false', async () => {
  render(
    <>
      <CopyableText value={null} />
      <CopyableText value={undefined} />
      <CopyableText value='  ' />
      <CopyableText value={0} />
      <CopyableText value={false} />
      <CopyableText value='-' />
    </>,
  );
  expect(screen.getAllByRole('button')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'copy: 0' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('0'));
  fireEvent.click(screen.getByRole('button', { name: 'copy: false' }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('false'));
});

test('tag copy includes its key and does not trigger filtering', async () => {
  const filter = jest.fn();
  render(
    <span onClick={filter}>
      <CopyableTag text='retry=0' copyValue='retry:0' />
    </span>,
  );
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith('retry:0'));
  expect(filter).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('retry=0'));
  expect(filter).toHaveBeenCalledTimes(1);
});

test('failed copy reports failure, removes its fallback textarea, and can retry', async () => {
  writeText.mockRejectedValueOnce(new Error('denied'));
  render(<CopyableText value='resource-01' />);
  const button = screen.getByRole('button');
  button.focus();
  fireEvent.click(button);
  await screen.findByRole('button', { name: 'retry: resource-01' });
  expect(message.error).toHaveBeenCalledWith('failed');
  expect(document.querySelector('textarea')).toBeNull();
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  await screen.findByRole('button', { name: 'copied: resource-01' });
});

test('uses the legacy clipboard on HTTP and restores focus', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const exec = jest.fn(() => {
    expect((document.activeElement as HTMLTextAreaElement).value).toBe('9223372036854775807');
    return true;
  });
  Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
  render(<CopyableText value='9223372036854775807' />);
  const button = screen.getByRole('button');
  button.focus();
  fireEvent.click(button);
  await screen.findByRole('button', { name: 'copied: 9223372036854775807' });
  expect(exec).toHaveBeenCalledWith('copy');
  expect(document.activeElement).toBe(button);
  expect(document.querySelector('textarea')).toBeNull();
});

test.each([
  '  中文/日本語/Русский 👩‍💻 &<>=:\n第二行  ',
  '2001:db8:85a3:0000:0000:8a2e:0370:7334',
  'registry.example.com/team/image@sha256:' + 'a'.repeat(64),
  'key:',
  'a'.repeat(10000),
])('preserves boundary data exactly (%#)', async (raw) => {
  render(<CopyableText value={raw} wrap />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(raw));
});

test('ignores repeated clicks while clipboard writing is pending', async () => {
  let finish!: () => void;
  writeText.mockReturnValueOnce(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  render(<CopyableText value='pending-copy' />);
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('button'));
  expect(writeText).toHaveBeenCalledTimes(1);
  await act(async () => finish());
  expect(screen.getByRole('button', { name: 'copied: pending-copy' })).toBeInTheDocument();
});

test('pointer copying does not steal focus or pin feedback after leaving', async () => {
  jest.useFakeTimers();
  const { container, unmount } = render(<CopyableText value='group-id' placement='auto' />);
  const root = container.querySelector('.fc-copyable-text')!;
  const button = screen.getByRole('button');
  fireEvent.mouseEnter(root);
  act(() => jest.advanceTimersByTime(200));
  expect(fireEvent.mouseDown(button)).toBe(false);
  await act(async () => fireEvent.click(button));
  expect(writeText).toHaveBeenCalledWith('group-id');
  expect(screen.getByRole('button', { name: 'copied: group-id' })).toBeInTheDocument();
  expect(document.activeElement).not.toBe(button);
  fireEvent.mouseLeave(root, { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(100));
  expect(root).not.toHaveClass('fc-copyable-text--active');
  unmount();
  jest.useRealTimers();
});

test('does not show an old copy result after a row changes identity', async () => {
  let finish!: () => void;
  writeText.mockReturnValueOnce(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  const { rerender } = render(<CopyableText value='old-row' />);
  fireEvent.click(screen.getByRole('button'));
  rerender(<CopyableText value='new-row' />);
  await act(async () => finish());
  expect(screen.getByRole('button', { name: 'copy: new-row' })).toBeInTheDocument();
});

test('keeps activation keys out of rows while allowing Escape to close a surrounding drawer', () => {
  const onKeyDown = jest.fn();
  render(
    <div onKeyDown={onKeyDown}>
      <CopyableText value='drawer-value' />
    </div>,
  );
  const button = screen.getByRole('button');
  fireEvent.keyDown(button, { key: 'Enter' });
  fireEvent.keyDown(button, { key: ' ' });
  expect(onKeyDown).not.toHaveBeenCalled();
  fireEvent.keyDown(button, { key: 'Escape' });
  expect(onKeyDown).toHaveBeenCalledTimes(1);
});
