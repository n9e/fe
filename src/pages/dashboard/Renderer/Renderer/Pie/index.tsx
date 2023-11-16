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
import React, { useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import G2PieChart from '@/components/G2PieChart';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import valueFormatter from '../../utils/valueFormatter';
import { useGlobalState } from '../../../globalState';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
  isPreview?: boolean;
}

const getColumnsKeys = (data: any[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

export default function Pie(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [statFields, setStatFields] = useGlobalState('statFields');
  const { values, series, themeMode, time, isPreview } = props;
  const { custom, options } = values;
  const { calc, legengPosition, max, labelWithName, labelWithValue, detailUrl, detailName, donut = false, valueField = 'Value' } = custom;
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

  let data: any[] = [];
  if (valueField !== 'Value') {
    data = _.map(
      _.groupBy(
        _.map(calculatedValues, (item) => {
          return {
            name: custom.valueField,
            value: _.get(item, ['metric', custom.valueField]),
          };
        }),
        'value',
      ),
      (vals, name) => {
        return {
          name,
          value: _.size(vals),
          metric: {
            [custom.valueField]: name,
          },
        };
      },
    );
  } else {
    const sortedValues = calculatedValues.sort((a, b) => b.stat - a.stat);
    data =
      max && sortedValues.length > max
        ? sortedValues
            .slice(0, max)
            .map((i) => ({ name: i.name, value: i.stat, metric: i.metric }))
            .concat({ name: 'Other', value: sortedValues.slice(max).reduce((previousValue, currentValue) => currentValue.stat + previousValue, 0), metric: {} })
        : sortedValues.map((i) => ({ name: i.name, value: i.stat, metric: i.metric }));
  }

  // 只有单个序列值且是背景色模式，则填充整个卡片的背景色
  useEffect(() => {
    // 当编辑状态是设置 statFields，同时关闭编辑后需要清空 statFields
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
  }, [isPreview, JSON.stringify(calculatedValues)]);

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
