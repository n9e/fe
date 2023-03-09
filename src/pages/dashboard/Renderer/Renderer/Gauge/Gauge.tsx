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
import './style.less';

interface Iprops {
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
const UNIT_SIZE = 12;
const MIN_SIZE = 12;
const UNIT_PADDING = 4;

export default function index(props: Iprops) {
  const style = props.style || {};
  const width = props.width || 120;
  const height = props.height || 120;
  const color = props.color || '#73bf69';
  const bgColor = props.bgColor || '#EEEEEE';
  const value = props.value;
  const formatedValue = props.formatedValue || value;
  const valueUnit = props.valueUnit || '';
  const radius = width / 2;
  const canvasRef = useRef(null);
  const thresholds = props.thresholds || {
    steps: gaugeDefaultThresholds,
  };
  const statFontSize = (radius - 10 - valueUnit.length * UNIT_SIZE - UNIT_PADDING) / _.toString(formatedValue).length || MIN_SIZE;

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
      const valueWidth = radius / 2;
      const thresholdFanWidth = valueWidth / 10 > 5 ? 5 : valueWidth / 10;

      // draw background
      context.beginPath();
      arc()
        .outerRadius(radius - thresholdFanWidth - FAN_MARGIN)
        .innerRadius(radius - valueWidth)
        .context(context)({
        startAngle: START_ANGLE * Math.PI + Math.PI / 2,
        endAngle: END_ANGLE * Math.PI + Math.PI / 2,
      });
      context.fillStyle = bgColor;
      context.fill();
      context.closePath();

      // draw thresholds
      const formattedThresholds = getFormattedThresholds(thresholds);
      _.forEach(formattedThresholds, (threshold) => {
        context.beginPath();
        arc()
          .outerRadius(radius)
          .innerRadius(radius - thresholdFanWidth)
          .context(context)({
          startAngle: (START_ANGLE + (threshold.start / 100) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
          // TODO: fix d3 type
          // @ts-ignore
          endAngle: (START_ANGLE + (threshold.end / 100) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
        });
        context.fillStyle = threshold.color;
        context.fill();
        context.closePath();
      });

      // draw active
      const percentValue = value > 100 ? 100 : value < 0 ? 0 : value;
      context.beginPath();
      arc()
        .outerRadius(radius - thresholdFanWidth - FAN_MARGIN)
        .innerRadius(radius - valueWidth)
        .context(context)({
        startAngle: START_ANGLE * Math.PI + Math.PI / 2,
        endAngle: (START_ANGLE + (percentValue / 100) * (END_ANGLE - START_ANGLE)) * Math.PI + Math.PI / 2,
      });
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
        }}
      >
        <span
          style={{
            fontSize: statFontSize < 0 ? 12 : statFontSize,
          }}
        >
          {formatedValue}
        </span>
        <span className='d3-charts-solid-gauge-label-unit'>{valueUnit}</span>
      </div>
    </div>
  );
}
