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
import semver from 'semver';
import { convertDashboardV1ToV2 } from '../../help/migrate/utils';
export { convertDashboardV1ToV2 } from '../../help/migrate/utils';
import { JSONParse } from '../utils';
export { JSONParse } from '../utils';
export { convertDashboardGrafanaToN9E } from '../utils';

export function exportDataStringify(data: any) {
  return JSON.stringify(
    {
      name: data.name,
      tags: data.tags,
      ident: data.ident,
      configs: JSONParse(data.configs),
    },
    null,
    4,
  );
}

/**
 * 获取导入数据结构的版本，老版本为 undefined, 新版本暂时为语义化的 3.0.0
 */
export function getImportDataVersionIsValid(data: any): string | undefined {
  let dataClone = _.cloneDeep(data);
  const configs = _.get(dataClone, 'configs');
  if (!configs) return undefined;
  let version = _.get(configs, 'version');
  if (!version) {
    // 历史某个版本没有设置版本号
    if (_.get(configs, 'panels')) {
      version = '3.0.0';
    } else {
      return undefined;
    }
  }
  return semver.valid(version);
}

export function getValidImportData(dat: any) {
  let data = JSONParse(dat);
  data = _.isArray(data) ? _.head(data) : data;
  if (!getImportDataVersionIsValid(data)) {
    data = convertDashboardV1ToV2(data);
  } else {
    data.configs = JSON.stringify(data.configs);
  }
  return data;
}
