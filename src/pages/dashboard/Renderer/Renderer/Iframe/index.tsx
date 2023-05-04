import React from 'react';
import { IPanel, IIframeStyles } from '../../../types';
import { replaceFieldWithVariable, getOptionsList } from '../../../VariableConfig/constant';
import { useGlobalState } from '../../../globalState';
import { IRawTimeRange } from '@/components/TimeRangePicker';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
}

export default function index(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { values, time } = props;
  const { custom } = values;
  const { src } = custom as IIframeStyles;
  const content = replaceFieldWithVariable(src, dashboardMeta.dashboardId, getOptionsList(dashboardMeta, time));

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
