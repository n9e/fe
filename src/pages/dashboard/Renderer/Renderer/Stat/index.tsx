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
import React, { useEffect, useState, useRef, useMemo } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { useSize } from 'ahooks';
import * as d3 from 'd3';
import '@fc-plot/ts-graph/dist/index.css';
import { IPanel } from '../../../types';
import { statHexPalette } from '../../../config';
import getCalculatedValuesBySeries from '../../utils/getCalculatedValuesBySeries';
import { calculateGridDimensions } from '../../utils/squares';
import { useGlobalState } from '../../../globalState';
import { getMinFontSizeByList, IGrid } from './utils';
import StatItemByColSpan from './StatItemByColSpan';
import StatItem from './StatItem';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  bodyWrapRef: {
    current: HTMLDivElement | null;
  };
  themeMode?: 'dark';
  isPreview?: boolean;
}

const ITEM_SPACIING = 2;

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

export default function Stat(props: IProps) {
  const { values, series, bodyWrapRef, isPreview } = props;
  const { custom, options } = values;
  const { calc, textMode, colorMode, colSpan, textSize, valueField, graphMode, orientation } = custom;
  const calculatedValues = getCalculatedValuesBySeries(
    series,
    calc,
    {
      unit: options?.standardOptions?.util,
      decimals: options?.standardOptions?.decimals,
      dateFormat: options?.standardOptions?.dateFormat,
      valueField,
    },
    options?.valueMappings,
    options?.thresholds,
  );
  const [isFullSizeBackground, setIsFullSizeBackground] = useState(false);
  const [statFields, setStatFields] = useGlobalState('statFields');
  const ele = useRef(null);
  const eleSize = useSize(ele);
  const [grid, setGrid] = useState<IGrid>();
  let xGrid = 0;
  let yGrid = 0;
  const minFontSize = useMemo(() => {
    if (eleSize?.width && eleSize?.height) {
      return getMinFontSizeByList(calculatedValues, eleSize?.width, eleSize?.height, grid, orientation);
    }
    return {
      name: 12,
      valueAndUnit: 12,
    };
  }, [calculatedValues, eleSize?.width, eleSize?.height, grid, orientation]);

  // 只有单个序列值且是背景色模式，则填充整个卡片的背景色
  useEffect(() => {
    if (isPreview) {
      setStatFields(getColumnsKeys(calculatedValues));
    }
    if (bodyWrapRef.current) {
      if (calculatedValues.length === 1 && colorMode === 'background') {
        const head = _.head(calculatedValues);
        const color = head?.color ? head.color : statHexPalette[0];
        const colorObject = d3.color(color);
        bodyWrapRef.current.style.border = `1px solid ${colorObject + ''}`;
        bodyWrapRef.current.style.backgroundColor = colorObject + '';
        bodyWrapRef.current.style.color = '#fff';
        setIsFullSizeBackground(true);
      } else {
        bodyWrapRef.current.style.border = `0 none`;
        bodyWrapRef.current.style.backgroundColor = 'unset';
        bodyWrapRef.current.style.color = 'unset';
        setIsFullSizeBackground(false);
      }
    }
  }, [isPreview, JSON.stringify(calculatedValues), colorMode]);

  useEffect(() => {
    if (eleSize?.width && colSpan === 0 && orientation === 'auto') {
      const grid = calculateGridDimensions(eleSize.width, eleSize.height, ITEM_SPACIING, calculatedValues.length);
      setGrid(grid);
    }
  }, [eleSize?.width, eleSize?.height, calculatedValues.length]);

  return (
    <div className='renderer-stat-container'>
      <div className='renderer-stat-container-box'>
        <div
          ref={ele}
          className={classNames('renderer-stat-container-box-content scroll-container', {
            'renderer-stat-container-box-position': colSpan === 0 && orientation === 'auto',
            'renderer-stat-container-box-flexRow': colSpan === 0 && orientation === 'horizontal',
            'renderer-stat-container-box-flexColumn': colSpan === 0 && orientation === 'vertical',
            'renderer-stat-container-box-flexwrap': colSpan !== 0,
          })}
        >
          {eleSize?.width &&
            colSpan === 0 &&
            orientation === 'auto' &&
            grid &&
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
                <StatItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  textMode={textMode}
                  colorMode={colorMode}
                  textSize={textSize}
                  isFullSizeBackground={isFullSizeBackground}
                  valueField={valueField}
                  graphMode={graphMode}
                  serie={_.find(series, { id: item.id })}
                  options={options}
                  width={itemWidth}
                  height={itemHeight}
                  minFontSize={minFontSize}
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
          {eleSize?.width &&
            colSpan === 0 &&
            orientation !== 'auto' &&
            _.map(calculatedValues, (item, idx) => {
              return (
                <StatItem
                  key={item.id}
                  item={item}
                  idx={idx}
                  textMode={textMode}
                  colorMode={colorMode}
                  textSize={textSize}
                  isFullSizeBackground={isFullSizeBackground}
                  valueField={valueField}
                  graphMode={graphMode}
                  serie={_.find(series, { id: item.id })}
                  options={options}
                  width={orientation === 'horizontal' ? (eleSize?.width as number) * (100 / calculatedValues.length / 100) : eleSize?.width}
                  height={orientation === 'vertical' ? (eleSize?.height as number) * (100 / calculatedValues.length / 100) : eleSize?.height}
                  minFontSize={minFontSize}
                  style={
                    orientation === 'horizontal'
                      ? {
                          width: `${100 / calculatedValues.length}%`,
                          flexBasis: `${100 / calculatedValues.length}%`,
                        }
                      : {
                          height: `${100 / calculatedValues.length}%`,
                          flexBasis: `${100 / calculatedValues.length}%`,
                        }
                  }
                />
              );
            })}
          {colSpan !== 0 &&
            _.map(calculatedValues, (item, idx) => {
              return (
                <StatItemByColSpan
                  key={item.id}
                  item={item}
                  idx={idx}
                  textMode={textMode}
                  colorMode={colorMode}
                  textSize={textSize}
                  isFullSizeBackground={isFullSizeBackground}
                  valueField={valueField}
                  graphMode={graphMode}
                  serie={_.find(series, { id: item.id })}
                  options={options}
                  style={{
                    width: `calc(${100 / colSpan}% - 2px)`,
                    flexBasis: `calc(${100 / colSpan}% - 2px)`,
                  }}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
