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

  it('lists the steps a tool group took, marking the last one as still running until the group finishes', () => {
    const group = {
      command_count: 2,
      read_file_count: 0,
      edit_file_count: 0,
      items: [
        { content_type: 'tool', content: '检索指标名' },
        { content_type: 'tool', content: '查询指标序列' },
      ],
    };
    render(<ResponseBlocks {...responseBlocksProps} message={message([{ content_type: EAiChatContentType.ToolGroup, content: '', is_finish: false, param: group }])} />);
    expect(screen.getByText('检索指标名')).toBeTruthy();
    expect(screen.getByText('查询指标序列')).toBeTruthy();
    expect(screen.queryByText(/暂不支持|unsupported_type/)).toBeNull();
  });

  it('shows the question the assistant asked and sends a chosen option as the answer', () => {
    const onOK = jest.fn();
    const request = {
      question: '要看哪个数据源？',
      options: [
        { id: '1', label: 'prod' },
        { id: '2', label: 'staging' },
      ],
    };
    render(
      <ResponseBlocks
        {...responseBlocksProps}
        onOKForFormSelectContent={onOK}
        message={message([{ content_type: EAiChatContentType.InputRequest, content: '', is_finish: true, param: request }], true)}
      />,
    );
    expect(screen.getByText('要看哪个数据源？')).toBeTruthy();
    screen.getByText('prod').click();
    expect(onOK).toHaveBeenCalledWith({}, 'prod');
  });
});
