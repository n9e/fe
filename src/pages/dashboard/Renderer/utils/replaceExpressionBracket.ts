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
function extractBracketValue(str) {
  let reg = /{{([\s0-9a-zA-Z_]+?)}}/g;
  let matchAll: any[] = Array.from(str.matchAll(reg));
  // https://javascript.info/regexp-methods#str-matchall-regexp
  return matchAll.map((item) => (item.length > 0 ? item[1] : item[0]));
}

export default function replaceExpressionBracket(titleFormat, serieMetricLabels) {
  let keys = _.map(extractBracketValue(titleFormat), _.trim);
  var legendName = titleFormat;
  keys.forEach((key) => {
    const reg = new RegExp(`{{\\s?${key}\\s?}}`, 'g');
    legendName = legendName.replace(reg, serieMetricLabels[key] ? serieMetricLabels[key] : '');
  });
  return legendName;
}
