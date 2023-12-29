import React, { useState, useEffect, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import gfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import classNames from 'classnames';
import { CommonStateContext } from '@/App';
import { getInstructionsByName } from '../services';
import './style.less';

dark['pre[class*="language-"]'] = {
  ...dark['pre[class*="language-"]'],
  background: '#161b22',
  border: '0 none',
  'box-shadow': 'none',
};

interface Props {
  name: string;
}

export default function Instructions(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { name } = props;
  const [data, setData] = useState<string>('');

  useEffect(() => {
    if (name) {
      getInstructionsByName(name).then((res) => {
        setData(res);
      });
    }
  }, [name]);

  return (
    <div>
      <ReactMarkdown
        className='instructions-markdown-body'
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[gfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} language={match[1]} PreTag='div' style={darkMode ? dark : undefined} />
            ) : (
              <code
                {...props}
                className={classNames({
                  [className || '']: !!className,
                  'base-code': true,
                  'base-code-inline': inline,
                })}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {data || 'No Data'}
      </ReactMarkdown>
    </div>
  );
}
