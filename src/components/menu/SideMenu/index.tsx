import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { MenuUnfoldOutlined, MenuFoldOutlined, NotificationFilled } from '@ant-design/icons';
import _ from 'lodash';
import querystring from 'query-string';
import { useTranslation } from 'react-i18next';
import { getMenuPerm } from '@/services/common';
import { ScrollArea } from '@/components/ScrollArea';
import { CommonStateContext } from '@/App';
import { getSideMenuBgColor } from '@/components/pageLayout/SideMenuColorSetting';
import IconFont from '../../IconFont';
import { cn } from './utils';
import SideMenuHeader from './Header';
import MenuList from './MenuList';
import QuickMenu from './QuickMenu';
import { IMenuItem } from './types';
import './menu.less';
import '../locale';

// @ts-ignore
import getPlusMenu from 'plus:/menu';

export const getMenuList = (t) => {
  const menuList = [
    {
      key: 'dashboard',
      icon: <IconFont type='icon-Menu_Dashboard' />,
      label: t('仪表盘'),
      children: [
        {
          key: '/dashboards',
          label: t('监控仪表盘'),
        },
        {
          key: '/dashboards-built-in',
          label: t('内置仪表盘'),
        },
      ],
    },
    {
      key: 'metric',
      icon: <IconFont type='icon-IndexManagement1' />,
      label: t('时序指标'),
      children: [
        {
          key: '/metric/explorer',
          label: t('即时查询'),
        },
        {
          key: '/object/explorer',
          label: t('快捷视图'),
        },
        {
          key: '/recording-rules',
          label: t('记录规则'),
        },
      ],
    },
    {
      key: 'log',
      icon: <IconFont type='icon-Menu_LogAnalysis' />,
      label: t('日志分析'),
      children: [
        {
          key: '/log/explorer',
          label: t('即时查询'),
        },
        {
          key: '/log/index-patterns',
          label: t('索引模式'),
        },
      ],
    },
    {
      key: 'alarm',
      icon: <IconFont type='icon-Menu_AlarmManagement' />,
      label: t('告警管理'),
      children: [
        {
          key: '/alert-rules',
          label: t('告警规则'),
        },
        {
          key: '/alert-rules-built-in',
          label: t('内置规则'),
        },
        {
          key: '/alert-mutes',
          label: t('屏蔽规则'),
        },
        {
          key: '/alert-subscribes',
          label: t('订阅规则'),
        },
        {
          key: '/alert-cur-events',
          label: t('活跃告警'),
        },
        {
          key: '/alert-his-events',
          label: t('历史告警'),
        },
      ],
    },
    {
      key: 'notification',
      icon: <NotificationFilled />,
      label: t('告警通知'),
      children: [
        {
          key: '/help/notification-settings',
          label: t('通知设置'),
        },
        {
          key: '/help/notification-tpls',
          label: t('通知模板'),
        },
      ],
    },
    {
      key: 'job',
      icon: <IconFont type='icon-Menu_AlarmSelfhealing' />,
      label: t('告警自愈'),
      children: [
        {
          key: '/job-tpls',
          label: t('自愈脚本'),
        },
        {
          key: '/job-tasks',
          label: t('执行历史'),
        },
        {
          key: '/ibex-settings',
          label: t('自愈配置'),
        },
      ],
    },
    {
      key: 'targets',
      icon: <IconFont type='icon-Menu_Infrastructure' />,
      label: t('基础设施'),
      children: [
        {
          key: '/targets',
          label: t('监控机器'),
        },
      ],
    },
    {
      key: 'manage',
      icon: <IconFont type='icon-Menu_PersonnelOrganization' />,
      label: t('人员组织'),
      children: [
        {
          key: '/users',
          label: t('用户管理'),
        },
        {
          key: '/user-groups',
          label: t('团队管理'),
        },
        {
          key: '/busi-groups',
          label: t('业务组管理'),
        },
        {
          key: '/permissions',
          label: t('权限管理'),
        },
      ],
    },
    {
      key: 'help',
      icon: <IconFont type='icon-Menu_SystemInformation' />,
      label: t('系统配置'),
      children: [
        {
          key: '/help/source',
          label: t('数据源'),
        },
        {
          key: '/help/variable-configs',
          label: t('变量设置'),
        },
        {
          key: '/help/sso',
          label: t('单点登录'),
        },
        {
          key: '/help/servers',
          label: t('告警引擎'),
        },
        {
          key: '/site-settings',
          label: t('siteInfo:title'),
        },
        // {
        //   key: '/help/migrate',
        //   label: t('仪表盘迁移'),
        // },
        {
          key: '/help/version',
          label: t('系统版本'),
        },
      ],
    },
  ];
  return menuList;
};

const SideMenu = () => {
  const { t, i18n } = useTranslation('menu');
  const { profile, isPlus, sideMenuBgMode } = useContext(CommonStateContext);
  const sideMenuBgColor = getSideMenuBgColor(sideMenuBgMode as any);
  const history = useHistory();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>();
  const [collapsed, setCollapsed] = useState<boolean>(Number(localStorage.getItem('menuCollapsed')) === 1);
  const [collapsedHover, setCollapsedHover] = useState<boolean>(false);
  const quickMenuRef = useRef<{ open: () => void }>({ open: () => {} });
  const isCustomBg = sideMenuBgMode !== 'light';
  const menuList = isPlus ? getPlusMenu(t) : getMenuList(t);
  const [menus, setMenus] = useState<IMenuItem[]>(menuList);
  const menuPaths = useMemo(
    () =>
      menuList
        .map((item) => (item?.children?.length ? item.children.map((c) => `${item.key}|${c?.key || ''}`) : `${item?.key}|${item?.key}`))
        .filter((p) => p)
        .flat(),
    [menuList],
  );
  const hideSideMenu = useMemo(() => {
    if (
      location.pathname === '/login' ||
      location.pathname.startsWith('/chart/') ||
      location.pathname.startsWith('/dashboards/share/') ||
      location.pathname === '/callback' ||
      location.pathname.indexOf('/polaris/screen') === 0
    ) {
      return true;
    }
    // 大盘全屏模式下也需要隐藏左侧菜单
    if (location.pathname.indexOf('/dashboard') === 0) {
      const query = querystring.parse(location.search);
      if (query?.viewMode === 'fullscreen') {
        return true;
      }
      return false;
    }
    return false;
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (profile?.roles?.length > 0) {
      getMenuPerm().then((res) => {
        const { dat } = res;
        // 过滤掉没有权限的菜单
        const newMenus: any = _.filter(
          _.map(menuList, (menu) => {
            return {
              ...menu,
              children: _.filter(menu.children, (item) => item && dat.includes(item.key)),
            };
          }),
          (item) => {
            return item.children && item.children.length > 0;
          },
        );
        setMenus(newMenus);
      });
    }
  }, [profile?.roles, i18n.language]);

  useEffect(() => {
    let finalPath = ['', ''];
    menuPaths.forEach((path) => {
      const pathArr = path?.split('|');
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

  const uncollapsedWidth = i18n.language === 'en_US' ? 'w-[210px]' : 'w-[172px]';

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
            'z-20 flex h-full select-none flex-col justify-between border-0 transition-width',
            collapsed ? 'w-[64px]' : uncollapsedWidth,
            collapsedHover ? `absolute ${uncollapsedWidth} shadow-mf` : '',
          )}
          style={{ background: sideMenuBgColor }}
        >
          <div className='flex flex-1 flex-col justify-between gap-8 overflow-hidden'>
            <SideMenuHeader collapsed={collapsed} collapsedHover={collapsedHover} sideMenuBgMode={sideMenuBgMode} />
            <ScrollArea className='-mr-2 flex-1'>
              <MenuList
                list={menus}
                collapsed={collapsed && !collapsedHover}
                selectedKeys={selectedKeys}
                onClick={(key) => {
                  if (key.startsWith('/')) {
                    history.push(key);
                  }
                }}
                sideMenuBgColor={sideMenuBgColor}
                isCustomBg={isCustomBg}
                quickMenuRef={quickMenuRef}
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
      <QuickMenu ref={quickMenuRef} menuList={menus} />
    </div>
  );
};

export default SideMenu;
