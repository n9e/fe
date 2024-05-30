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

export const units: any = [
  {
    label: 'none',
    value: 'none',
  },
  {
    label: 'SI short',
    value: 'sishort',
  },
  {
    label: 'Data',
    options: [
      {
        label: 'bits(SI)',
        value: 'bitsSI',
      },
      {
        label: 'bytes(SI)',
        value: 'bytesSI',
      },
      {
        label: 'bits(IEC)',
        value: 'bitsIEC',
      },
      {
        label: 'bytes(IEC)',
        value: 'bytesIEC',
      },
    ],
  },
  {
    label: 'Data rate',
    options: [
      {
        label: 'packets/sec',
        value: 'packetsSec',
      },
      {
        label: 'bits/sec(SI)',
        value: 'bitsSecSI',
      },
      {
        label: 'bytes/sec(SI)',
        value: 'bytesSecSI',
      },
      {
        label: 'bits/sec(IEC)',
        value: 'bitsSecIEC',
      },
      {
        label: 'bytes/sec(IEC)',
        value: 'bytesSecIEC',
      },
    ],
  },
  {
    label: 'Energy',
    options: [
      {
        label: 'Decibel-milliwatt(dBm)',
        value: 'dBm',
      },
    ],
  },
  {
    label: 'Percent',
    options: [
      {
        label: 'percent(0-100)',
        value: 'percent',
      },
      {
        label: 'percent(0.0-1.0)',
        value: 'percentUnit',
      },
    ],
  },
  {
    label: 'Time',
    options: [
      {
        label: 'seconds (s)',
        value: 'seconds',
      },
      {
        label: 'milliseconds (ms)',
        value: 'milliseconds',
      },
      {
        label: 'microseconds (µs)',
        value: 'microseconds',
      },
      {
        label: 'nanoseconds (ns)',
        value: 'nanoseconds',
      },
      {
        label: 'datetime(seconds)',
        value: 'datetimeSeconds',
      },
      {
        label: 'datetime(milliseconds)',
        value: 'datetimeMilliseconds',
      },
    ],
  },
];

export const buildUnitOptions = (hideLabel = false, hideSIOption = false, filter?: (units: any) => any) => {
  let unitsClone = _.cloneDeep(units);
  if (hideSIOption) {
    unitsClone = _.filter(unitsClone, (unit) => unit.value !== 'sishort');
  }
  if (filter) {
    unitsClone = filter(unitsClone);
  }
  return _.map(unitsClone, (item) => {
    if (item.options) {
      return {
        ...item,
        options: _.map(item.options, (option) => {
          return {
            ...option,
            cleanLabel: option.label,
            cleanLabelLink: <a>{option.label}</a>,
            label: (
              <span>
                {!hideLabel && option.label}
                <span className='built-in-metrics-form-unit-option-desc'>{i18next.t(`unitPicker:unitDesc.${option.value}`)}</span>
              </span>
            ),
          };
        }),
      };
    }
    return {
      ...item,
      cleanLabel: item.label,
      cleanLabelLink: <a>{item.label}</a>,
      label: (
        <span>
          {!hideLabel && item.label}
          <span className='built-in-metrics-form-unit-option-desc'>{i18next.t(`unitPicker:unitDesc.${item.value}`)}</span>
        </span>
      ),
    };
  });
};

export const getUnitLabel = (value: string, withDesc: boolean, hideLabel = false) => {
  const unit = _.find(withDesc ? buildUnitOptions(hideLabel) : units, (item) => {
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
