/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Drawer } from 'antd';
import CopyableText from './index';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

test('lets the real Drawer handle Escape while the copy button has focus', () => {
  const onClose = jest.fn();
  render(
    <Drawer visible onClose={onClose}>
      <CopyableText value='drawer-keyboard' />
    </Drawer>,
  );
  const button = screen.getByRole('button', { name: 'copy: drawer-keyboard' });
  button.focus();
  fireEvent.keyDown(button, { key: 'Escape', code: 'Escape', keyCode: 27, which: 27 });
  expect(onClose).toHaveBeenCalledTimes(1);
});

jest.mock('./placement', () => ({ measureCopyPlacement: () => ({ side: 'outside', style: {} }) }));

test('keeps the copy control active while hiding the text tooltip on the button', () => {
  jest.useFakeTimers();
  const { container, unmount } = render(<CopyableText value='full-resource-name' placement='auto' />);
  const root = container.querySelector('.fc-copyable-text')!;
  const content = container.querySelector('.fc-copyable-text__content')!;
  const button = screen.getByRole('button');
  Object.defineProperties(content, { scrollWidth: { value: 200 }, clientWidth: { value: 80 } });
  fireEvent.mouseEnter(content);
  act(() => jest.advanceTimersByTime(500));
  expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  expect(screen.getByRole('tooltip')).toHaveTextContent('full-resource-name');
  fireEvent.mouseLeave(content, { relatedTarget: button });
  fireEvent.mouseEnter(button, { relatedTarget: content });
  act(() => jest.advanceTimersByTime(500));
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(root).toHaveClass('fc-copyable-text--active');
  fireEvent.mouseLeave(root, { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(50));
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(root).toHaveClass('fc-copyable-text--active');
  fireEvent.mouseEnter(button);
  act(() => jest.advanceTimersByTime(100));
  expect(root).toHaveClass('fc-copyable-text--active');
  fireEvent.mouseLeave(root, { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(200));
  expect(root).not.toHaveClass('fc-copyable-text--active');
  unmount();
  jest.useRealTimers();
});

test('ignores quick sweeps across adjacent values and cancels a pending reveal on leave', () => {
  jest.useFakeTimers();
  const { container, unmount } = render(
    <>
      <CopyableText value='group-name' placement='auto' />
      <CopyableText value='group-id' placement='auto' />
    </>,
  );
  const roots = container.querySelectorAll('.fc-copyable-text');
  fireEvent.mouseEnter(roots[0]);
  act(() => jest.advanceTimersByTime(120));
  fireEvent.mouseLeave(roots[0], { relatedTarget: roots[1] });
  fireEvent.mouseEnter(roots[1]);
  act(() => jest.advanceTimersByTime(120));
  fireEvent.mouseLeave(roots[1], { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(500));
  expect(container.querySelector('.fc-copyable-text--active')).toBeNull();
  fireEvent.mouseEnter(roots[1]);
  act(() => jest.advanceTimersByTime(200));
  expect(roots[1]).toHaveClass('fc-copyable-text--active');
  fireEvent.mouseLeave(roots[1], { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(100));
  expect(roots[1]).not.toHaveClass('fc-copyable-text--active');
  unmount();
  jest.useRealTimers();
});

test('shows keyboard focus immediately and hides after focus moves outside', () => {
  jest.useFakeTimers();
  const { container, unmount } = render(
    <>
      <CopyableText value='keyboard-value' placement='auto' />
      <button>Next action</button>
    </>,
  );
  const root = container.querySelector('.fc-copyable-text')!;
  act(() => screen.getByRole('button', { name: 'copy: keyboard-value' }).focus());
  expect(root).toHaveClass('fc-copyable-text--active');
  fireEvent.mouseLeave(root, { relatedTarget: document.body });
  act(() => jest.advanceTimersByTime(200));
  expect(root).toHaveClass('fc-copyable-text--active');
  act(() => screen.getByRole('button', { name: 'Next action' }).focus());
  act(() => jest.advanceTimersByTime(100));
  expect(root).not.toHaveClass('fc-copyable-text--active');
  unmount();
  jest.useRealTimers();
});

test('does not repeat fully visible text in a tooltip', () => {
  jest.useFakeTimers();
  const { unmount } = render(<CopyableText value='short-name' placement='auto' />);
  fireEvent.mouseEnter(screen.getByText('short-name'));
  act(() => jest.advanceTimersByTime(500));
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.mouseEnter(screen.getByRole('button'));
  act(() => jest.advanceTimersByTime(500));
  expect(screen.queryByRole('tooltip')).toBeNull();
  unmount();
  jest.useRealTimers();
});
