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
import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './index.less';

interface IMarkDownPros {
  content: string;
  style?: any;
}

// https://github.com/vitejs/vite/issues/3592 bug solve 记录
const Markdown: React.FC<IMarkDownPros> = ({ content, style = {} }) => {
  return (
    <div className='dashboard-markdown-wrapper' style={style}>
      <ReactMarkdown remarkPlugins={[gfm]} children={content} rehypePlugins={[rehypeRaw]} />
    </div>
  );
};

export default Markdown;
