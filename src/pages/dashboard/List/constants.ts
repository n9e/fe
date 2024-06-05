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
export const LOCAL_STORAGE_KEY = 'dashboard_columns_configs';
export const defaultColumnsConfigs = [
  {
    name: 'name',
    visible: true,
  },
  {
    name: 'tags',
    visible: true,
  },
  {
    name: 'update_at',
    i18nKey: 'common:table.update_at',
    visible: true,
  },
  {
    name: 'update_by',
    i18nKey: 'common:table.update_by',
    visible: false,
  },
  {
    name: 'public',
    i18nKey: 'public.name',
    visible: true,
  },
];
