/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import _ from 'lodash';
import G2PieChart from '@/components/G2PieChart';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';

import valueFormatter from '../../utils/valueFormatter';
import './style.less';
import { useGlobalState } from '../../../globalState';
import { IRawTimeRange } from '@/components/TimeRangePicker';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
}

export default function Pie(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const { values, series, themeMode, time } = props;
  const { custom, options } = values;
  const { calc, legengPosition, max, labelWithName, labelWithValue, detailUrl, detailName, donut = false } = custom;
  const dataFormatter = (text: number) => {
    const resFormatter = valueFormatter(
      {
        unit: options?.standardOptions?.util,
        decimals: options?.standardOptions?.decimals,
        dateFormat: options?.standardOptions?.dateFormat,
      },
      text,
    );
    return `${resFormatter.value}${resFormatter.unit}`;
  };

  const detailFormatter = (data: any) => {
    return getDetailUrl(detailUrl, data, dashboardMeta, time);
  };

  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
  );

  const sortedValues = calculatedValues.sort((a, b) => b.stat - a.stat);
  const data =
    max && sortedValues.length > max
      ? sortedValues
          .slice(0, max)
          .map((i) => ({ name: i.name, value: i.stat, metric: i.metric }))
          .concat({ name: '其他', value: sortedValues.slice(max).reduce((previousValue, currentValue) => currentValue.stat + previousValue, 0), metric: {} })
      : sortedValues.map((i) => ({ name: i.name, value: i.stat, metric: i.metric }));
  return (
    <div className='renderer-pie-container'>
      <G2PieChart
        themeMode={themeMode}
        data={data}
        positon={legengPosition !== 'hidden' ? legengPosition : undefined}
        hidden={legengPosition === 'hidden'}
        labelWithName={labelWithName}
        labelWithValue={labelWithValue}
        dataFormatter={dataFormatter}
        detailFormatter={detailFormatter}
        detailName={detailName}
        detailUrl={detailUrl}
        donut={donut}
      />
    </div>
  );
}
