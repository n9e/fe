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

const formatToTable = (series: any[], rowBy: string[], colBy: string) => {
  const rows = _.groupBy(series, (item) => {
    let groupkeys = '';
    _.forEach(rowBy, (key) => {
      groupkeys += item.fields[key];
    });
    return groupkeys;
  });
  const newSeries = _.map(rows, (val, key) => {
    const item: any = {
      id: _.uniqueId('series_'),
    };
    _.forEach(rowBy, (key) => {
      item[key] = val?.[0]?.fields?.[key];
    });
    const subGrouped = _.groupBy(val, (item) => {
      return item.fields[colBy];
    });
    _.forEach(subGrouped, (subVal, subKey) => {
      item[subKey] = {
        name: subVal[0].name,
        id: subVal[0].id,
        stat: subVal[0].stat,
        color: subVal[0].color,
        text: subVal[0].text,
      };
    });
    item.groupNames = _.keys(subGrouped);
    return item;
  });
  return newSeries;
};

export default formatToTable;
