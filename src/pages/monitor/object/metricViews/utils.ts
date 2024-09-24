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
import { escapePromQLString } from '@/pages/dashboard/VariableConfig/utils';
import { IMatch } from '../types';

export function getFiltersStr(filters: IMatch['filters']) {
  const arr = _.compact(
    _.map(filters, (item) => {
      if (item.label && item.value) {
        return `${item.label}${item.oper}"${item.value}"`;
      }
      return '';
    }),
  );
  return _.join(_.compact(arr), ',');
}

export function getDynamicLabelsStr(dynamicLabels: IMatch['dynamicLabels']) {
  const arr = _.map(dynamicLabels, (item) => {
    if (item.value) {
      return `${item.label}="${item.value}"`;
    }
    return '';
  });
  return _.join(_.compact(arr), ',');
}

export function getMatchStr(match: IMatch) {
  const arr = _.map(match.dimensionLabels, (item) => {
    if (!_.isEmpty(item.value)) {
      return `${item.label}=~"${_.join(
        _.map(item.value, (item) => {
          return escapePromQLString(item);
        }),
        '|',
      )}"`;
    }
    return '';
  });
  const str = _.join(_.compact(arr), ',');
  return str ? `{${str}}` : '';
}
