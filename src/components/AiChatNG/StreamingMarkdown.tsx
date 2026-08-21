import React, { useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Streamdown, useIsCodeFenceIncomplete } from 'streamdown';

import { copy2ClipBoard } from '@/utils';

import '@/components/Markdown/index.less';
import '@/components/Markdown/typora-theme-lark.less';

dark['pre[class*="language-"]'] = {
  ...dark['pre[class*="language-"]'],
  background: '#161b22',
  border: '0 none',
  'box-shadow': 'none',
};

type IStreamingCodeProps = React.ComponentPropsWithoutRef<'code'> & {
  node?: unknown;
  'data-block'?: string;
};

type IStreamingElementProps = React.HTMLAttributes<HTMLElement> & {
  node?: unknown;
};

function createNativeElement(tag: keyof JSX.IntrinsicElements) {
  return function NativeElement({ node: _node, ...props }: IStreamingElementProps) {
    return React.createElement(tag, props);
  };
}

function StreamingInlineCode({ node: _node, className, children, ...props }: IStreamingCodeProps) {
  return (
    <div className={className || 'base-code base-code-inline'}>
      <code {...props}>{children}</code>
    </div>
  );
}

function StreamingCode({ node: _node, className, children, 'data-block': isBlock, ...props }: IStreamingCodeProps) {
  const { t } = useTranslation('common');
  const isIncomplete = useIsCodeFenceIncomplete();
  const isDarkMode = useDarkMode();

  if (!isBlock) {
    return (
      <div className={className || 'base-code base-code-inline'}>
        <code {...props}>{children}</code>
      </div>
    );
  }

  const code = String(children).replace(/\n$/, '');
  const language = /language-(\w+)/.exec(className || '')?.[1];

  // 未闭合围栏仍可能继续增长，只显示普通代码文本；围栏闭合后再高亮。
  if (isIncomplete) {
    return (
      <div className='base-code'>
        <code {...props} className={className}>
          {children}
        </code>
      </div>
    );
  }

  const codeContent = language ? (
    <SyntaxHighlighter {...props} language={language} PreTag='div' style={isDarkMode ? dark : undefined}>
      {code}
    </SyntaxHighlighter>
  ) : (
    <div className={className || 'base-code'}>
      <code {...props}>{children}</code>
    </div>
  );

  return (
    <div className='markdown-code-block'>
      <Tooltip title={t('btn.copy2')}>
        <Button
          className='markdown-code-copy-btn'
          size='small'
          type='text'
          icon={<CopyOutlined />}
          onClick={() => {
            copy2ClipBoard(code);
          }}
        />
      </Tooltip>
      {codeContent}
    </div>
  );
}

function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => (typeof document === 'undefined' ? false : document.body.classList.contains('theme-dark')));

  useEffect(() => {
    const update = () => {
      setIsDarkMode(document.body.classList.contains('theme-dark'));
    };
    window.addEventListener('n9e-dark-mode-update', update);
    return () => {
      window.removeEventListener('n9e-dark-mode-update', update);
    };
  }, []);

  return isDarkMode;
}

function StreamingPre({ node: _node, children, ...props }: IStreamingElementProps) {
  const code = React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<IStreamingCodeProps>, { 'data-block': 'true' }) : children;

  // 与现有 Markdown 保持一致：保留 pre 的 white-space 语义，避免 AI 输出的换行被折叠。
  return <pre {...props}>{code}</pre>;
}

const components = {
  a: createNativeElement('a'),
  blockquote: createNativeElement('blockquote'),
  code: StreamingCode,
  h1: createNativeElement('h1'),
  h2: createNativeElement('h2'),
  h3: createNativeElement('h3'),
  h4: createNativeElement('h4'),
  h5: createNativeElement('h5'),
  h6: createNativeElement('h6'),
  hr: createNativeElement('hr'),
  img: createNativeElement('img'),
  inlineCode: StreamingInlineCode,
  li: createNativeElement('li'),
  ol: createNativeElement('ol'),
  p: createNativeElement('p'),
  pre: StreamingPre,
  section: createNativeElement('section'),
  strong: createNativeElement('strong'),
  sub: createNativeElement('sub'),
  sup: createNativeElement('sup'),
  table: createNativeElement('table'),
  tbody: createNativeElement('tbody'),
  td: createNativeElement('td'),
  th: createNativeElement('th'),
  thead: createNativeElement('thead'),
  tr: createNativeElement('tr'),
  ul: createNativeElement('ul'),
};

export default React.memo(function StreamingMarkdown({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div className='typora-theme-lark ai-chat-streamdown'>
      <Streamdown
        isAnimating={isStreaming}
        mode={isStreaming ? 'streaming' : 'static'}
        components={components}
        className='!space-y-0'
        controls={false}
        lineNumbers={false}
        linkSafety={{ enabled: false }}
      >
        {content}
      </Streamdown>
    </div>
  );
});
