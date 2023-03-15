import React from 'react';
import { IPanel, IIframeStyles } from '../../../types';
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
  const { src } = custom as IIframeStyles;
  const content = replaceFieldWithVariable(src, dashboardMeta.dashboardId, dashboardMeta.variableConfigWithOptions);

  return (
    <iframe
      src={content}
      width='100%'
      height='100%'
      style={{
        border: 'none',
      }}
    />
  );
}
