import React from 'react';

import Markdown from './index';

interface Props {
  content: string;
  style?: React.CSSProperties;
  darkMode?: boolean;
}

export default function MarkdownWithTooltip(props: Props) {
  const { content, style, darkMode } = props;

  return <Markdown content={content} style={style} inTooltip={darkMode} />;
}
