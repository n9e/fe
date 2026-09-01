/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import { ResponseBlocks } from './MessageBlocks';
import { EAiChatContentType, IAiChatMessage } from './types';

jest.mock('./StreamingMarkdown', () => ({
  __esModule: true,
  default: ({ content, isStreaming }: { content: string; isStreaming: boolean }) => (
    <output data-testid='streaming-markdown' data-streaming={String(isStreaming)}>
      {content}
    </output>
  ),
}));

jest.mock('react-i18next', () => ({
  Trans: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/utils/constant', () => ({ IS_ENT: false }));
jest.mock('./ContentRenderer/QueryContentBlock', () => () => null);
jest.mock('./ContentRenderer/FormSelectContentBlock', () => () => null);
jest.mock('./ContentRenderer/AlertRuleContentBlock', () => () => null);
jest.mock('./ContentRenderer/DashboardContentBlock', () => () => null);
jest.mock('./ContentRenderer/UIActionBlock', () => () => null);

const responseBlocksProps = {
  isStreaming: false,
  onActionClick: jest.fn(),
  onOKForFormSelectContent: jest.fn(),
};

function message(response: IAiChatMessage['response'], isFinish = false): IAiChatMessage {
  return {
    chat_id: 'chat-1',
    seq_id: 1,
    is_finish: isFinish,
    query: { content: '问题', page_from: { url: '/alert-rules' } },
    response,
  };
}

describe('ResponseBlocks（jsdom 集成）', () => {
  it('父级已停止时，未完成的 thinking 块也停止 streaming mode', () => {
    render(<ResponseBlocks {...responseBlocksProps} message={message([{ content_type: EAiChatContentType.Thinking, content: '正在思考', is_finish: false }])} />);

    expect(screen.getByTestId('streaming-markdown')).toHaveAttribute('data-streaming', 'false');
  });

  it('父级仍在流式且块未结束时，thinking 和 Markdown 都保持 streaming mode', () => {
    render(
      <ResponseBlocks
        {...responseBlocksProps}
        isStreaming
        message={message([
          { content_type: EAiChatContentType.Thinking, content: '思考中', is_finish: false },
          { content_type: EAiChatContentType.Markdown, content: '# 回答', is_finish: false },
        ])}
      />,
    );

    expect(screen.getAllByTestId('streaming-markdown')).toHaveLength(2);
    expect(screen.getAllByTestId('streaming-markdown').every((element) => element.dataset.streaming === 'true')).toBe(true);
  });

  it('块已结束时，即使父级仍处于流式消息，也使用 static mode', () => {
    render(<ResponseBlocks {...responseBlocksProps} isStreaming message={message([{ content_type: EAiChatContentType.Markdown, content: '已完成段落', is_finish: true }])} />);

    expect(screen.getByTestId('streaming-markdown')).toHaveAttribute('data-streaming', 'false');
  });
});
