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
export const LOCAL_STORAGE_KEY = 'alert_subscribes_columns_configs';
export const defaultColumnsConfigs = [
  {
    name: 'note',
    visible: true,
  },
  {
    name: 'datasource_ids',
    i18nKey: 'common:datasource.id',
    visible: true,
  },
  {
    name: 'severities',
    visible: true,
  },
  {
    name: 'rule_names',
    i18nKey: 'rule_name',
    visible: true,
  },
  {
    name: 'busi_groups',
    i18nKey: 'group.key.label',
    visible: true,
  },
  {
    name: 'tags',
    visible: true,
  },
  {
    name: 'user_groups',
    visible: true,
  },
  {
    name: 'new_severity',
    i18nKey: 'redefine_severity',
    visible: true,
  },
  {
    name: 'update_by',
    i18nKey: 'common:table.create_by',
    visible: true,
  },
  {
    name: 'disabled',
    i18nKey: 'common:table.enabled',
    visible: true,
  },
];
