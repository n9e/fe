import React from 'react';

import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IPanel, ITextStyles } from '../../../types';
import Markdown from '../../../Editor/Components/Markdown';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

export default function index(props: IProps) {
  const { values, themeMode } = props;
  const { custom } = values;
  const { textColor, textDarkColor, bgColor, textSize, justifyContent, alignItems } = custom as ITextStyles;
  const content = replaceTemplateVariables(custom.content);

  return (
    <Markdown
      content={content}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 10,
        fontSize: textSize,
        color: themeMode === 'dark' ? textDarkColor : textColor,
        backgroundColor: bgColor,
        display: justifyContent !== 'unset' && alignItems !== 'unset' ? 'flex' : 'block',
        justifyContent,
        alignItems,
      }}
    />
  );
}
