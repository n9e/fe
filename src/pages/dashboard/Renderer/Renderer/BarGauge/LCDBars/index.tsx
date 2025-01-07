import React from 'react';
import _ from 'lodash';

import { IRawTimeRange } from '@/components/TimeRangePicker';

import { IOptions, IBarGaugeStyles } from '../../../../types';

import LCDBar from './LCDBar';

interface Props {
  values: any[];
  custom: IBarGaugeStyles;
  options: IOptions;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
  time: IRawTimeRange;
  maxNameWidth: number;
  maxBarWidth: number;
}

export default function LCDBars(props: Props) {
  const { values } = props;

  return (
    <div className='renderer-bar-gauge-lcd'>
      {_.map(values, (item) => {
        return <LCDBar key={item.id} {...props} item={item} />;
      })}
    </div>
  );
}
