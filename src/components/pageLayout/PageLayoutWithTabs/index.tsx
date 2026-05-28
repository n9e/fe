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
import React, { ReactNode, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { Space, Button } from 'antd';
import { RollbackOutlined, HistoryOutlined, GithubOutlined } from '@ant-design/icons';

import AdvancedWrap, { License } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import { IS_ENT, IS_PLUS } from '@/utils/constant';
import { findMenuByPath, getCurrentMenuList } from '@/components/SideMenu/utils';
import { MenuMatchResult } from '@/components/SideMenu/types';
import FlashAiButton from '@/components/AiChatNG/FlashAiButton';

import DocLink, { getProductDocumentLink } from './DocLink';
import PageDocLink, { shouldShowPageDocLink } from './PageDocLink';
import { TabMenu } from './TabMenu';
import Version from '../Version';
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
  doc?: string;
  productDocLink?: string;
  tabGroup?: string;
}

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, introIcon, children, customArea, showBack, backPath, doc, productDocLink, tabGroup }) => {
  const { t, i18n } = useTranslation('pageLayout');
  const history = useHistory();
  const location = useLocation();
  const query = querystring.parse(location.search);
  const { siteInfo } = useContext(CommonStateContext);
  const embed = localStorage.getItem('embed') === '1' && window.self !== window.top;
  const [currentMenu, setCurrentMenu] = useState<MenuMatchResult | null>(null);
  const menuList = getCurrentMenuList();
  const documentUrl = getProductDocumentLink({ productDocLink, doc, siteDocumentUrl: siteInfo?.document_url });

  useEffect(() => {
    const result = findMenuByPath(location.pathname, menuList);
    if (result) {
      setCurrentMenu(result);
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (!IS_ENT && !IS_PLUS) {
      // 如果 Headway 不存在，则每隔 1 秒尝试初始化一次
      const timer = setInterval(() => {
        if ((window as any).Headway) {
          clearInterval(timer);
          (window as any).Headway?.init({
            selector: '.product-changelog',
            account: i18n.language !== 'zh_CN' ? 'yB4rM7' : '7XMr1J',
          });
        }
      }, 1000);
    }
  }, [i18n.language]);

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
                <div className='flex items-center min-w-0 flex-1'>
                  {!currentMenu?.parentItem?.label && (
                    <div className='page-header-title min-w-0'>
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
                  {shouldShowPageDocLink(doc) && <PageDocLink link={doc} />}
                </div>

                <div className={'page-header-right-area flex-shrink-0'} style={{ display: sessionStorage.getItem('menuHide') === '1' ? 'none' : undefined }}>
                  <span className='page-layout-intro-container'>{introIcon}</span>
                  <div className='page-header-action-group'>
                    <Version />
                    {!IS_ENT && !IS_PLUS && (
                      <Button size='small' type='text' icon={<HistoryOutlined />} className='relative'>
                        <div className='product-changelog absolute bottom-[2px] left-[7px]'></div>
                      </Button>
                    )}
                    <FlashAiButton />
                    {rightArea}
                    <DocLink link={documentUrl} />
                    {!IS_ENT && !IS_PLUS && (
                      <Button className='text-hint text-[11px]' target='_blank' href='https://github.com/ccfos/nightingale/issues' size='small' icon={<GithubOutlined />}>
                        {t('submit_issue')}
                      </Button>
                    )}
                    <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                      <License />
                    </AdvancedWrap>
                    <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                      <FeatureNotification />
                    </AdvancedWrap>
                  </div>
                </div>
                {sessionStorage.getItem('menuHide') === '1' && <Space className='mr-2'>{rightArea}</Space>}
              </div>
            </div>
          )}
        </>
      )}

      {children && children}
    </div>
  );
};

export default PageLayout;
