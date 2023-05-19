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
import * as datasource from './datasource';
import * as common from './common';

const resources = {
  en_US: {
    common: common.en_US,
    datasource: datasource.en_US,
  },
  zh_CN: {
    common: common.zh_CN,
    datasource: datasource.zh_CN,
  },
  zh_HK: {
    common: common.zh_HK,
    datasource: datasource.zh_HK,
  },
};

export default resources;
