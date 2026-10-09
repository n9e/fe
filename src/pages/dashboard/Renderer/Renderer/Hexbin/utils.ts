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
 */
interface HexbinCalculatedValue {
  stat: number | string | null;
}

export function getColorScaleLinearDomain(calculatedValues: HexbinCalculatedValue[], colorDomainAuto: boolean, colorDomain: number[]) {
  if (!colorDomainAuto && colorDomain?.length >= 2) {
    return [colorDomain[0], (colorDomain[0] + colorDomain[1]) / 2, colorDomain[1]];
  }

  let min = Infinity;
  let max = -Infinity;
  calculatedValues.forEach(({ stat }) => {
    const value = Number(stat);
    if (Number.isFinite(value)) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  });

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return [min, (max + min) / 2, max];
  }

  return [];
}
