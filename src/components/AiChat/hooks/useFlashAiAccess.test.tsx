/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CommonStateContext } from '@/App';
import { useCanAccessFlashAiChat, useCanShowFlashAiIntroduction } from './useFlashAiAccess';

jest.mock('@/App', () => ({ CommonStateContext: require('react').createContext({}) }));
jest.mock('@/utils/constant', () => ({ IS_ENT: true }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

function Entry() {
  return useCanAccessFlashAiChat() ? <button>AI entry</button> : null;
}

function Introduction() {
  return useCanShowFlashAiIntroduction('empty') ? <span>AI introduction</span> : null;
}

test.each([
  [['Standard'], false, [], false],
  [['Standard'], false, ['/flashAI'], true],
  [['Standard'], false, ['/flashai'], true],
  [['Admin'], false, [], true],
  [['Standard'], true, [], true],
  [['Standard'], false, ['/ai-config/llm-configs'], false],
])('matches the role and feature permission independently of other AI config permissions: %j / %s / %j', (roles, admin, perms, allowed) => {
  render(
    <CommonStateContext.Provider value={{ profile: { roles, admin }, perms, permsLoaded: true } as any}>
      <Entry />
    </CommonStateContext.Provider>,
  );
  expect(!!screen.queryByRole('button', { name: 'AI entry' })).toBe(allowed);
});

test.each([
  [['Standard'], [], 'show', false],
  [['Standard'], ['/flashai'], 'show', true],
  [['Admin'], [], 'show', true],
  [['Admin'], [], 'hide', false],
  [['Admin'], [], 'simplify', false],
])('gates AI introductions with access and the empty-page setting: %j / %j / %s', (roles, perms, emptyMode, allowed) => {
  render(
    <CommonStateContext.Provider value={{ profile: { roles }, perms, permsLoaded: true, emptyMode } as any}>
      <Introduction />
    </CommonStateContext.Provider>,
  );
  expect(!!screen.queryByText('AI introduction')).toBe(allowed);
});
