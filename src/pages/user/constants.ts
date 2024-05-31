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
export const LOCAL_STORAGE_KEY = 'users_columns_configs';
export const defaultColumnsConfigs = [
  {
    name: 'username',
    i18nKey: 'account:profile.username',
    visible: true,
  },
  {
    name: 'nickname',
    i18nKey: 'account:profile.nickname',
    visible: true,
  },
  {
    name: 'email',
    i18nKey: 'account:profile.email',
    visible: false,
  },
  {
    name: 'phone',
    i18nKey: 'account:profile.phone',
    visible: false,
  },
  {
    name: 'roles',
    i18nKey: 'account:profile.role',
    visible: true,
  },
  {
    name: 'busi_groups',
    i18nKey: 'user.busi_groups',
    visible: true,
  },
  {
    name: 'user_groups',
    i18nKey: 'user.user_groups',
    visible: true,
  },
  {
    name: 'create_at',
    i18nKey: 'common:table.create_at',
    visible: true,
  },
];
