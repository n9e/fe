import React from 'react';

import { useReplaceTemplateVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IPanel, ITextStyles } from '../../../types';
import Markdown from '../../../Components/Markdown';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
}

export default function index(props: IProps) {
  const replaceTemplateVariables = useReplaceTemplateVariables();
  const { values, themeMode } = props;
  const custom = (values.custom ?? {}) as Partial<ITextStyles>;
  const { textColor = '#000000', textDarkColor = '#FFFFFF', bgColor = 'rgba(0, 0, 0, 0)', textSize = 12, justifyContent = 'center', alignItems = 'center', content = '' } = custom;
  const resolvedContent = replaceTemplateVariables(content);

  return (
    <Markdown
      content={resolvedContent}
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
