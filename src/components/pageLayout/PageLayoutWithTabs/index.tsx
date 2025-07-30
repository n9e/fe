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
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { Menu, Dropdown, Space, Drawer, Button, Tooltip } from 'antd';
import { DownOutlined, RollbackOutlined } from '@ant-design/icons';

import { Logout } from '@/services/login';
import AdvancedWrap, { License } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import { AccessTokenKey, IS_ENT, IS_PLUS } from '@/utils/constant';
import DarkModeSelect from '@/components/DarkModeSelect';
import { findMenuByPath, getCurrentMenuList } from '@/components/SideMenu/utils';
import { MenuMatchResult } from '@/components/SideMenu/types';

import { TabMenu } from './TabMenu';
import LanguageIcon from '../icons/LanguageIcon';
import DocIcon from '../icons/DocIcon';
import Version from '../Version';
import SideMenuColorSetting from '../SideMenuColorSetting';
import HelpLink from '../HelpLink';
import '../index.less';
import '../locale';

// @ts-ignore
import FeatureNotification from 'plus:/pages/FeatureNotification';

export { HelpLink };

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
  tabGroup?: string;
}

const i18nMap = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
  ja_JP: '日本語',
  ru_RU: 'Русский',
};

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, introIcon, children, customArea, showBack, backPath, docFn, tabGroup }) => {
  const { t, i18n } = useTranslation('pageLayout');
  const history = useHistory();
  const location = useLocation();
  const query = querystring.parse(location.search);
  const { profile, siteInfo } = useContext(CommonStateContext);
  const embed = localStorage.getItem('embed') === '1' && window.self !== window.top;
  const [themeVisible, setThemeVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuMatchResult | null>(null);
  const menuList = getCurrentMenuList();

  useEffect(() => {
    const result = findMenuByPath(location.pathname, menuList);
    if (result) {
      setCurrentMenu(result);
    }
  }, [location.pathname]);

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('profile')}
      </Menu.Item>
      {!IS_ENT && (
        <Menu.Item
          onClick={() => {
            setThemeVisible(true);
          }}
        >
          {t('themeSetting')}
        </Menu.Item>
      )}
      <Menu.Item
        onClick={() => {
          Logout().then(() => {
            localStorage.removeItem(AccessTokenKey);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('curBusiId');
            history.push('/login');
          });
        }}
      >
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={'page-wrapper'}>
      {!embed && (
        <>
          {customArea ? (
            <div className={'page-top-header'}>{customArea}</div>
          ) : (
            <div className={'page-top-header'}>
              <div
                className={`page-header-content relative n9e-page-header-content`}
                style={{
                  // 2024-07-10 用途集成仪表盘全屏模式，未来其他页面的全屏模式皆是 viewMode=fullscreen
                  display: query.viewMode === 'fullscreen' ? 'none' : 'flex',
                }}
              >
                <div className='flex gap-4 align-center'>
                  {!currentMenu?.parentItem?.label && (
                    <div className={'page-header-title'}>
                      {showBack && window.history.state && (
                        <RollbackOutlined
                          onClick={() => {
                            if (backPath) {
                              history.push(backPath);
                            } else {
                              history.goBack();
                            }
                          }}
                          style={{
                            marginRight: '5px',
                          }}
                        />
                      )}
                      {title}
                    </div>
                  )}
                  <TabMenu currentMenu={currentMenu} />
                </div>

                <div className={'page-header-right-area'} style={{ display: sessionStorage.getItem('menuHide') === '1' ? 'none' : undefined }}>
                  {introIcon}
                  {docFn && <a onClick={() => docFn()}>{t('docs')}</a>}
                  <Version />

                  <Space className='mr-2'>{rightArea}</Space>

                  <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                    <License />
                  </AdvancedWrap>
                  <Space>
                    {/* 整合版本关闭文档链接 */}
                    {!IS_ENT && IS_PLUS && (
                      <Button
                        target='_blank'
                        href={siteInfo?.document_url || 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/introduction/'}
                        size='small'
                        type='text'
                      >
                        <Tooltip title={t('docs')}>
                          <DocIcon className='text-[12px]' />
                        </Tooltip>
                      </Button>
                    )}
                  </Space>
                  <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                    <FeatureNotification />
                  </AdvancedWrap>

                  <Dropdown
                    overlay={
                      <Menu
                        onSelect={({ key }) => {
                          i18n.changeLanguage(key);
                          localStorage.setItem('language', key);
                        }}
                        selectable
                      >
                        {Object.keys(i18nMap).map((el) => {
                          return <Menu.Item key={el}>{i18nMap[el]}</Menu.Item>;
                        })}
                      </Menu>
                    }
                  >
                    <Button size='small' type='text'>
                      <LanguageIcon className='text-[12px]' />
                    </Button>
                  </Dropdown>

                  <div style={{ marginRight: 12 }}>
                    <DarkModeSelect />
                  </div>

                  <Dropdown overlay={menu} trigger={['click']}>
                    <span className='avator' style={{ cursor: 'pointer' }}>
                      <img src={profile.portrait || '/image/avatar1.png'} />
                      <span className='display-name'>{profile.nickname || profile.username}</span>
                      <DownOutlined />
                    </span>
                  </Dropdown>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {children && children}
      <Drawer
        closable={false}
        visible={themeVisible}
        onClose={() => {
          setThemeVisible(false);
        }}
      >
        <div>
          <div>
            <div className='text-lg font-semibold dark:text-slate-50 text-l1'>{t('theme.title')}</div>
            <div className='text-sm text-hint mt-1'>{t('theme.title_help')}</div>
          </div>
          <div className='mt-6'>
            <span className='font-semibold'>{t('theme.sideMenu')}</span> <span className='ml-2 text-hint'>{t('theme.sideMenu_help')}</span>
          </div>
          <div className='m-2'>
            <SideMenuColorSetting />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default PageLayout;
