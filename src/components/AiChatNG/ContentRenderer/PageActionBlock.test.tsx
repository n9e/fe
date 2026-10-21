/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import PageActionBlock from './PageActionBlock';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../uiActionRuntime', () => ({
  uiActionRuntime: { has: () => true },
}));

describe('PageActionBlock', () => {
  it('does not repeat the runtime English failure prefix after the localized status', () => {
    render(
      <PageActionBlock
        request={{ call_id: 'call-1', name: 'fill_log_template_pattern', description: 'fill pattern', args: { pattern: '(?P<message>.*)' } }}
        outcome={{
          ok: false,
          status: 'failed',
          action: 'fill_log_template_pattern',
          message: 'The action failed: AI 生成的 Pattern 未通过预览：候选 Pattern 无法匹配完整日志样例',
        }}
      />,
    );

    expect(screen.getByText('page_action.failed：AI 生成的 Pattern 未通过预览：候选 Pattern 无法匹配完整日志样例')).toBeTruthy();
    expect(screen.queryByText(/The action failed/)).toBeNull();
  });
});
