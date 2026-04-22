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
import moment from 'moment';
import { getUnitSymbol, getUnitFn } from '@/pages/dashboard/Components/UnitPicker/utils';
import { utilValMap } from '../config';
import * as byteConverter from './byteConverter';
import { toNanoSeconds, toMicroSeconds, toMilliSeconds, toSeconds } from './dateTimeFormatters';
import { toFixed, FormattedValue } from './valueFormats';

export function timeFormatter(val, type: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds', decimals) {
  if (typeof val !== 'number')
    return {
      value: val,
      unit: '',
      text: val,
      stat: val,
    };
  let formattedValue: FormattedValue = {
    text: _.toString(toFixed(val, decimals)),
    suffix: '',
  };
  if (type === 'seconds') {
    formattedValue = toSeconds(val, decimals);
  }
  if (type === 'milliseconds') {
    formattedValue = toMilliSeconds(val, decimals);
  }
  if (type === 'microseconds') {
    formattedValue = toMicroSeconds(val, decimals);
  }
  if (type === 'nanoseconds') {
    formattedValue = toNanoSeconds(val, decimals);
  }

  return {
    value: _.toNumber(formattedValue.text),
    unit: formattedValue.suffix,
    text: _.toNumber(formattedValue.text) + ' ' + formattedValue.suffix,
    stat: val,
  };
}

const valueFormatter = ({ unit, decimals = 6, dateFormat = 'YYYY-MM-DD HH:mm:ss' }, val) => {
  if (val === null || val === '' || val === undefined) {
    return {
      value: '',
      unit: '',
      text: '',
      stat: '',
    };
  }
  if (decimals === null) decimals = 6;
  let valNum = val;
  if (typeof val !== 'number') {
    valNum = _.toNumber(val);
  }
  const fn = getUnitFn(unit);
  if (unit) {
    const utilValObj = utilValMap[unit];
    if (utilValObj) {
      const { type, base, postfix } = utilValObj;
      return byteConverter.format(valNum, {
        type,
        base,
        decimals,
        postfix,
      });
    }
    if (fn) {
      const formattedValue = fn(valNum, decimals);
      let text = formattedValue.text;

      if (formattedValue.prefix) {
        text = `${formattedValue.prefix}${text}`;
      }

      if (formattedValue.suffix) {
        text = `${text}${formattedValue.suffix.startsWith(' ') ? formattedValue.suffix : ` ${formattedValue.suffix}`}`;
      }

      return {
        value: formattedValue.text,
        unit: `${formattedValue.prefix || ''}${formattedValue.suffix || ''}`.trim(),
        text,
        stat: valNum,
      };
    }
    // 2024-05-08 新增 'sishort' 单位为原 'default' 单位
    if (unit === 'default' || unit === 'sishort') {
      return byteConverter.format(valNum, {
        type: 'si',
        decimals,
      });
    }
    if (unit === 'none') {
      return {
        value: val,
        unit: '',
        text: val,
        stat: val,
      };
    }
    if (unit === 'percent') {
      return {
        value: _.round(valNum, decimals),
        unit: '%',
        text: _.round(valNum, decimals) + '%',
        stat: valNum,
      };
    }
    if (unit === 'percentUnit') {
      return {
        value: _.round(valNum * 100, decimals),
        unit: '%',
        text: _.round(valNum * 100, decimals) + '%',
        stat: valNum,
      };
    }
    if (unit === 'humantimeSeconds') {
      return {
        value: moment.duration(valNum, 'seconds').humanize(),
        unit: '',
        text: moment.duration(valNum, 'seconds').humanize(),
        stat: valNum,
      };
    }
    if (unit === 'humantimeMilliseconds') {
      return {
        value: moment.duration(valNum, 'milliseconds').humanize(),
        unit: '',
        text: moment.duration(valNum, 'milliseconds').humanize(),
        stat: valNum,
      };
    }
    if (_.includes(['seconds', 'milliseconds', 'microseconds', 'nanoseconds'], unit)) {
      return timeFormatter(valNum, unit, decimals);
    }
    if (unit === 'datetimeSeconds') {
      return {
        value: moment.unix(valNum).format(dateFormat),
        unit: '',
        text: moment.unix(valNum).format(dateFormat),
        stat: valNum,
      };
    }
    if (unit === 'datetimeMilliseconds') {
      return {
        value: moment(valNum).format(dateFormat),
        unit: '',
        text: moment(valNum).format(dateFormat),
        stat: valNum,
      };
    }
    if (
      _.includes(
        [
          'cps',
          'cpm',
          'ops',
          'opm',
          'reqps',
          'reqpm',
          'rps',
          'rpm',
          'wps',
          'wpm',
          'iops',
          'iopm',
          'eps',
          'epm',
          'mps',
          'mpm',
          'recps',
          'recpm',
          'rowsps',
          'rowspm',
          'celsius',
          'fahrenheit',
          'kelvin',
        ],
        unit,
      )
    ) {
      const data = byteConverter.format(valNum, {
        type: 'si',
        decimals,
      });
      const symbol = getUnitSymbol(unit);
      return {
        value: data.value,
        unit: data.unit + ' ' + symbol,
        text: data.text + ' ' + symbol,
        stat: data.stat,
      };
    }
    return {
      value: _.round(valNum, decimals),
      unit: unit,
      text: _.round(valNum, decimals) + ' ' + unit, // 2024-07-08 值和单位组合之间添加空格，暂时用在自定义单位，后续考虑其他内置单位也添加空格
      stat: valNum,
    };
  }
  // 默认返回 SI 不带基础单位
  return byteConverter.format(valNum, {
    type: 'si',
    decimals,
  });
};
export default valueFormatter;
