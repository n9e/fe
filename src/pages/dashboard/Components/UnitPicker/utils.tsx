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
    label: 'Throughput',
    options: [
      { label: 'counts/sec (cps)', value: 'cps', symbol: 'c/s' },
      { label: 'ops/sec (ops)', value: 'ops', symbol: 'ops/s' },
      { label: 'requests/sec (rps)', value: 'reqps', symbol: 'req/s' },
      { label: 'reads/sec (rps)', value: 'rps', symbol: 'rd/s' },
      { label: 'writes/sec (wps)', value: 'wps', symbol: 'wr/s' },
      { label: 'I/O ops/sec (iops)', value: 'iops', symbol: 'io/s' },
      { label: 'events/sec (eps)', value: 'eps', symbol: 'evt/s' },
      { label: 'messages/sec (mps)', value: 'mps', symbol: 'msg/s' },
      { label: 'records/sec (rps)', value: 'recps', symbol: 'rec/s' },
      { label: 'rows/sec (rps)', value: 'rowsps', symbol: 'rows/s' },
      { label: 'counts/min (cpm)', value: 'cpm', symbol: 'c/m' },
      { label: 'ops/min (opm)', value: 'opm', symbol: 'ops/m' },
      { label: 'requests/min (rpm)', value: 'reqpm', symbol: 'req/m' },
      { label: 'reads/min (rpm)', value: 'rpm', symbol: 'rd/m' },
      { label: 'writes/min (wpm)', value: 'wpm', symbol: 'wr/m' },
      { label: 'events/min (epm)', value: 'epm', symbol: 'evts/m' },
      { label: 'messages/min (mpm)', value: 'mpm', symbol: 'msgs/m' },
      { label: 'records/min (rpm)', value: 'recpm', symbol: 'rec/m' },
      { label: 'rows/min (rpm)', value: 'rowspm', symbol: 'rows/m' },
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

export const getUnitSymbol = (value: string) => {
  const unit = _.find(units, (item) => {
    if (item.options) {
      return _.find(item.options, { value });
    }
    return item.value === value;
  });
  if (unit) {
    if (unit.options) {
      const option = _.find(unit.options, { value });
      if (option) {
        return option.symbol;
      }
    }
    return '';
  }
  return '';
};
