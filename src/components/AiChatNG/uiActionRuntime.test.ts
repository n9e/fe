/** @jest-environment jsdom */
import type { ModalFuncProps } from 'antd';

const modalConfirm = jest.fn();
jest.mock('antd', () => ({
  Modal: {
    confirm: (options: ModalFuncProps) => modalConfirm(options),
  },
}));

jest.mock('@flashcatcloud/ai-kit/actions', () => ({
  createDomFeedback: jest.fn(() => ({})),
  getSharedActionRuntime: jest.fn(() => ({ pageContext: () => null })),
}));

import { confirmUiAction } from './uiActionRuntime';

describe('confirmUiAction', () => {
  beforeEach(() => {
    modalConfirm.mockReset();
  });

  it('renders the action prompt and resolves true only when confirmed', async () => {
    const approval = confirmUiAction({
      action: 'fill_log_template_pattern',
      prompt: '覆盖现有正则表达式？',
      args: { pattern: '(?P<level>INFO)' },
      scope: 'call',
      actionLabel: '确认覆盖',
    });
    const options = modalConfirm.mock.calls[0][0] as ModalFuncProps;

    expect(options).toEqual(expect.objectContaining({ title: '覆盖现有正则表达式？', okText: '确认覆盖', closable: true, maskClosable: true }));
    options.onOk?.();
    await expect(approval).resolves.toBe(true);
  });

  it.each(['cancel button', 'close button or mask'])('resolves false when the user dismisses via %s', async () => {
    const approval = confirmUiAction({
      action: 'fill_log_template_pattern',
      prompt: '覆盖现有 Grok Pattern？',
      args: { pattern: '%{WORD:level}' },
      scope: 'call',
      actionLabel: '确认覆盖',
    });
    const options = modalConfirm.mock.calls[0][0] as ModalFuncProps;

    options.onCancel?.();
    await expect(approval).resolves.toBe(false);
  });
});
