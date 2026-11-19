/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { AiButton, useAiChatOpenWithPrompt } from './FlashAiButton';
import { EPageType } from '../AiChat/config';

const mockSetVisible = jest.fn();
const mockSetExternalConfig = jest.fn();
const mockSetParamsAiAction = jest.fn();

jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
jest.mock('@/components/AiChat/AiBtn/LayoutHeaderAiBtn', () => () => null);
jest.mock('react-i18next', () => ({ useTranslation: () => ({ i18n: { language: 'zh_CN' } }) }));
jest.mock('react-router-dom', () => ({ useLocation: () => ({ pathname: '/' }) }));
jest.mock('./context', () => ({ useAiChatContext: () => ({ openAiChat: jest.fn(), cachedSessionId: 'nightingale-session' }) }));
jest.mock('./recommend', () => ({ buildPageFrom: jest.fn(), getCurrentPageUrl: jest.fn(), getRecommendByUrl: jest.fn() }));
jest.mock('../AiChat/utils/useHook', () => ({
  useAiChatVisible: () => [false, mockSetVisible],
  useAiExternalConfig: () => [undefined, mockSetExternalConfig],
  useParamsAiAction: () => [undefined, mockSetParamsAiAction],
}));

const references = [{ id: 'ref-1', name: 'CPU', type: 'skill', skill: { name: 'cpu-analysis' } }];

test.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
])('passes autoExecute=%s and reuseConversation=%s to FlashAI', (autoExecute, reuseConversation) => {
  const { result } = renderHook(() => useAiChatOpenWithPrompt(' check @CPU ', { autoExecute, reuseConversation, references }));

  act(() => result.current());

  expect(mockSetVisible).toHaveBeenCalledWith(true);
  expect(mockSetParamsAiAction).toHaveBeenCalledWith({
    page: EPageType.Custom,
    custom: {
      content: 'check @CPU',
      prefillOnly: !autoExecute,
      createNew: !reuseConversation,
      reuseConversation,
      references,
      forceDrawer: true,
    },
  });
});

test('passes an empty prompt and keeps the reuse preference', () => {
  const { result } = renderHook(() => useAiChatOpenWithPrompt('  ', { autoExecute: true, reuseConversation: true }));
  act(() => result.current());
  expect(mockSetParamsAiAction).toHaveBeenCalledWith(expect.objectContaining({ custom: expect.objectContaining({ content: '', reuseConversation: true, createNew: false }) }));
});

test('preserves other AI button launch options', () => {
  render(
    <AiButton queryAction={{ content: 'explain', prefillOnly: false }} promptList={['example']}>
      Open
    </AiButton>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open' }));
  expect(mockSetExternalConfig).toHaveBeenCalledWith({ promptList: ['example'] });
  expect(mockSetParamsAiAction).toHaveBeenCalledWith({
    page: EPageType.Custom,
    custom: { content: 'explain', prefillOnly: false, createNew: true, forceDrawer: true },
  });
});
