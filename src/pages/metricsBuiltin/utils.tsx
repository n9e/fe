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
import i18next from 'i18next';
import { units } from './constants';

export const ajustUnitOptions = (showLabel = true) => {
  return _.map(units, (item) => {
    if (item.options) {
      return {
        ...item,
        options: _.map(item.options, (option) => {
          return {
            ...option,
            label: (
              <span>
                {showLabel && option.label}
                <span className='built-in-metrics-form-unit-option-desc'>{i18next.t(`metricsBuiltin:unitDesc.${option.value}`)}</span>
              </span>
            ),
          };
        }),
      };
    }
    return item;
  });
};

export const getUnitLabel = (value: string, withDesc: boolean, showLabel = true) => {
  const unit = _.find(withDesc ? ajustUnitOptions(showLabel) : units, (item) => {
    if (item.options) {
      return _.find(item.options, { value });
    }
    return item.value === value;
  });
  if (unit) {
    if (unit.options) {
      const option = _.find(unit.options, { value });
      if (option) {
        return option.label;
      }
    }
    return unit.label;
  }
  return value;
};
