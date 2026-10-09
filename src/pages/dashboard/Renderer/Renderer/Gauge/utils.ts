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
import _ from 'lodash';
import { IFieldConfig } from './types';

export const getGaugeThresholdLabelRadius = (isCircle = false) => (isCircle ? 90 : 86.5);

export const getGaugeThresholdLabelAngle = (progress: number, angle: number, isCircle = false) => {
  if (!isCircle) return angle;
  if (progress <= 0) return angle + 0.15;
  if (progress >= 1) return angle - 0.15;
  return angle;
};

export const getGaugeThresholdLabelAnchor = (progress: number, isCircle = false) => {
  if (isCircle) return 'middle';
  if (progress <= 0) return 'start';
  if (progress >= 1) return 'end';
  return 'middle';
};

export const getGaugeThresholdLabelOrientation = (angle: number, preserveDirection = false) => {
  const degrees = (angle * 180) / Math.PI;
  const uprightDegrees = ((((degrees + 90) % 180) + 180) % 180) - 90;
  return {
    rotation: preserveDirection ? degrees : uprightDegrees,
    glyphRotation: 0,
  };
};

export const getGaugeContentWidth = (innerRadius: number) => innerRadius * 1.36;

export const getGaugeNameMaxLength = (innerRadius: number) => Math.max(6, Math.floor(innerRadius * 0.35));

export const getGaugeValueFontSize = (innerRadius: number, valueLength: number) => {
  const maxTextWidth = innerRadius * 1.8;
  return Math.max(8, Math.min(24, (innerRadius * 1.7) / (valueLength * 0.54), maxTextWidth / (valueLength * 0.76)));
};

export const getGaugeTextOffsets = (valueFontSize: number, showValue: boolean, showName: boolean) => {
  const baselineGap = Math.max(12, (valueFontSize + 9) / 2 + 1);
  return {
    value: showName ? -baselineGap / 2 : 0,
    name: showValue ? baselineGap / 2 : 0,
  };
};

export const getFormattedThresholds = (field: IFieldConfig, min = 0, max = 100) => {
  const { steps, mode } = field;
  const sorted = _.sortBy(steps, (item) => {
    return Number(item.value);
  });
  const toValue = (value: number | null | undefined, type?: string) => {
    if (value == null) return type === 'base' ? min : max;
    return mode === 'percentage' ? min + ((max - min) * value) / 100 : value;
  };
  const thresholdsArray = _.map(sorted, ({ value, color, type }, index) => {
    const nextStep = sorted[index + 1];
    const start = toValue(value, type);
    const end = nextStep ? toValue(nextStep.value, nextStep.type) : max;
    return {
      start: start - min < 0 ? 0 : start - min,
      end: end - min > max - min ? max - min : end - min,
      color,
    };
  });
  return thresholdsArray;
};
