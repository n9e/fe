/** @jest-environment jsdom */
import React from 'react';
import { act, renderHook } from '@testing-library/react';

import { AiChatProvider, useAiChatContext } from './context';

jest.mock('./recommend', () => ({ buildPageFrom: () => ({ url: '/dashboards' }) }));
jest.mock('./share', () => ({ cleanShareParamsFromUrl: jest.fn() }));

const wrapper = ({ children }: { children: React.ReactNode }) => <AiChatProvider>{children}</AiChatProvider>;

beforeEach(() => window.localStorage.clear());

test('button launches reset or retain the session according to reuse', () => {
  const { result } = renderHook(() => useAiChatContext(), { wrapper });
  act(() => result.current.setCachedSessionId('previous'));
  act(() => result.current.openAiChat({ chatId: 'previous', buttonLaunch: { content: 'first', autoExecute: false, reuseConversation: true } }));
  expect(result.current.pendingChatId).toBe('previous');
  expect(result.current.buttonChatKey).toBe(0);
  expect(result.current.buttonLaunch).toMatchObject({ content: 'first', autoExecute: false });
  const firstId = result.current.buttonLaunch?.id;

  act(() => result.current.openAiChat({ buttonLaunch: { content: '', autoExecute: true, reuseConversation: false } }));
  expect(result.current.pendingChatId).toBeUndefined();
  expect(result.current.cachedSessionId).toBeUndefined();
  expect(result.current.buttonChatKey).toBe(1);
  expect(result.current.buttonLaunch?.id).not.toBe(firstId);
});
