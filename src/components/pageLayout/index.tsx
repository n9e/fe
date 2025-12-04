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
import React, { ReactNode, useContext, useState, useEffect } from 'react';
import { useHistory, Link, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { Menu, Dropdown, Space, Drawer } from 'antd';
import { DownOutlined, RollbackOutlined } from '@ant-design/icons';

import { Logout } from '@/services/login';
import AdvancedWrap, { License } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import { AccessTokenKey, IS_ENT } from '@/utils/constant';
import DarkModeSelect from '@/components/DarkModeSelect';

import Version from './Version';
import SideMenuColorSetting from './SideMenuColorSetting';
import PageLayoutWithTabs from './PageLayoutWithTabs';
import HelpLink from './HelpLink';
import './index.less';
import './locale';

export { HelpLink };

// @ts-ignore
import FeatureNotification from 'plus:/pages/FeatureNotification';
interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String | JSX.Element;
  children?: ReactNode;
  introIcon?: ReactNode;
  rightArea?: ReactNode;
  customArea?: ReactNode;
  showBack?: Boolean;
  backPath?: string;
  docFn?: Function;
}

export const i18nMap = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
  ja_JP: '日本語',
  ru_RU: 'Русский',
};

let PageLayout = PageLayoutWithTabs;

export default PageLayout;
