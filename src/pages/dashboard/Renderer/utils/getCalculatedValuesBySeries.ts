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
import valueFormatter from './valueFormatter';
import { IValueMapping, IThresholds } from '../../types';

const getValueAndToNumber = (value: any[]) => {
  return _.toNumber(_.get(value, 1, NaN));
};

export const getSerieTextObj = (value: number | string | null | undefined, standardOptions?: any, valueMappings?: IValueMapping[], thresholds?: IThresholds) => {
  const { decimals, dateFormat } = standardOptions || {};
  const unit = standardOptions?.unit || standardOptions?.util; // TODO: 兼容之前写错的 util
  const matchedValueMapping = _.find(valueMappings, (item: any) => {
    const { type, match } = item;
    if (value === null || value === '' || value === undefined) {
      if (type === 'specialValue') {
        if (match?.specialValue === 'empty') {
          return value === '';
        } else if (match?.specialValue === 'null') {
          return value === null || value === undefined;
        }
      }
      return false;
    } else {
      value = _.toNumber(value) as number;
      if (type === 'special') {
        return value === match?.special;
      } else if (type === 'range') {
        if (_.isNumber(match?.from) && _.isNumber(match?.to)) {
          return value >= match?.from && value <= match?.to;
        } else if (_.isNumber(match?.from)) {
          return value >= match?.from;
        } else if (_.isNumber(match?.to)) {
          return value <= match?.to;
        }
        return false;
      }
      return false;
    }
  });
  let matchedThresholdsColor;
  if (thresholds?.steps) {
    const baseColor = _.get(_.find(thresholds?.steps, { type: 'base' }), 'color');
    matchedThresholdsColor = baseColor;
  }
  _.forEach(
    _.sortBy(thresholds?.steps, (item) => {
      return Number(item.value);
    }),
    (item) => {
      if (_.isNumber(item.value) && value) {
        value = _.toNumber(value) as number;
        if (value >= item.value) {
          matchedThresholdsColor = item.color;
        }
      }
    },
  );
  const valueObj = valueFormatter({ unit, decimals, dateFormat }, value);
  const newValue = matchedValueMapping?.result?.text ? matchedValueMapping?.result?.text : valueObj.value;
  return {
    value: newValue,
    unit: valueObj.unit,
    color: matchedValueMapping?.result?.color || matchedThresholdsColor,
    text: newValue + valueObj.unit,
  };
};

export const getMappedTextObj = (textValue: string, valueMappings?: IValueMapping[]) => {
  if (typeof textValue === 'string') {
    const matchedValueMapping = _.find(valueMappings, (item: any) => {
      const { type, match } = item;
      if (type === 'textValue') {
        return textValue === match?.textValue;
      }
      return false;
    });
    if (matchedValueMapping) {
      return {
        // origin: textValue,
        text: matchedValueMapping?.result?.text || textValue,
        color: matchedValueMapping?.result?.color,
      };
    }
  }
  return {
    // origin: textValue,
    text: textValue,
  };
};

const getCalculatedValuesBySeries = (series: any[], calc: string, { unit, decimals, dateFormat }, valueMappings?: IValueMapping[], thresholds?: IThresholds) => {
  const values = _.map(series, (serie) => {
    const results = {
      lastNotNull: () => _.get(_.last(_.filter(serie.data, (item) => item[1] !== null && !_.isNaN(_.toNumber(item[1])))), 1),
      last: () => _.get(_.last(serie.data), 1),
      firstNotNull: () => _.get(_.first(_.filter(serie.data, (item) => item[1] !== null && !_.isNaN(_.toNumber(item[1])))), 1),
      first: () => _.get(_.first(serie.data), 1),
      min: () => getValueAndToNumber(_.minBy(serie.data, (item: any) => _.toNumber(item[1]))),
      max: () => getValueAndToNumber(_.maxBy(serie.data, (item: any) => _.toNumber(item[1]))),
      avg: () => _.meanBy(serie.data, (item: any) => _.toNumber(item[1])),
      sum: () => _.sumBy(serie.data, (item: any) => _.toNumber(item[1])),
      count: () => _.size(serie.data),
    };
    const stat = results[calc] ? results[calc]() : NaN;

    return {
      id: serie.id,
      name: getMappedTextObj(serie.name, valueMappings)?.text,
      metric: _.reduce(
        serie.metric,
        (pre, curVal, curKey) => {
          pre[curKey] = getMappedTextObj(curVal, valueMappings)?.text;
          return pre;
        },
        {},
      ),
      fields: {
        ...serie.metric,
        refId: serie.refId,
      },
      stat: _.toNumber(stat),
      ...getSerieTextObj(stat, { unit, decimals, dateFormat }, valueMappings, thresholds),
    };
  });
  return values;
};

export const getLegendValues = (series: any[], { unit, decimals, dateFormat }, hexPalette: string[], stack = false, valueMappings?: IValueMapping[]) => {
  const newSeries = stack ? _.reverse(_.clone(series)) : series;
  const values = _.map(newSeries, (serie, idx) => {
    const results = {
      max: getValueAndToNumber(_.maxBy(serie.data, (item: any) => _.toNumber(item[1]))),
      min: getValueAndToNumber(_.minBy(serie.data, (item: any) => _.toNumber(item[1]))),
      avg: _.meanBy(serie.data, (item: any) => _.toNumber(item[1])),
      sum: _.sumBy(serie.data, (item: any) => _.toNumber(item[1])),
      last: getValueAndToNumber(_.last(serie.data) as any),
    };
    return {
      id: serie.id,
      name: getMappedTextObj(serie.name, valueMappings)?.text,
      metric: _.reduce(
        serie.metric,
        (pre, curVal, curKey) => {
          pre[curKey] = getMappedTextObj(curVal, valueMappings)?.text;
          return pre;
        },
        {},
      ),
      offset: serie.offset,
      color: hexPalette[idx % hexPalette.length],
      disabled: serie.visible === false ? true : undefined,
      max: valueFormatter({ unit, decimals, dateFormat }, results.max),
      min: valueFormatter({ unit, decimals, dateFormat }, results.min),
      avg: valueFormatter({ unit, decimals, dateFormat }, results.avg),
      sum: valueFormatter({ unit, decimals, dateFormat }, results.sum),
      last: valueFormatter({ unit, decimals, dateFormat }, results.last),
    };
  });
  return values;
};

export default getCalculatedValuesBySeries;
