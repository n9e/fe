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
import _, { includes, isDate } from 'lodash';
import moment, { Moment } from 'moment';
import i18next from 'i18next';
import { IRawTimeRange } from './types';
import { spans, rangeOptions, units } from './config';

export function isMathString(text: string | Moment | Date): boolean {
  if (!text) {
    return false;
  }

  if (typeof text === 'string' && (text.substring(0, 3) === 'now' || text.includes('||'))) {
    return true;
  } else {
    return false;
  }
}

export function parse(text?: string | Moment | Date | null, roundUp?: boolean): Moment | undefined {
  if (!text) {
    return undefined;
  }

  if (typeof text !== 'string') {
    if (moment.isMoment(text)) {
      return text;
    }
    if (isDate(text)) {
      return moment(text);
    }
    // We got some non string which is not a moment nor Date. TS should be able to check for that but not always.
    return undefined;
  } else {
    let time;
    let mathString = '';
    let index;
    let parseString;

    if (text.substring(0, 3) === 'now') {
      time = moment();
      mathString = text.substring('now'.length);
    } else {
      index = text.indexOf('||');
      if (index === -1) {
        parseString = text;
        mathString = ''; // nothing else
      } else {
        parseString = text.substring(0, index);
        mathString = text.substring(index + 2);
      }
      // We're going to just require ISO8601 timestamps, k?
      time = moment(parseString, moment.ISO_8601);
    }

    if (!mathString.length) {
      return time;
    }

    return parseDateMath(mathString, time, roundUp);
  }
}

export function isValid(text: string | Moment): boolean {
  const date = parse(text);
  if (!date) {
    return false;
  }

  if (moment.isMoment(date)) {
    return date.isValid();
  }

  return false;
}

export function parseDateMath(mathString: string, time: any, roundUp?: boolean): Moment | undefined {
  const strippedMathString = mathString.replace(/\s/g, '');
  const dateTime = time;
  let i = 0;
  const len = strippedMathString.length;

  while (i < len) {
    const c = strippedMathString.charAt(i++);
    let type;
    let num;
    let unit;

    if (c === '/') {
      type = 0;
    } else if (c === '+') {
      type = 1;
    } else if (c === '-') {
      type = 2;
    } else {
      return undefined;
    }

    if (isNaN(parseInt(strippedMathString.charAt(i), 10))) {
      num = 1;
    } else if (strippedMathString.length === 2) {
      num = parseInt(strippedMathString.charAt(i), 10);
    } else {
      const numFrom = i;
      while (!isNaN(parseInt(strippedMathString.charAt(i), 10))) {
        i++;
        if (i > 10) {
          return undefined;
        }
      }
      num = parseInt(strippedMathString.substring(numFrom, i), 10);
    }

    if (type === 0) {
      // rounding is only allowed on whole, single, units (eg M or 1M, not 0.5M or 2M)
      if (num !== 1) {
        return undefined;
      }
    }
    unit = strippedMathString.charAt(i++);

    if (!includes(units, unit)) {
      return undefined;
    } else {
      if (type === 0) {
        if (roundUp) {
          dateTime.endOf(unit);
        } else {
          dateTime.startOf(unit);
        }
      } else if (type === 1) {
        dateTime.add(num, unit);
      } else if (type === 2) {
        dateTime.subtract(num, unit);
      }
    }
  }
  return dateTime;
}

const rangeIndex: any = {};
_.forEach(rangeOptions, (frame: any) => {
  rangeIndex[frame.start + ' ~ ' + frame.end] = frame;
});

export function describeTextRange(expr: any) {
  const isLast = expr.indexOf('+') !== 0;
  if (expr.indexOf('now') === -1) {
    expr = (isLast ? 'now-' : 'now') + expr;
  }

  let opt = rangeIndex[expr + ' ~ now'];
  if (opt) {
    return opt;
  }

  if (isLast) {
    opt = { start: expr, end: 'now' };
  } else {
    opt = { start: 'now', end: expr };
  }

  const parts = /^now([-+])(\d+)(\w)/.exec(expr);
  if (parts) {
    const unit = parts[3];
    const amount = parseInt(parts[2], 10);
    const span = spans[unit];
    if (span) {
      opt.display = isLast ? i18next.t('timeRangePicker:last') : i18next.t('timeRangePicker:next');
      opt.display += ' ' + amount + ' ' + i18next.t(`timeRangePicker:spans.${span.display}`);
      if (amount > 1 && i18next.language === 'en_US') {
        opt.display += 's';
      }
    }
  } else {
    opt.display = opt.start + ' ~ ' + opt.end;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range: IRawTimeRange, dateFormat: string): string {
  const option = rangeIndex[range.start.toString() + ' ~ ' + range.end.toString()];

  if (option) {
    return i18next.t(`timeRangePicker:rangeOptions.${option.display}`);
  }

  if (moment.isMoment(range.start) && moment.isMoment(range.end)) {
    return moment(range.start).format(dateFormat) + ' ~ ' + moment(range.end).format(dateFormat);
  }

  if (moment.isMoment(range.start)) {
    const parsed = parse(range.end);
    return parsed ? moment(range.start).format(dateFormat) + ' ~ ' + range.end : '';
  }

  if (moment.isMoment(range.end)) {
    const parsed = parse(range.start);
    return parsed ? range.start + ' ~ ' + moment(range.end).format(dateFormat) : '';
  }

  if (range.end.toString() === 'now') {
    const res = describeTextRange(range.start);
    return res.display;
  }

  return range.start.toString() + ' ~ ' + range.end.toString();
}

export const valueAsString = (value: Moment | string, dateFormat: string) => {
  if (moment.isMoment(value)) {
    return value.format(dateFormat);
  }
  return value;
};

export const parseRange = (range: IRawTimeRange) => {
  return {
    start: parse(range.start),
    end: parse(range.end, true),
  };
};

export const timeRangeUnix = (range: IRawTimeRange) => {
  const parsedRange = parseRange(range);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  return {
    start,
    end,
  };
};
