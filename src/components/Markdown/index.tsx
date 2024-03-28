/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import classNames from 'classnames';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CommonStateContext } from '@/App';
import './index.less';

interface IMarkDownPros {
  content: string;
  style?: any;
  darkMode?: boolean;
}

dark['pre[class*="language-"]'] = {
  ...dark['pre[class*="language-"]'],
  background: '#161b22',
  border: '0 none',
  'box-shadow': 'none',
};

// https://github.com/vitejs/vite/issues/3592 bug solve 记录
const Markdown: React.FC<IMarkDownPros> = ({ content, style = {}, darkMode }) => {
  const currentDarkMode = darkMode ?? useContext(CommonStateContext)?.darkMode;

  return (
    <div className='markdown-wrapper' style={style}>
      <ReactMarkdown
        remarkPlugins={[gfm]}
        children={content}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} language={match[1]} PreTag='div' style={currentDarkMode ? dark : undefined} />
            ) : (
              <div
                className={classNames({
                  [className || '']: !!className,
                  'base-code': true,
                  'base-code-inline': inline,
                })}
              >
                <code {...props}>{children}</code>
              </div>
            );
          },
        }}
      />
    </div>
  );
};

export default Markdown;
