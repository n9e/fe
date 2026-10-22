/** @jest-environment jsdom */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import AiButton from './index';
import type { IPanel } from '../../../types';

const mockOpen = jest.fn();

jest.mock('@/App', () => {
  const ReactActual = jest.requireActual('react');
  return {
    CommonStateContext: ReactActual.createContext({ aiStatus: true }),
  };
});

jest.mock('@/utils/constant', () => ({
  IS_ENT: false,
}));

jest.mock('@/components/AiChatNG/FlashAiButton', () => ({
  useAiChatOpenWithPrompt: (prompt?: string) => () => mockOpen(prompt),
}));

jest.mock('@/components/AiChat/images/ai-chat/ai_chat_icon.svg', () => ({
  __esModule: true,
  default: 'ai_chat_icon.svg',
}));

jest.mock('@/pages/dashboard/Variables/utils/replaceTemplateVariables', () => ({
  __esModule: true,
  default: (value: string) => value.replace(/\$host/g, 'web-1'),
}));

function renderButton(custom: IPanel['custom']) {
  const values = {
    id: 'ai-1',
    name: '',
    description: '',
    type: 'aiButton',
    layout: { h: 2, w: 4, x: 0, y: 0, i: 'ai-1' },
    targets: [],
    options: {},
    custom,
    overrides: [],
  } satisfies IPanel;

  return render(<AiButton values={values} series={[]} />);
}

beforeEach(() => {
  mockOpen.mockClear();
});

test('renders the capsule, icon and antd button styles', () => {
  const capsule = renderButton({ style: 'capsule', text: 'Ask AI' });
  expect(screen.getByRole('button', { name: 'Ask AI' }).className).toContain('rounded-full');
  capsule.unmount();

  const icon = renderButton({ style: 'icon', text: 'Ask AI' });
  const iconButton = screen.getByRole('button', { name: 'Nightingale AI' });
  const images = iconButton.querySelectorAll('img');
  expect(images).toHaveLength(2);
  expect(images[0]).toHaveAttribute('src', 'ai_chat_icon.svg');
  expect(images[1]).toHaveAttribute('src', '/image/ai-chat/ai.gif');
  expect(images[1].className).toContain('clip-path');
  icon.unmount();

  renderButton({ style: 'antd', text: 'Ask AI', type: 'dashed' });
  const antdButton = screen.getByRole('button', { name: 'Ask AI' });
  expect(antdButton).toHaveClass('ant-btn-dashed');
  expect(antdButton.querySelector('img')).not.toBeInTheDocument();
});

test('opens AI chat with the variable-replaced prompt', () => {
  renderButton({ style: 'capsule', text: 'Ask AI', prompt: 'check $host cpu' });

  fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));

  expect(mockOpen).toHaveBeenCalledWith('check web-1 cpu');
});

test('uses the default label when button text is empty', () => {
  renderButton({ style: 'capsule', text: '' });

  expect(screen.getByRole('button', { name: 'Nightingale AI' })).toBeInTheDocument();
});
