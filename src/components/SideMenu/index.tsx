import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Dropdown, Menu, Drawer, Tooltip } from 'antd';
import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import _ from 'lodash';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';

import { ScrollArea } from '@/components/ScrollArea';
import { CommonStateContext } from '@/App';
import { getSideMenuBgColor } from '@/components/pageLayout/SideMenuColorSetting';
import SideMenuColorSetting from '@/components/pageLayout/SideMenuColorSetting';
import LanguageIcon from '@/components/pageLayout/icons/LanguageIcon';
import { Logout } from '@/services/login';
import { AccessTokenKey, IS_ENT } from '@/utils/constant';
import { getEmbeddedProducts } from '@/pages/embeddedProduct/services';
import { eventBus, EVENT_KEYS } from '@/pages/embeddedProduct/eventBus';
import { DETAIL_PATH as embeddedProductDetailPath } from '@/pages/embeddedProduct/constants';
import { V8_BETA_14_TS } from '@/utils/constant';

import { cn, getCurrentMenuList } from './utils';
import SideMenuHeader from './Header';
import MenuList from './MenuList';
// @ts-ignore
import QuickStart from 'plus:/components/quickStart';
import QuickMenu from './QuickMenu';
import { MenuItem, DefaultLogos } from './types';
import { getSidebarProfileDisplay } from './profile';
import './menu.less';
import './locale';
import '@/components/pageLayout/locale';

const calcUrlPath = (url: string) => {
  const urlPath = url.split('?')[0];
  return urlPath;
};

/** 侧栏展开宽度（px），持久化 localStorage */
const SIDE_MENU_WIDTH_STORAGE_KEY = 'sideMenuWidthPx';
const SIDE_MENU_MIN_WIDTH = 170;
const SIDE_MENU_MAX_WIDTH = 400;
const i18nMap: Record<string, string> = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
  ja_JP: '日本語',
  ru_RU: 'Русский',
};

function clampSideMenuWidth(px: number): number {
  return Math.min(SIDE_MENU_MAX_WIDTH, Math.max(SIDE_MENU_MIN_WIDTH, Math.round(px)));
}

function readInitialSideMenuWidth(): number {
  try {
    const raw = localStorage.getItem(SIDE_MENU_WIDTH_STORAGE_KEY);
    if (raw != null) {
      const n = Number(raw);
      if (Number.isFinite(n)) return clampSideMenuWidth(n);
    }
    const lang = localStorage.getItem('i18nextLng') || 'zh_CN';
    const def = lang === 'en_US' || lang === 'ru_RU' ? 250 : 172;
    return clampSideMenuWidth(def);
  } catch {
    return 172;
  }
}

interface SideMenuProps {
  topExtra?: React.ReactElement;
  defaultLogos?: DefaultLogos;
  getMenuList?: (embeddedProductMenu?: MenuItem[], hideDeprecatedMenus?: boolean) => MenuItem[];
  onMenuClick?: (key: string) => void;
  isGoldTheme?: boolean;
}

const SideMenu = (props: SideMenuProps) => {
  const { i18n, t } = useTranslation(['sideMenu', 'pageLayout']);
  const history = useHistory();
  const { darkMode, perms, installTs, profile, i18nList } = useContext(CommonStateContext);
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
  const [menuWidthPx, setMenuWidthPx] = useState<number>(readInitialSideMenuWidth);
  const [isResizingMenu, setIsResizingMenu] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const quickMenuRef = useRef<{ open: () => void }>({ open: () => {} });
  const resizeActiveRef = useRef(false);
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
        const items = res
          .filter((product) => !(product.hide ?? true))
          .map((product) => ({
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

  useEffect(() => {
    try {
      localStorage.setItem(SIDE_MENU_WIDTH_STORAGE_KEY, String(menuWidthPx));
    } catch {
      /* ignore */
    }
  }, [menuWidthPx]);

  const onResizeHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (collapsed) return;
      e.preventDefault();
      e.stopPropagation();
      resizeActiveRef.current = true;
      setIsResizingMenu(true);
      const startX = e.clientX;
      const startW = menuWidthPx;
      const onMove = (ev: MouseEvent) => {
        if (!resizeActiveRef.current) return;
        const delta = ev.clientX - startX;
        setMenuWidthPx(clampSideMenuWidth(startW + delta));
      };
      const onUp = () => {
        resizeActiveRef.current = false;
        setIsResizingMenu(false);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [collapsed, menuWidthPx],
  );

  const expandedMenuWidth = collapsed ? 56 : menuWidthPx;
  const toggleCollapsed = () => {
    const nextCollapsed = !collapsed;
    setCollapsed(nextCollapsed);
    localStorage.setItem('menuCollapsed', nextCollapsed ? '1' : '0');
  };
  const profileDisplay = getSidebarProfileDisplay(profile);
  const languageMenu = (
    <Menu className='side-menu-tool-menu'>
      {Object.keys(i18nMap)
        .filter((el) => (i18nList ? i18nList.includes(el) : true))
        .map((el) => (
          <Menu.Item
            key={el}
            onClick={() => {
              i18n.changeLanguage(el);
              localStorage.setItem('language', el);
            }}
          >
            {i18nMap[el]}
          </Menu.Item>
        ))}
    </Menu>
  );
  const profileMenu = (
    <Menu className='side-menu-profile-menu'>
      <Menu.Item
        key='profile'
        icon={<UserOutlined />}
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('profile', { ns: 'pageLayout' })}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key='logout'
        icon={<LogoutOutlined />}
        onClick={() => {
          Logout().then((res) => {
            localStorage.removeItem(AccessTokenKey);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('curBusiId');
            if (res.dat && typeof res.dat === 'string') {
              window.location.href = res.dat;
            } else {
              history.push('/login');
            }
          });
        }}
      >
        {t('logout', { ns: 'pageLayout' })}
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      id='#tailwind'
      style={{
        display: hideSideMenu ? 'none' : 'flex',
      }}
    >
      <div
        className={cn('relative flex h-screen shrink-0', collapsed ? 'w-[56px]' : '')}
      >
        <aside
          className={cn(
            'relative z-20 flex h-full shrink-0 select-none flex-col justify-between border-0 border-r border-solid bg-sidebar',
            !isResizingMenu && 'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
            !IS_ENT ? 'border-fc-300' : '',
          )}
          style={{
            width: expandedMenuWidth,
            minWidth: expandedMenuWidth,
            maxWidth: expandedMenuWidth,
            background: sideMenuBgColor,
            borderColor: isCustomBg ? 'var(--fc-border-color)' : 'var(--fc-sidemenu-border)',
          }}
        >
          {!collapsed && (
            <div
              role='separator'
              aria-orientation='vertical'
              aria-label={t('resizeWidth')}
              title={t('resizeWidth')}
              className={cn('absolute right-0 top-0 z-30 h-full w-1 cursor-col-resize touch-none', 'hover:bg-[var(--fc-text-link)]/25 active:bg-[var(--fc-text-link)]/35')}
              onMouseDown={onResizeHandleMouseDown}
            />
          )}
          <div className='flex flex-1 flex-col justify-between gap-0 overflow-hidden'>
            <SideMenuHeader
              collapsed={collapsed}
              sideMenuBgMode={sideMenuBgMode}
              defaultLogos={defaultLogos}
              onToggleCollapse={toggleCollapsed}
              toggleTitle={collapsed ? t('expand') : t('collapse')}
            />
            <div
              className={cn(
                'shrink-0 h-px',
                collapsed ? 'mx-2' : 'mx-3',
                isCustomBg ? 'bg-[rgba(255,255,255,0.12)]' : 'bg-[hsla(240,5%,92%,0.7)]',
              )}
            />
            <ScrollArea className='-mr-2 mt-3 flex-1'>
              <MenuList
                list={menus}
                collapsed={collapsed}
                selectedKeys={selectedKeys}
                sideMenuBgColor={sideMenuBgColor}
                isCustomBg={isCustomBg}
                quickMenuRef={quickMenuRef}
                topExtra={topExtra}
                onClick={(key, opts) => {
                  if (collapsed && !opts?.keepCollapsed) {
                    setCollapsed(false);
                    localStorage.setItem('menuCollapsed', '0');
                  }
                  onMenuClick?.(key);
                }}
                isGoldTheme={isGoldTheme}
              />
            </ScrollArea>
          </div>
          <div className={cn('shrink-0 px-2 py-1', collapsed ? 'flex justify-center' : '')}>
            <div className={cn('side-menu-tool-list', collapsed ? 'side-menu-tool-list-collapsed' : '')}>
              <Tooltip title={collapsed ? t('themeSetting', { ns: 'pageLayout' }) : undefined} placement='right'>
                <button
                  type='button'
                  className={cn('side-menu-tool-button', isCustomBg ? 'side-menu-tool-button-on-dark' : '')}
                  onClick={() => {
                    setThemeVisible(true);
                  }}
                >
                  <SettingOutlined />
                </button>
              </Tooltip>
              {!collapsed && <span className={cn('side-menu-tool-divider', isCustomBg ? 'side-menu-tool-divider-on-dark' : '')} />}
              <Dropdown overlay={languageMenu} trigger={['click']} placement={collapsed ? 'topRight' : 'topLeft'}>
                <Tooltip title={collapsed ? i18nMap[i18n.language] || i18n.language : undefined} placement='right'>
                  <button type='button' className={cn('side-menu-tool-button side-menu-language-button', isCustomBg ? 'side-menu-tool-button-on-dark' : '')}>
                    <LanguageIcon />
                    {!collapsed && <span>{i18nMap[i18n.language] || i18n.language}</span>}
                  </button>
                </Tooltip>
              </Dropdown>
            </div>
          </div>
          <div
            className={cn(
              'shrink-0 border-0 border-t border-solid px-2 py-2',
              isCustomBg ? 'border-[rgba(255,255,255,0.12)]' : 'border-[var(--fc-sidemenu-border)]',
            )}
          >
            <Dropdown overlay={profileMenu} trigger={['click']} placement={collapsed ? 'topRight' : 'topLeft'}>
              <button
                type='button'
                className={cn(
                  'flex w-full cursor-pointer items-center rounded border-0 bg-transparent p-0 text-left transition-colors',
                  collapsed ? 'h-10 justify-center' : 'h-12 gap-2 px-2',
                  isCustomBg ? 'text-[#fff] hover:bg-gray-200/20' : 'text-title hover:bg-fc-200',
                )}
              >
                <span className='side-menu-profile-avatar'>
                  {profile?.portrait ? <img src={profile.portrait} /> : <span>{profileDisplay.initial}</span>}
                </span>
                {!collapsed && (
                  <>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[13px] font-medium leading-5'>{profileDisplay.name}</span>
                      {profileDisplay.detail && <span className='block truncate text-[11px] leading-4 text-hint'>{profileDisplay.detail}</span>}
                    </span>
                    <DownOutlined className='text-[10px] text-hint' />
                  </>
                )}
              </button>
            </Dropdown>
          </div>
        </aside>
      </div>

      {IS_ENT ? <QuickStart ref={quickMenuRef} items={menus} /> : <QuickMenu ref={quickMenuRef} menuList={menus} />}
      <Drawer
        closable={false}
        visible={themeVisible}
        onClose={() => {
          setThemeVisible(false);
        }}
      >
        <div>
          <div>
            <div className='text-lg font-semibold dark:text-slate-50 text-l1'>{t('theme.title', { ns: 'pageLayout' })}</div>
            <div className='text-sm text-hint mt-1'>{t('theme.title_help', { ns: 'pageLayout' })}</div>
          </div>
          <div className='mt-6'>
            <span className='font-semibold'>{t('theme.sideMenu', { ns: 'pageLayout' })}</span>{' '}
            <span className='ml-2 text-hint'>{t('theme.sideMenu_help', { ns: 'pageLayout' })}</span>
          </div>
          <div className='m-2'>
            <SideMenuColorSetting />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default SideMenu;
