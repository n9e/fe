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
import { arc } from 'd3';
import _ from 'lodash';
import { IFieldConfig } from './types';
import { getFormattedThresholds } from './utils';
import { gaugeDefaultThresholds } from '../../../Editor/config';
import { getMaxFontSize } from '../../utils/getTextWidth';
import './style.less';

interface Iprops {
  min?: number;
  max?: number;
  className?: string;
  style?: any;
  width?: number; // 宽度必须是高度的两倍，否则可能导致图形被截断
  height?: number;
  color?: string;
  bgColor?: string;
  value: number;
  formatedValue?: string;
  valueUnit?: string;
  thresholds?: IFieldConfig;
}

const RATIO = window.devicePixelRatio || 1;
const START_ANGLE = 0.9;
const END_ANGLE = 2.1;
const FAN_MARGIN = 1;

export default function index(props: Iprops) {
  const min = props.min || 0;
  const max = props.max || 100;
  const relativeMax = max - min;
  const width = props.width || 120;
  const height = props.height || 120;
  const color = props.color || '#73bf69';
  const bgColor = props.bgColor || '#EEEEEE';
  const value = props.value;
  const formatedValue = props.formatedValue || value;
  const valueUnit = props.valueUnit || '';
  const valueAndUnit = `${formatedValue} ${valueUnit}`;
  const radius = width / 2;
  const canvasRef = useRef(null);
  const thresholds = props.thresholds || {
    steps: gaugeDefaultThresholds,
  };
  const [valueAndUnitFontSize, setValueAndUnitFontSize] = React.useState(12);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current! as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;
      canvas.width = width * RATIO;
      canvas.height = height * RATIO * 0.7;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height * 0.7}px`;
      context.translate((width * RATIO) / 2, (height * RATIO) / 2);
      context.scale(RATIO * 0.95, RATIO * 0.95);
      let valueFanWidth = radius / 2;
      if (valueFanWidth > 40) {
        valueFanWidth = 40;
      }
      const thresholdFanWidth = valueFanWidth / 10 > 5 ? 5 : valueFanWidth / 10;
      const valueWidth = (width - (valueFanWidth + thresholdFanWidth) * 2) * 0.8;
      const valueHeight = radius / 2;
      const valueAndUnitFontSize = getMaxFontSize(valueAndUnit, valueWidth, valueHeight);
      setValueAndUnitFontSize(valueAndUnitFontSize);

      // draw background
      context.beginPath();
      arc()
        .outerRadius(radius - thresholdFanWidth - FAN_MARGIN)
        .innerRadius(radius - valueFanWidth)
        .context(context)({
        startAngle: START_ANGLE * Math.PI + Math.PI / 2,
        endAngle: END_ANGLE * Math.PI + Math.PI / 2,
      } as any);
      context.fillStyle = bgColor;
      context.fill();
      context.closePath();

      // draw thresholds
      const formattedThresholds = getFormattedThresholds(thresholds, min, max);
      _.forEach(formattedThresholds, (threshold) => {
        context.beginPath();
        arc()
          .outerRadius(radius)
          .innerRadius(radius - thresholdFanWidth)
          .context(context)({
          startAngle: (START_ANGLE + (threshold.start / relativeMax) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
          endAngle: (START_ANGLE + (threshold.end / relativeMax) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
        } as any);
        context.fillStyle = threshold.color;
        context.fill();
        context.closePath();
      });

      // draw active
      context.beginPath();
      arc()
        .outerRadius(radius - thresholdFanWidth - FAN_MARGIN)
        .innerRadius(radius - valueFanWidth)
        .context(context)({
        startAngle: START_ANGLE * Math.PI + Math.PI / 2,
        endAngle: (START_ANGLE + ((value - min < 0 ? 0 : value - min) / relativeMax) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
      } as any);
      context.fillStyle = color;
      context.fill();
      context.closePath();
    }
  }, [props]);

  useEffect(() => {
    return () => {
      if (canvasRef && canvasRef.current) {
        const canvas = canvasRef.current! as HTMLCanvasElement;
        const context = canvas.getContext('2d')!;
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  return (
    <div style={{ width, height: height * 0.7 }} className={props.className ? `d3-charts-solid-gauge ${props.className}` : 'd3-charts-solid-gauge'}>
      <canvas ref={canvasRef} />
      <div
        className='d3-charts-solid-gauge-label'
        style={{
          top: width / 2 - 12,
          color: color,
          fontSize: valueAndUnitFontSize,
        }}
      >
        {valueAndUnit}
      </div>
    </div>
  );
}
