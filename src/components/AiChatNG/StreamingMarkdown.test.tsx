/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import StreamingMarkdown from './StreamingMarkdown';

const streamdownProps = jest.fn();

jest.mock(
  'streamdown',
  () => ({
    Streamdown: ({ children, components, ...props }: any) => {
      streamdownProps(props);
      const H2 = components.h2;
      const Pre = components.pre;
      const Code = components.code;
      return (
        <section data-testid='streamdown'>
          <H2>二级标题</H2>
          <Pre>
            <Code>第一行{'\n'}第二行</Code>
          </Pre>
          <p>{children}</p>
        </section>
      );
    },
    useIsCodeFenceIncomplete: () => false,
  }),
  { virtual: true },
);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <code>{children}</code>,
}));
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ dark: {} }));
jest.mock('@/utils', () => ({ copy2ClipBoard: jest.fn() }));
jest.mock('@/components/Markdown/index.less', () => ({}));
jest.mock('@/components/Markdown/typora-theme-lark.less', () => ({}));

describe('StreamingMarkdown（jsdom 集成）', () => {
  beforeEach(() => {
    streamdownProps.mockClear();
  });

  it('流式阶段把 Streamdown 置为 streaming mode，并保留旧 Markdown 的标题和 pre 结构', () => {
    const { container } = render(<StreamingMarkdown content='原始 Markdown' isStreaming />);

    expect(streamdownProps).toHaveBeenCalledWith(
      expect.objectContaining({
        isAnimating: true,
        mode: 'streaming',
        controls: false,
        lineNumbers: false,
      }),
    );
    expect(screen.getByRole('heading', { level: 2, name: '二级标题' })).toBeInTheDocument();
    expect(container.querySelector('.typora-theme-lark pre .base-code')).toBeInTheDocument();
    expect(screen.getByText('原始 Markdown')).toBeInTheDocument();
  });

  it('流结束后切换为 static mode', () => {
    render(<StreamingMarkdown content='完整回答' isStreaming={false} />);

    expect(streamdownProps).toHaveBeenCalledWith(expect.objectContaining({ isAnimating: false, mode: 'static' }));
  });
});
