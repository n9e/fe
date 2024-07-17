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
import { IValueMapping, IThresholds, IOverride } from '../../types';
import getSerieName from './getSerieName';

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
      const toNumberValue = _.toNumber(value) as number;
      if (type === 'special') {
        return toNumberValue === match?.special;
      } else if (type === 'range') {
        if (_.isNumber(match?.from) && _.isNumber(match?.to)) {
          return toNumberValue >= match?.from && toNumberValue <= match?.to;
        } else if (_.isNumber(match?.from)) {
          return toNumberValue >= match?.from;
        } else if (_.isNumber(match?.to)) {
          return toNumberValue <= match?.to;
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
        const toNumberValue = _.toNumber(value) as number;
        if (toNumberValue >= item.value) {
          matchedThresholdsColor = item.color;
        }
      }
    },
  );
  if (unit || decimals) {
    const valueObj = valueFormatter({ unit, decimals, dateFormat }, value);
    const newValue = matchedValueMapping?.result?.text ? matchedValueMapping?.result?.text : valueObj.value;
    return {
      value: newValue,
      unit: valueObj.unit,
      color: matchedValueMapping?.result?.color || matchedThresholdsColor,
      text: newValue + valueObj.unit,
    };
  }
  const newValue = matchedValueMapping?.result?.text ? matchedValueMapping?.result?.text : value;
  return {
    value: newValue,
    unit: '',
    color: matchedValueMapping?.result?.color || matchedThresholdsColor,
    text: newValue,
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

const getCalculatedValuesBySeries = (
  series: any[],
  calc: string,
  {
    unit,
    decimals,
    dateFormat,
    valueField,
  }: {
    unit?: string;
    decimals?: number;
    dateFormat?: string;
    valueField?: string;
  },
  valueMappings?: IValueMapping[],
  thresholds?: IThresholds,
) => {
  if (calc === 'origin') {
    let values: any[] = [];
    _.forEach(series, (serie) => {
      _.forEach(serie.data, (item) => {
        values.push({
          id: `${serie.id}_${item[0]}`,
          name: getMappedTextObj(serie.name, valueMappings)?.text,
          __time__: item[0],
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
            __time__: item[0],
          },
          stat: item[1],
          ...getSerieTextObj(item[1], { unit, decimals, dateFormat }, valueMappings, thresholds),
        });
      });
    });
    return values;
  }
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
    let stat = results[calc] ? results[calc]() : NaN;
    // 2024-07-12 如果 valueField 不是内置的 Value 字段，则取 metric 中的值
    if (valueField && valueField !== 'Value') {
      stat = _.get(serie, ['metric', valueField], NaN);
    }
    // 2024-06-28 serie.name 放到这里处理，原 datasource 里的 name 都删除掉
    // 目前只有 mysql 源生效
    // name 的处理逻辑为
    // 1. 如果存在 valueField 则把 valueField 作为 __name__ 的值
    // 2. 如果存在 legend 则通过 replaceExpressionBracket 转换 name
    // 3. 如果存在 ref name 则为 ref + name
    // 4. 最后把 name 通过 valueMappings 转换
    let name = serie.name;
    if (!name) {
      name = getSerieName(serie.metric, { valueField, legend: serie.target?.legend, ref: serie.isExp ? serie.refId : undefined });
    }

    return {
      id: serie.id,
      name: getMappedTextObj(name, valueMappings)?.text,
      target: serie.target,
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

export const getLegendValues = (series: any[], standardOptions, hexPalette: string[], stack = false, valueMappings?: IValueMapping[], overrides?: IOverride[]) => {
  let { unit, decimals, dateFormat } = standardOptions || {};
  const newSeries = stack ? _.reverse(_.clone(series)) : series;
  const values = _.map(newSeries, (serie, idx) => {
    const override = _.find(overrides, (item) => item.matcher.value === serie.refId);
    if (override) {
      unit = override?.properties?.standardOptions?.util;
      decimals = override?.properties?.standardOptions?.decimals;
      dateFormat = override?.properties?.standardOptions?.dateFormat;
    }
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
