import React from 'react';
import Color from 'color';
import { IPanel, ITextStyles } from '../../../types';
import Markdown from '../../../Editor/Components/Markdown';
import { replaceFieldWithVariable } from '../../../VariableConfig/constant';
import { useGlobalState } from '../../../globalState';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
}

export default function index(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { values } = props;
  const { custom } = values;
  const { textColor, bgColor, textSize, justifyContent, alignItems } = custom as ITextStyles;
  const content = replaceFieldWithVariable(custom.content, dashboardMeta.dashboardId, dashboardMeta.variableConfigWithOptions);

  return (
    <Markdown
      content={content}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: 10,
        fontSize: textSize,
        color: textColor,
        backgroundColor: bgColor,
        border: `1px solid ${Color('#fff').alpha(0.2).rgb().string()}`,
        display: justifyContent !== 'unset' && alignItems !== 'unset' ? 'flex' : 'block',
        justifyContent,
        alignItems,
      }}
    />
  );
}
