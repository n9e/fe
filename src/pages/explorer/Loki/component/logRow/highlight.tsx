import React from 'react';
import _ from 'lodash';
import { AnsiUp } from 'ansi_up';
interface IProps {
  text: string;
  keyword: string[];
  prettifyJson: boolean;
}

const HighlightText = (props: IProps) => {
  const { text, keyword, prettifyJson } = props;

  // 检查是否为有效的JSON字符串
  let formattedText = text;
  if (prettifyJson) {
    try {
      const parsedJson = JSON.parse(text);
      formattedText = JSON.stringify(parsedJson, null, 2);
    } catch (error) {
      // 不是JSON字符串，保持原样
    }
  }

  // 转义特殊字符
  const escapedKeywords = keyword.map((k) => k.replace(/[.*+?^${}()\s|[\]\\]/g, '\\$&'));

  // 生成新的正则表达式，对关键字进行分组
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'g');

  // 转义<>之间有内容<>
  const tagPattern = /<.+?>/g;
  formattedText = formattedText.replace(tagPattern, (match) => {
    return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });

  // 转义彩色日志Ansi码
  const ansiUp = new AnsiUp();
  let escapeAnsiText = ansiUp.ansi_to_html(formattedText);

  // 高亮所有keyWords
  const highlightedText = escapeAnsiText.replace(regex, (match, group) => {
    return group ? `<span style="background-color: #FAD34A;color:#262626">${group}</span>` : match;
  });

  return <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

export default React.memo(HighlightText, (prevProps, nextProps) => _.isEqual(prevProps, nextProps));
