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
  const form = moment(rangeTime.start).valueOf();
  const fromDateSeconds = moment(rangeTime.start).unix();
  const fromDateISO = moment(rangeTime.start).toISOString();
  const toDateSeconds = moment(rangeTime.end).valueOf();
  const to = moment(rangeTime.end).unix();
  const toDateISO = moment(rangeTime.end).toISOString();
  const optionsList = [
    ...(dashboardMeta.variableConfigWithOptions ? dashboardMeta.variableConfigWithOptions : []),
    { name: '__from', value: form },
    { name: '__from_date_seconds', value: fromDateSeconds },
    { name: '__from_date_iso', value: fromDateISO },
    { name: '__from_date', value: fromDateISO },
    { name: '__to', value: to },
    { name: '__to_date_seconds', value: toDateSeconds },
    { name: '__to_date_iso', value: toDateISO },
    { name: '__to_date', value: toDateISO },
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
