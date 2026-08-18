import React from 'react';
import _ from 'lodash';

import { IOptions, IBarGaugeStyles } from '../../../../types';
import type { BarGaugeValue } from '../utils';

import LCDBar from './LCDBar';

interface Props {
  values: BarGaugeValue[];
  custom: IBarGaugeStyles;
  options: IOptions;
  themeMode?: 'dark';
  minValue: number;
  maxValue: number;
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
