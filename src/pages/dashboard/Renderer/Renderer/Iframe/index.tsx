import React from 'react';
import { IPanel, IIframeStyles } from '../../../types';
import { replaceFieldWithVariable } from '../../../VariableConfig/constant';
import { useGlobalState } from '../../../globalState';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import moment from 'moment';

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
  const rangeTime = parseRange(time);
  const start = moment(rangeTime.start).unix();
  const startms = start * 1000;
  const end = moment(rangeTime.end).unix();
  const endms = end * 1000;
  const optionsList = [
    ...(dashboardMeta.variableConfigWithOptions ? dashboardMeta.variableConfigWithOptions : []),
    // 时间戳秒
    { name: '_start', value: start },
    // 时间戳毫秒
    { name: '_startms', value: startms },
    { name: '_end', value: end },
    { name: '_endms', value: endms },
  ];
  const content = replaceFieldWithVariable(src, dashboardMeta.dashboardId, optionsList);

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
