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
import { defaultOptionsValues } from '../Renderer/registry/defaults';

/**
 * 编辑器专属常量。
 *
 * 图表类型、渲染器和各类型的默认配置统一放在 `../Renderer/registry`，
 * 查看态也会读取那些默认值，因此不能留在编辑器目录中。
 */

export const IRefreshMap = {
  off: 'off',
  '5s': 5,
  '10s': 10,
  '30s': 30,
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '2h': 7200,
  '1d': 86400,
};

export const calcsOptions = {
  lastNotNull: {},
  last: {},
  firstNotNull: {},
  first: {},
  min: {},
  max: {},
  avg: {},
  sum: {},
  count: {},
};

/** 编辑器新建面板时的表单初始值。 */
export const defaultValues = {
  type: 'timeseries',
  options: defaultOptionsValues,
  custom: {},
  overrides: [{}],
};

export const legendPostion = ['hidden', 'top', 'left', 'right', 'bottom'];
