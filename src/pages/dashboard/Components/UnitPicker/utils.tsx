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

import { binaryPrefix, SIPrefix } from '@/pages/dashboard/Renderer/utils/symbolFormatters';
import { toFixedUnit } from '@/pages/dashboard/Renderer/utils/valueFormats';

export const units: any = [
  {
    label: 'none',
    value: 'none',
  },
  {
    label: 'Misc',
    options: [
      {
        label: 'SI short',
        value: 'sishort',
      },
      {
        label: 'Count',
        value: 'count',
      },
    ],
  },
  {
    label: 'Data',
    options: [
      {
        label: 'bits(SI)',
        value: 'bitsSI',
        fn: SIPrefix('b'),
      },
      {
        label: 'bytes(SI)',
        value: 'bytesSI',
        fn: SIPrefix('B'),
      },
      {
        label: 'bits(IEC)',
        value: 'bitsIEC',
        fn: binaryPrefix('b'),
      },
      {
        label: 'bytes(IEC)',
        value: 'bytesIEC',
        fn: binaryPrefix('B'),
      },
      {
        label: 'kibibytes',
        value: 'kibibytes',
        fn: binaryPrefix('B', 1),
      },
      {
        label: 'kilobytes',
        value: 'kilobytes',
        fn: SIPrefix('B', 1),
      },
      {
        label: 'mebibytes',
        value: 'mebibytes',
        fn: binaryPrefix('B', 2),
      },
      {
        label: 'megabytes',
        value: 'megabytes',
        fn: SIPrefix('B', 2),
      },
      {
        label: 'gibibytes',
        value: 'gibibytes',
        fn: binaryPrefix('B', 3),
      },
      {
        label: 'gigabytes',
        value: 'gigabytes',
        fn: SIPrefix('B', 3),
      },
      {
        label: 'tebibytes',
        value: 'tebibytes',
        fn: binaryPrefix('B', 4),
      },
      {
        label: 'terabytes',
        value: 'terabytes',
        fn: SIPrefix('B', 4),
      },
      {
        label: 'pebibytes',
        value: 'pebibytes',
        fn: binaryPrefix('B', 5),
      },
      {
        label: 'petabytes',
        value: 'petabytes',
        fn: SIPrefix('B', 5),
      },
    ],
  },
  {
    label: 'Data rate',
    options: [
      {
        label: 'packets/sec',
        value: 'packetsSec',
        fn: SIPrefix('p/s'),
      },
      {
        label: 'bits/sec(SI)',
        value: 'bitsSecSI',
        fn: SIPrefix('b/s'),
      },
      {
        label: 'bytes/sec(SI)',
        value: 'bytesSecSI',
        fn: SIPrefix('B/s'),
      },
      {
        label: 'bits/sec(IEC)',
        value: 'bitsSecIEC',
        fn: binaryPrefix('b/s'),
      },
      {
        label: 'bytes/sec(IEC)',
        value: 'bytesSecIEC',
        fn: binaryPrefix('B/s'),
      },
      {
        label: 'kibibytes/sec',
        value: 'kibibytesSec',
        fn: binaryPrefix('B/s', 1),
      },
      {
        label: 'kibibits/sec',
        value: 'kibibitsSec',
        fn: binaryPrefix('b/s', 1),
      },
      {
        label: 'kilobytes/sec',
        value: 'kilobytesSec',
        fn: SIPrefix('B/s', 1),
      },
      {
        label: 'kilobits/sec',
        value: 'kilobitsSec',
        fn: SIPrefix('b/s', 1),
      },
      {
        label: 'mebibytes/sec',
        value: 'mebibytesSec',
        fn: binaryPrefix('B/s', 2),
      },
      {
        label: 'mebibits/sec',
        value: 'mebibitsSec',
        fn: binaryPrefix('b/s', 2),
      },
      {
        label: 'megabytes/sec',
        value: 'megabytesSec',
        fn: SIPrefix('B/s', 2),
      },
      {
        label: 'megabits/sec',
        value: 'megabitsSec',
        fn: SIPrefix('b/s', 2),
      },
      {
        label: 'gibibytes/sec',
        value: 'gibibytesSec',
        fn: binaryPrefix('B/s', 3),
      },
      {
        label: 'gibibits/sec',
        value: 'gibibitsSec',
        fn: binaryPrefix('b/s', 3),
      },
      {
        label: 'gigabytes/sec',
        value: 'gigabytesSec',
        fn: SIPrefix('B/s', 3),
      },
      {
        label: 'gigabits/sec',
        value: 'gigabitsSec',
        fn: SIPrefix('b/s', 3),
      },
      {
        label: 'tebibytes/sec',
        value: 'tebibytesSec',
        fn: binaryPrefix('B/s', 4),
      },
      {
        label: 'tebibits/sec',
        value: 'tebibitsSec',
        fn: binaryPrefix('b/s', 4),
      },
      {
        label: 'terabytes/sec',
        value: 'terabytesSec',
        fn: SIPrefix('B/s', 4),
      },
      {
        label: 'terabits/sec',
        value: 'terabitsSec',
        fn: SIPrefix('b/s', 4),
      },
      {
        label: 'pebibytes/sec',
        value: 'pebibytesSec',
        fn: binaryPrefix('B/s', 5),
      },
      {
        label: 'pebibits/sec',
        value: 'pebibitsSec',
        fn: binaryPrefix('b/s', 5),
      },
      {
        label: 'petabytes/sec',
        value: 'petabytesSec',
        fn: SIPrefix('B/s', 5),
      },
      {
        label: 'petabits/sec',
        value: 'petabitsSec',
        fn: SIPrefix('b/s', 5),
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
  {
    label: 'Temperature',
    options: [
      {
        label: 'Celsius (°C)',
        value: 'celsius',
        symbol: '°C',
      },
      {
        label: 'Fahrenheit (°F)',
        value: 'fahrenheit',
        symbol: '°F',
      },
      {
        label: 'Kelvin (K)',
        value: 'kelvin',
        symbol: 'K',
      },
    ],
  },
  {
    label: 'Length',
    options: [
      {
        label: 'millimeter (mm)',
        value: 'millimeter',
        symbol: 'mm',
        fn: SIPrefix('m', -1),
      },
      {
        label: 'meter (m)',
        value: 'meter',
        symbol: 'm',
        fn: SIPrefix('m'),
      },
      {
        label: 'kilometer (km)',
        value: 'kilometer',
        symbol: 'km',
        fn: SIPrefix('m', 1),
      },
      {
        label: 'inch (in)',
        value: 'inch',
        symbol: 'in',
        fn: toFixedUnit('in'),
      },
      {
        label: 'foot (ft)',
        value: 'foot',
        symbol: 'ft',
        fn: toFixedUnit('ft'),
      },
      {
        label: 'mile (mi)',
        value: 'mile',
        symbol: 'mi',
        fn: toFixedUnit('mi'),
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

export const getUnitFn = (value: string) => {
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
        return option.fn;
      }
    }
  }
};
