/** @jest-environment jsdom */
import React from 'react';
import { renderHook, render, fireEvent, screen } from '@testing-library/react';
import { notification } from 'antd';
import { errorHandler } from '@/utils/request';
import DocumentDrawer from '@/components/DocumentDrawer';
import useQuerySyntaxError from './useQuerySyntaxError';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({ darkMode: false }) }));
jest.mock('antd', () => ({ notification: { error: jest.fn(), close: jest.fn() } }));
jest.mock('@/utils/request', () => ({
  errorHandler: jest.fn((error) => {
    throw error;
  }),
}));
jest.mock('@/components/DocumentDrawer', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/UsageDocs', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('@/pages/logExplorer/constants', () => ({ NAME_SPACE: 'log_explorer' }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }) }));

const parserError = { message: 'expected operator after field', status: 200 };

it('uses one notification key for concurrent log and trend errors and exposes the guide link', () => {
  const { result } = renderHook(() => useQuerySyntaxError('run-one'));
  expect(() => result.current.errorHandler(parserError as any)).toThrow('query_error.hint');
  expect(() => result.current.errorHandler(parserError as any)).toThrow('query_error.hint');
  const notices = (notification.error as jest.Mock).mock.calls.map(([notice]) => notice);
  expect(notices).toHaveLength(2);
  expect(notices[0].key).toBe(notices[1].key);
  expect(notices[0].message).toBe('query_error.title');
  expect(errorHandler).not.toHaveBeenCalled();
  render(notices[0].description);
  fireEvent.click(screen.getByRole('button', { name: 'query_error.more guidance.docs →' }));
  expect(DocumentDrawer).toHaveBeenCalledWith(expect.objectContaining({ type: 'iframe', documentPath: expect.stringContaining('what-is-query-mode-in-doris-discover') }));
  expect(notification.close).toHaveBeenCalledWith(notices[0].key);
});

it('preserves the global handler for unrelated errors', () => {
  const { result } = renderHook(() => useQuerySyntaxError('run-one'));
  const failure = new Error('network unavailable');
  expect(() => result.current.errorHandler(failure as any)).toThrow(failure);
  expect(errorHandler).toHaveBeenCalledWith(failure);
  expect(notification.error).not.toHaveBeenCalled();
});

it('closes the old guidance on a new query and prevents late notifications after unmount', () => {
  const { result, rerender, unmount } = renderHook(({ run }) => useQuerySyntaxError(run), { initialProps: { run: 'one' } });
  const oldHandler = result.current.errorHandler;
  expect(() => oldHandler(parserError as any)).toThrow('query_error.hint');
  const key = (notification.error as jest.Mock).mock.calls[0][0].key;
  rerender({ run: 'two' });
  expect(notification.close).toHaveBeenCalledWith(key);
  (notification.error as jest.Mock).mockClear();
  expect(() => oldHandler(parserError as any)).toThrow('query_error.hint');
  expect(notification.error).not.toHaveBeenCalled();
  unmount();
  (notification.error as jest.Mock).mockClear();
  expect(() => oldHandler(parserError as any)).toThrow('query_error.hint');
  expect(notification.error).not.toHaveBeenCalled();
});
