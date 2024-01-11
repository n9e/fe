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
import { utilValMap } from '../config';
import * as byteConverter from './byteConverter';
import { toMilliSeconds, toSeconds } from './dateTimeFormatters';
import { toFixed, FormattedValue } from './valueFormats';

export function timeFormatter(val, type: 'seconds' | 'milliseconds', decimals) {
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
  return {
    value: _.toNumber(formattedValue.text),
    unit: formattedValue.suffix,
    text: _.toNumber(formattedValue.text) + ' ' + formattedValue.suffix,
    stat: val,
  };
}

const valueFormatter = ({ unit, decimals = 3, dateFormat = 'YYYY-MM-DD HH:mm:ss' }, val) => {
  if (val === null || val === '' || val === undefined) {
    return {
      value: '',
      unit: '',
      text: '',
      stat: '',
    };
  }
  if (decimals === null) decimals = 3;
  if (typeof val !== 'number') {
    val = _.toNumber(val);
  }
  if (unit) {
    const utilValObj = utilValMap[unit];
    if (utilValObj) {
      const { type, base, postfix } = utilValObj;
      return byteConverter.format(val, {
        type,
        base,
        decimals,
        postfix,
      });
    }
    if (unit === 'default') {
      return byteConverter.format(val, {
        type: 'si',
        decimals,
      });
    }
    if (unit === 'none') {
      return {
        value: _.round(val, decimals),
        unit: '',
        text: _.round(val, decimals),
        stat: val,
      };
    }
    if (unit === 'percent') {
      return {
        value: _.round(val, decimals),
        unit: '%',
        text: _.round(val, decimals) + '%',
        stat: val,
      };
    }
    if (unit === 'percentUnit') {
      return {
        value: _.round(val * 100, decimals),
        unit: '%',
        text: _.round(val * 100, decimals) + '%',
        stat: val,
      };
    }
    if (unit === 'humantimeSeconds') {
      return {
        value: moment.duration(val, 'seconds').humanize(),
        unit: '',
        text: moment.duration(val, 'seconds').humanize(),
        stat: val,
      };
    }
    if (unit === 'humantimeMilliseconds') {
      return {
        value: moment.duration(val, 'milliseconds').humanize(),
        unit: '',
        text: moment.duration(val, 'milliseconds').humanize(),
        stat: val,
      };
    }
    if (unit === 'seconds') {
      return timeFormatter(val, unit, decimals);
    }
    if (unit === 'milliseconds') {
      return timeFormatter(val, unit, decimals);
    }
    if (unit === 'datetimeSeconds') {
      return {
        value: moment.unix(val).format(dateFormat),
        unit: '',
        text: moment.unix(val).format(dateFormat),
        stat: val,
      };
    }
    if (unit === 'datetimeMilliseconds') {
      return {
        value: moment(val).format(dateFormat),
        unit: '',
        text: moment(val).format(dateFormat),
        stat: val,
      };
    }
    return {
      value: _.round(val, decimals),
      unit: '',
      text: _.round(val, decimals),
      stat: val,
    };
  }
  // 默认返回 SI 不带基础单位
  return byteConverter.format(val, {
    type: 'si',
    decimals,
  });
};
export default valueFormatter;
