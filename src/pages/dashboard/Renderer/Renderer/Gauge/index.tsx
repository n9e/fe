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
import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { Tooltip } from 'antd';
import { useSize } from 'ahooks';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import { useGlobalState } from '../../../globalState';
import Gauge from './Gauge';
import { calculateGridDimensions } from '../../utils/squares';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  isPreview?: boolean;
}

interface IGrid {
  height: number;
  width: number;
  widthOnLastRow: number;
  xCount: number;
  yCount: number;
}

const MIN_SIZE = 12;
const ITEM_SPACIING = 8;

function GaugeItemContent(props) {
  const { eleSize, realHeaderFontSize, item, themeMode, options } = props;
  const height = eleSize?.height! - realHeaderFontSize;
  const width = eleSize?.width! > height ? height : eleSize?.width;

  if (!eleSize?.width) return null;

  return (
    <div className='renderer-gauge-item-content-chart'>
      <Gauge
        min={options?.standardOptions?.min}
        max={options?.standardOptions?.max}
        value={item.stat}
        formatedValue={item.value}
        valueUnit={item.unit}
        color={item.color}
        bgColor={themeMode === 'dark' ? '#404456' : '#eeeeee'}
        width={width}
        height={width}
        thresholds={options.thresholds}
      />
    </div>
  );
}

function GaugeItemLabel(props) {
  const { eleSize, realHeaderFontSize, name } = props;

  if (!eleSize?.width) return null;
  return (
    <div
      className='renderer-gauge-header'
      style={{
        width: eleSize?.width,
        fontSize: realHeaderFontSize > 24 ? 24 : realHeaderFontSize,
      }}
    >
      {name}
    </div>
  );
}

function GaugeItem(props) {
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const { textMode = 'valueAndName', style, options, valueField } = props;
  const headerFontSize = eleSize?.width! / _.toString(props.item.name).length || MIN_SIZE;
  const realHeaderFontSize = headerFontSize > 24 ? 24 : headerFontSize;
  let item = props.item;

  if (valueField !== 'Value') {
    const value = _.get(item, ['metric', valueField]);
    if (!_.isNaN(_.toNumber(value))) {
      const result = getSerieTextObj(
        value,
        {
          unit: options?.standardOptions?.util,
          decimals: options?.standardOptions?.decimals,
          dateFormat: options?.standardOptions?.dateFormat,
        },
        options?.valueMappings,
        options?.thresholds,
      );
      item.value = result?.value;
      item.unit = result?.unit;
      item.color = result?.color;
    } else {
      item.value = value;
    }
  }

  return (
    <Tooltip title={item.name}>
      <div key={item.name} className='renderer-gauge-item' ref={ele} style={style}>
        <div className='renderer-gauge-item-content'>
          <GaugeItemContent {...props} eleSize={eleSize} realHeaderFontSize={realHeaderFontSize} />
          {textMode === 'valueAndName' && <GaugeItemLabel eleSize={eleSize} realHeaderFontSize={realHeaderFontSize} name={item.name} />}
        </div>
      </div>
    </Tooltip>
  );
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

export default function Index(props: IProps) {
  const { values, series, themeMode, isPreview } = props;
  const { custom, options } = values;
  const { calc, textMode, valueField = 'Value' } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
    },
    options?.valueMappings,
    options?.thresholds,
  );
  const [statFields, setStatFields] = useGlobalState('statFields');
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const [grid, setGrid] = React.useState<IGrid>();
  let xGrid = 0;
  let yGrid = 0;

  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
    if (eleSize?.width) {
      const grid = calculateGridDimensions(eleSize.width, eleSize.height, ITEM_SPACIING, calculatedValues.length);
      setGrid(grid);
    }
  }, [isPreview, JSON.stringify(calculatedValues), eleSize?.width]);

  return (
    <div className='renderer-gauge-container'>
      <div className='renderer-gauge-container-box scroll-container'>
        <div ref={ele} className='renderer-gauge-container-box-content'>
          {grid &&
            _.map(calculatedValues, (item, idx) => {
              const isLastRow = yGrid === grid.yCount - 1;
              const itemWidth = isLastRow ? grid.widthOnLastRow : grid.width;
              const itemHeight = grid.height;
              const xPos = xGrid * itemWidth + ITEM_SPACIING * xGrid;
              const yPos = yGrid * itemHeight + ITEM_SPACIING * yGrid;
              xGrid++;
              if (xGrid === grid.xCount) {
                xGrid = 0;
                yGrid++;
              }
              return (
                <GaugeItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  textMode={textMode}
                  themeMode={themeMode}
                  options={options}
                  valueField={valueField}
                  style={{
                    position: 'absolute',
                    left: xPos,
                    top: yPos,
                    width: `${itemWidth}px`,
                    height: `${itemHeight}px`,
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
