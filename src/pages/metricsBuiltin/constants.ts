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
export const pathname = '/metrics-built-in';
export const LOCAL_STORAGE_KEY = 'metrics_built_in_columns_configs';
export const defaultColumnsConfigs = [
  {
    name: 'typ',
    visible: true,
  },
  {
    name: 'name',
    visible: true,
  },
  {
    name: 'collector',
    visible: true,
  },
  {
    name: 'unit',
    visible: true,
  },
  {
    name: 'expression',
    visible: true,
  },
  {
    name: 'note',
    visible: false,
  },
];
