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
import React, { useEffect, useMemo, useRef } from 'react';
import _ from 'lodash';
import { Tooltip } from 'antd';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import type { IGaugeStyles, IOptions } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import useStableValue from '../../../hooks/useStableValue';
import Gauge, { ARC_GAUGE_HEIGHT_TO_WIDTH_RATIO } from './Gauge';
import { calculateGaugeLayout } from './layout';
import './style.less';

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
  isPreview?: boolean;
  dataRevision?: number;
}

const ITEM_SPACING = 2;

interface GaugeValue {
  name?: string;
  stat: number;
  metric: Record<string, string | undefined>;
  value?: string | number;
  unit?: string;
  color?: string;
}
interface GaugeItemProps {
  item: GaugeValue;
  options: IOptions;
  themeMode?: 'dark';
  style?: React.CSSProperties;
  valueField?: string;
  custom: IGaugeStyles;
  data?: Array<[number, number | string | null]>;
}
interface GaugeItemContentProps extends GaugeItemProps {
  eleSize?: { width?: number; height?: number };
}

function GaugeItemContent(props: GaugeItemContentProps) {
  const { eleSize, item, themeMode, options, custom } = props;
  const availableWidth = eleSize?.width ?? 0;
  const availableHeight = eleSize?.height ?? 0;
  const width = Math.min(availableWidth * 0.98, availableHeight / (custom.style === 'circle' ? 1 : ARC_GAUGE_HEIGHT_TO_WIDTH_RATIO));
  const min = options?.standardOptions?.min ?? 0;
  const max = options?.standardOptions?.max ?? 100;
  const thresholdColor = getSerieTextObj(item.stat, options?.standardOptions, options?.valueMappings, options?.thresholds, [min, max]).color;

  if (!eleSize?.width) return null;

  return (
    <div className='renderer-gauge-item-content-chart'>
      <Gauge
        min={min}
        max={max}
        value={item.stat}
        formattedValue={item.value}
        valueUnit={item.unit}
        name={item.name}
        color={thresholdColor || item.color}
        bgColor={themeMode === 'dark' ? 'rgb(40, 42, 46)' : '#f4f5f5'}
        width={width}
        height={width}
        thresholds={options.thresholds}
        custom={custom}
        data={props.data}
      />
    </div>
  );
}

function GaugeItem(props: GaugeItemProps) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { style, options, valueField } = props;
  let item = props.item;
  const metricTooltip = _.map(item.metric, (value, key) => <div key={key}>{key === '__name__' ? value : `${key}: ${value}`}</div>);

  if (valueField !== 'Value') {
    const value = _.get(item, ['metric', valueField as string]);
    if (!_.isNaN(_.toNumber(value))) {
      const result = getSerieTextObj(
        value,
        {
          unit: options?.standardOptions?.unit,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
        options?.thresholds,
      );
      item.value = result?.value as string | number | undefined;
      item.unit = result?.unit;
      item.color = result?.color;
    } else {
      item.value = value;
    }
  }

  const gaugeItem = (
    <div key={item.name} className='renderer-gauge-item' ref={ele} style={style}>
      <div className='renderer-gauge-item-content'>
        <GaugeItemContent {...props} eleSize={eleSize} />
      </div>
    </div>
  );

  if (Object.keys(item.metric).length === 0) return gaugeItem;

  return (
    <Tooltip overlayClassName='ant-tooltip-max-width-600' title={metricTooltip}>
      {gaugeItem}
    </Tooltip>
  );
}

const getColumnsKeys = (data: Array<{ metric: Record<string, string | undefined> }>) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

export default function Index(props: IProps) {
  const { values, series, themeMode, isPreview } = props;
  const dataDependency = props.dataRevision ?? series;
  const { custom, options } = values;
  const stableCustom = useStableValue(custom);
  const stableOptions = useStableValue(options);
  // custom 为持久化 JSON 宽类型；先收窄为可选字段，再在展开后设置有效默认值。
  const rawCustom = (custom ?? {}) as unknown as Partial<IGaugeStyles>;
  const gaugeCustom: IGaugeStyles = {
    ...rawCustom,
    calc: rawCustom.calc || 'lastNotNull',
    textMode: rawCustom.textMode || 'valueAndName',
    valueField: rawCustom.valueField ?? 'Value',
  };
  const { calc, valueField } = gaugeCustom;
  const orientation = gaugeCustom.orientation ?? 'auto';
  const calculatedValues = useMemo(
    () =>
      getCalculatedValuesBySeries(
        series,
        calc,
        {
          unit: options?.standardOptions?.unit,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
        options?.thresholds,
      ),
    [dataDependency, stableCustom, stableOptions],
  );
  const [statFields, setStatFields] = useGlobalState('statFields');
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const layout = useMemo(
    () => calculateGaugeLayout(eleSize?.width ?? 0, eleSize?.height ?? 0, ITEM_SPACING, calculatedValues.length, orientation),
    [eleSize?.width, eleSize?.height, calculatedValues.length, orientation],
  );

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
  }, [isPreview, dataDependency, stableCustom, stableOptions]);

  return (
    <div className='renderer-gauge-container'>
      <div className='renderer-gauge-container-box'>
        <div ref={ele} className='renderer-gauge-container-box-content'>
          {layout.length === calculatedValues.length &&
            _.map(calculatedValues, (item, idx) => {
              const itemLayout = layout[idx];
              return (
                <GaugeItem
                  key={item.id}
                  item={item as unknown as GaugeValue}
                  themeMode={themeMode}
                  options={options}
                  valueField={valueField}
                  custom={gaugeCustom}
                  data={series.find((serie) => serie.id === item.id)?.data}
                  style={{
                    position: 'absolute',
                    left: itemLayout.left,
                    top: itemLayout.top,
                    width: itemLayout.width,
                    height: itemLayout.height,
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
