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

export const getFormattedThresholds = (field: IFieldConfig, min = 0, max = 100) => {
  const { steps } = field;
  const sorted = _.sortBy(steps, (item) => {
    return Number(item.value);
  });
  const thresholdsArray = _.map(sorted, ({ value, color, type }, index) => {
    const nextStep = sorted[index + 1];
    const start = value ?? (type === 'base' ? min : max);
    const end = typeof nextStep?.value === 'number' ? nextStep.value : max;
    return {
      start: start - min < 0 ? 0 : start - min,
      end: end - min > max ? max : end - min,
      color,
    };
  });
  return thresholdsArray;
};
