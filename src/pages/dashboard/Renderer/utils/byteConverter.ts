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
// wiki: https://en.wikipedia.org/wiki/Byte#Multiple-byte_units
import _ from 'lodash';

interface IOptions {
  type: 'si' | 'iec';
  base?: 'bits' | 'bytes';
  decimals: number;
}

const defaultOptions: IOptions = {
  type: 'iec',
  base: 'bytes',
  decimals: 2,
};

const valueMap = [
  { exp: 0, si: '', iec: '', iecExp: 1 },
  { exp: 3, si: 'k', iec: 'Ki', iecExp: 10 },
  { exp: 6, si: 'M', iec: 'Mi', iecExp: 20 },
  { exp: 9, si: 'G', iec: 'Gi', iecExp: 30 },
  { exp: 12, si: 'T', iec: 'Ti', iecExp: 40 },
  { exp: 15, si: 'P', iec: 'Pi', iecExp: 50 },
  { exp: 18, si: 'E', iec: 'Ei', iecExp: 60 },
  { exp: 21, si: 'Z', iec: 'Zi', iecExp: 70 },
  { exp: 24, si: 'Y', iec: 'Yi', iecExp: 80 },
];

const baseUtilMap = {
  bits: 'b',
  bytes: 'B',
};

export const config = [
  {
    name: 'Data(SI)',
    type: 'si',
    children: [
      {
        name: 'bits',
      },
      {
        name: 'bytes',
      },
    ],
  },
  {
    name: 'Data(IEC)',
    type: 'iec',
    children: [
      {
        name: 'bits',
      },
      {
        name: 'bytes',
      },
    ],
  },
];

export function format(value: number, options = defaultOptions) {
  if (value === null || value === undefined)
    return {
      value: '',
      unit: '',
      text: '',
      stat: '',
    };
  const baseUtil = options.base ? baseUtilMap[options.base] : ''; // 支持
  if ((options.type === 'si' && Math.abs(value) < 1000) || (options.type === 'iec' && Math.abs(value) < 1024)) {
    return {
      value: _.round(value, options.decimals),
      unit: baseUtil,
      text: _.round(value, options.decimals) + baseUtil,
      stat: value,
    };
  }

  const baseNum = options.type === 'iec' ? 2 : 10;
  const autoDetectRegex = /(\d.*\+)(\d{1,2})/;
  const autoDetect = value.toExponential();
  const expArray = autoDetect.match(autoDetectRegex);

  if (expArray) {
    const expVal = Math.floor(parseInt(_.get(expArray, '[2]')! as string) / 3) * 3;
    const map = _.find(valueMap, { exp: expVal });

    if (!map) {
      return {
        value: NaN,
        unit: '',
        text: NaN,
        stat: NaN,
      };
    }
    const unit = _.get(map, options.type);
    const exp = _.get(map, options.type === 'iec' ? 'iecExp' : 'exp');
    const divider = Math.pow(baseNum, exp);
    const newValue = _.round(value / divider, options.decimals);

    return {
      value: newValue,
      unit: unit + baseUtil,
      text: newValue + unit + baseUtil,
      stat: value,
    };
  }
  return {
    value: _.round(value, options.decimals),
    unit: '',
    text: _.round(value, options.decimals),
    stat: value,
  };
}

export function parse(value: string, options = defaultOptions) {}
