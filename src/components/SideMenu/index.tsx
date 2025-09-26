import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import _ from 'lodash';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';

import { ScrollArea } from '@/components/ScrollArea';
import { CommonStateContext } from '@/App';
import { getSideMenuBgColor } from '@/components/pageLayout/SideMenuColorSetting';
import { IS_ENT } from '@/utils/constant';
import { getEmbeddedProducts } from '@/pages/embeddedProduct/services';
import { eventBus, EVENT_KEYS } from '@/pages/embeddedProduct/eventBus';
import { DETAIL_PATH as embeddedProductDetailPath } from '@/pages/embeddedProduct/constants';
import { V8_BETA_14_TS } from '@/utils/constant';

import { cn, getCurrentMenuList } from './utils';
import SideMenuHeader from './Header';
import MenuList from './MenuList';
// @ts-ignore
import QuickStart from './quickStart';
import QuickMenu from './QuickMenu';
import { MenuItem, DefaultLogos } from './types';
import './menu.less';
import './locale';

const calcUrlPath = (url: string) => {
  const urlPath = url.split('?')[0];
  return urlPath;
};

interface SideMenuProps {
  topExtra?: React.ReactElement;
  defaultLogos?: DefaultLogos;
  getMenuList?: (embeddedProductMenu?: MenuItem[], hideDeprecatedMenus?: boolean) => MenuItem[];
  onMenuClick?: (key: string) => void;
  isGoldTheme?: boolean;
}

const SideMenu = (props: SideMenuProps) => {
  const { i18n } = useTranslation('sideMenu');
  const { darkMode, perms, installTs } = useContext(CommonStateContext);
  let { sideMenuBgMode } = useContext(CommonStateContext);
  if (darkMode) {
    sideMenuBgMode = 'dark';
  }
  const {
    topExtra,
    defaultLogos = {
      light_menu_big_logo_url: '/image/logo-light-l.png',
      light_menu_small_logo_url: '/image/logo-light.png',
      menu_big_logo_url: '/image/logo-l.png',
      menu_small_logo_url: '/image/logo.png',
    },
    getMenuList = getCurrentMenuList,
    onMenuClick,
    isGoldTheme,
  } = props;
  const sideMenuBgColor = getSideMenuBgColor(isGoldTheme ? 'dark' : (sideMenuBgMode as any));
  const location = useLocation();
  const query = querystring.parse(location.search);
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [collapsed, setCollapsed] = useState<boolean>(Number(localStorage.getItem('menuCollapsed')) === 1);
  const [collapsedHover, setCollapsedHover] = useState<boolean>(false);
  const quickMenuRef = useRef<{ open: () => void }>({ open: () => {} });
  const isCustomBg = sideMenuBgMode !== 'light';
  const [embeddedProductMenu, setEmbeddedProductMenu] = useState<MenuItem[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const hideSideMenu = useMemo(() => {
    if (
      sessionStorage.getItem('menuHide') === '1' ||
      query?.menu === 'hide' ||
      location.pathname === '/login' ||
      location.pathname.startsWith('/chart/') ||
      location.pathname.startsWith('/events/screen/') ||
      location.pathname.startsWith('/dashboards/share/') ||
      location.pathname.startsWith('/callback') || // match /callback or /callback/${type}
      location.pathname.indexOf('/polaris/screen-v2/detail') === 0 ||
      location.pathname.indexOf('/polaris/screen/detail') === 0 ||
      location.pathname.indexOf('/firemap/screen/') === 0 ||
      location.pathname.indexOf('/firemap/screen-detail') === 0 ||
      location.pathname.indexOf('/topology-v2/detail') === 0 ||
      location.pathname.indexOf('/jiesuan/detail') === 0 ||
      location.pathname.indexOf('/template/screens/detail') === 0
    ) {
      return true;
    }
    if (
      location.pathname.indexOf('/dashboard') === 0 ||
      location.pathname.indexOf('/embedded-dashboards') === 0 ||
      location.pathname.indexOf('/components/dashboard/detail') === 0
    ) {
      const query = querystring.parse(location.search);
      if (query?.viewMode === 'fullscreen') {
        return true;
      }
      return false;
    }
    return false;
  }, [location.pathname, location.search]);

  const fetchEmbeddedProducts = () => {
    if (hideSideMenu) return;
    getEmbeddedProducts().then((res) => {
      if (res) {
        const items = res.map((product) => ({
          key: `${embeddedProductDetailPath}/${product.id}`,
          label: product.name,
          children: [],
        }));
        setEmbeddedProductMenu(items);
      }
    });
  };

  useEffect(() => {
    fetchEmbeddedProducts();
    eventBus.on(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED, fetchEmbeddedProducts);
    return () => {
      eventBus.off(EVENT_KEYS.EMBEDDED_PRODUCT_UPDATED, fetchEmbeddedProducts);
    };
  }, [hideSideMenu]);

  useEffect(() => {
    const filteredMenus = menuList
      .map((menu) => {
        const filteredChildren = menu.children
          .map((child) => {
            if (child.key.startsWith(`${embeddedProductDetailPath}/`)) {
              return child;
            }
            if (menu.key === '/flashduty') {
              if (perms?.includes('/flashduty')) {
                return child;
              }
            }
            if (child.type === 'tabs' && child.children) {
              const filteredTabs = child.children.filter((tab) => perms?.includes(tab.key));
              if (filteredTabs.length > 0) {
                return { ...child, children: filteredTabs };
              }
              return null;
            }
            return perms?.includes(calcUrlPath(child.key)) ? child : null;
          })
          .filter(Boolean);

        if (filteredChildren.length > 0) {
          return { ...menu, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean) as MenuItem[];

    setMenus(filteredMenus);
  }, [i18n.language, embeddedProductMenu]);

  const menuPaths = useMemo(
    () =>
      menus
        .filter((item) => item && item.children && item.children.length > 0)
        .map((item) => {
          return item
            .children!.filter((child) => {
              if (child.key.startsWith(`${embeddedProductDetailPath}/`)) {
                return child;
              }
              if (child.type === 'tabs' && child.children && child.children.length > 0) {
                return child.children.some((tabChild) => _.includes(perms, calcUrlPath(tabChild.key)));
              }
              return child && _.includes(perms, child.key);
            })
            .map((c) => {
              if (c.type === 'tabs' && c.children && c.children.length) {
                return c.children.map((g) => `${calcUrlPath(item.key)}|${calcUrlPath(g.key)}`);
              }
              return `${calcUrlPath(item.key)}|${calcUrlPath(c.key)}`;
            });
        })
        .filter(Boolean)
        .flat(2),
    [menus, perms],
  );

  useEffect(() => {
    let finalPath = ['', ''];
    menuPaths.forEach((path) => {
      if (!path) return;
      const pathArr = path.split('|');
      const realPath = pathArr ? pathArr[pathArr.length - 1] : '';
      const curPathname = location.pathname;

      if (pathArr && curPathname.startsWith(realPath) && realPath.length > finalPath[finalPath.length - 1].length) {
        finalPath = pathArr;
      }
    });

    if (selectedKeys?.join('|') !== finalPath.join('|')) {
      setSelectedKeys(finalPath);
    }
  }, [menuPaths, location.pathname, selectedKeys]);

  const hideDeprecatedMenus = installTs > V8_BETA_14_TS;
  const menuList = getMenuList(embeddedProductMenu, hideDeprecatedMenus);
  const uncollapsedWidth = i18n.language === 'en_US' || i18n.language === 'ru_RU' ? (IS_ENT ? 'w-[200px]' : 'w-[250px]') : 'w-[172px]';

  return (
    <div
      id='#tailwind'
      style={{
        display: hideSideMenu ? 'none' : 'flex',
      }}
    >
      <div
        className={cn('relative flex h-screen shrink-0', collapsed ? 'w-[64px]' : '')}
        onMouseEnter={() => {
          collapsed && setCollapsedHover(true);
        }}
        onMouseLeave={() => setCollapsedHover(false)}
      >
        <div
          className={cn(
            'z-20 flex h-full select-none flex-col justify-between border-0 border-r border-solid transition-width',
            collapsed ? 'w-[64px]' : uncollapsedWidth,
            collapsedHover ? `absolute ${uncollapsedWidth} shadow-mf` : '',
            !IS_ENT ? 'border-fc-300' : '',
          )}
          style={{ background: sideMenuBgColor, borderColor: 'var(--fc-border-color)' }}
        >
          <div className='flex flex-1 flex-col justify-between gap-8 overflow-hidden'>
            <SideMenuHeader collapsed={collapsed} collapsedHover={collapsedHover} sideMenuBgMode={sideMenuBgMode} defaultLogos={defaultLogos} />
            <ScrollArea className='-mr-2 flex-1'>
              <MenuList
                list={menus}
                collapsed={collapsed && !collapsedHover}
                selectedKeys={selectedKeys}
                sideMenuBgColor={sideMenuBgColor}
                isCustomBg={isCustomBg}
                quickMenuRef={quickMenuRef}
                topExtra={topExtra}
                onClick={onMenuClick}
                isGoldTheme={isGoldTheme}
              />
            </ScrollArea>
          </div>
          <div className='mx-2 my-2 shrink-0'>
            <div
              className={cn('flex h-10 cursor-pointer items-center justify-center rounded', isCustomBg ? 'text-[#fff] hover:bg-gray-200/20' : 'text-title hover:bg-fc-200')}
              onClick={() => {
                const nextCollapsed = !collapsed;
                setCollapsed(nextCollapsed);
                localStorage.setItem('menuCollapsed', nextCollapsed ? '1' : '0');
                setCollapsedHover(false);
              }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' />
              ) : (
                <MenuFoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' />
              )}
            </div>
          </div>
        </div>
      </div>

      {IS_ENT ? <QuickStart ref={quickMenuRef} items={menus} /> : <QuickMenu ref={quickMenuRef} menuList={menus} />}
    </div>
  );
};

export default SideMenu;
