import { i18nInit } from '@/i18n';
import i18next from 'i18next';

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
export const LOCAL_STORAGE_KEY = 'alertRules_columns_configs';
export const defaultColumnsConfigs = [
  {
    name: 'cate',
    i18nKey: 'table.cate',
    visible: true,
  },
  {
    name: 'datasource_ids',
    i18nKey: 'table.datasource_ids',
    visible: false,
  },
  {
    name: 'name',
    i18nKey: 'table.name',
    visible: true,
  },
  {
    name: 'append_tags',
    i18nKey: 'table.append_tags',
    visible: false,
  },
  {
    name: 'notify_groups_obj',
    i18nKey: 'table.notify_groups_obj',
    visible: false,
  },
  {
    name: 'update_at',
    i18nKey: 'table.update_at',
    visible: true,
  },
  {
    name: 'update_by',
    i18nKey: 'table.update_by',
    visible: true,
  },
  {
    name: 'disabled',
    i18nKey: 'table.disabled',
    visible: true,
  },
];
