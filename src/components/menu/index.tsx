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
import { FloatFcMenu } from '@fc-components/menu';
import React, { FC, useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Icon from '@ant-design/icons';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import querystring from 'query-string';
import { getMenuPerm } from '@/services/common';
import { CommonStateContext } from '@/App';
import IconFont from '../IconFont';
import menuIcon from './configs';
import './menu.less';
import './locale';

const getMenuList = (t) => {
  const menuList = [
    {
      key: 'dashboard',
      icon: <IconFont type='icon-Menu_Dashboard' />,
      activeIcon: <Icon component={menuIcon.Dashboard as any} />,
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
      key: 'alarm',
      icon: <IconFont type='icon-Menu_AlarmManagement' />,
      activeIcon: <Icon component={menuIcon.AlarmManagement as any} />,
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
      key: 'metric',
      icon: <IconFont type='icon-IndexManagement1' />,
      activeIcon: <Icon component={menuIcon.IndexManagement as any} />,
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
      activeIcon: <Icon component={menuIcon.LogAnalysis as any} />,
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
    // {
    //   key: 'trace',
    //   icon: <IconFont type='icon-Menu_LinkAnalysis' />,
    //   activeIcon: <Icon component={menuIcon.LinkAnalysis as any} />,
    //   label: t('链路追踪'),
    //   children: [
    //     {
    //       key: '/trace/explorer',
    //       label: t('即时查询'),
    //     },
    //     {
    //       key: '/trace/dependencies',
    //       label: t('拓扑分析'),
    //     },
    //   ],
    // },
    {
      key: 'targets',
      icon: <IconFont type='icon-Menu_Infrastructure' />,
      activeIcon: <Icon component={menuIcon.Infrastructure as any} />,
      label: t('基础设施'),
      children: [
        {
          key: '/targets',
          label: t('监控机器'),
        },
      ],
    },

    {
      key: 'job',
      icon: <IconFont type='icon-Menu_AlarmSelfhealing' />,
      activeIcon: <Icon component={menuIcon.AlarmSelfhealing as any} />,
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
      key: 'manage',
      icon: <IconFont type='icon-Menu_PersonnelOrganization' />,
      activeIcon: <Icon component={menuIcon.PersonnelOrganization as any} />,
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
      activeIcon: <Icon component={menuIcon.SystemInformation as any} />,
      label: t('系统配置'),
      children: [
        {
          key: '/help/source',
          label: t('数据源'),
        },
        {
          key: '/help/notification-settings',
          label: t('通知设置'),
        },
        {
          key: '/help/notification-tpls',
          label: t('通知模板'),
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
          key: '/help/migrate',
          label: t('仪表盘迁移'),
        },
        {
          key: '/help/version',
          label: t('系统版本'),
        },
      ],
    },
  ];
  if (import.meta.env['VITE_IS_PRO']) {
    const targets = _.find(menuList, (item) => item.key === 'targets');

    if (targets) {
      targets.children?.push({
        key: '/collects',
        label: t('采集配置'),
      });
      targets.children?.push({
        key: '/network-devices',
        label: t('网络设备'),
      });
      targets.children?.push({
        key: '/collect-tpls',
        label: t('采集模板'),
      });
    }
    const systemMenu = _.find(menuList, (item) => item.key === 'help');
    if (systemMenu) {
      systemMenu.children.splice(6, 0, {
        key: '/global-muting-rules',
        label: t('全局屏蔽'),
      });
    }

    const logIndex = _.findIndex(menuList, (item) => item.key === 'log');
    if (logIndex !== -1) {
      menuList.splice(logIndex, 0, {
        key: 'dial-analysis',
        icon: <Icon component={menuIcon.DialAnalysis as any} />,
        activeIcon: <Icon component={menuIcon.DialAnalysisHover as any} />,
        label: t('拨测分析'),
        children: [
          {
            key: '/dial-analysis',
            label: t('拨测管理'),
          },
          {
            key: '/dial-status',
            label: t('拨测状态'),
          },
        ],
      });
    }
  }
  return menuList;
};

const SideMenu: FC = () => {
  const { t, i18n } = useTranslation('menu');
  const { profile } = useContext(CommonStateContext);
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState<string[]>();
  const menuList = getMenuList(t);
  const [menus, setMenus] = useState(menuList);
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;
  const [collapsed, setCollapsed] = useState<'0' | '1' | '2' | string | null>(localStorage.getItem('menuCollapsed') || '0');
  const switchCollapsed = () => {
    if (!isNaN(Number(collapsed))) {
      const newColl = (Number(collapsed) === 2 ? -1 : Number(collapsed)) + 1 + '';
      setCollapsed(newColl);
      localStorage.setItem('menuCollapsed', newColl);
    } else {
      setCollapsed('1');
      localStorage.setItem('menuCollapsed', '1');
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  };
  const handleClick = (key) => {
    if ((key as string).startsWith('/')) {
      history.push(key as string);
    }
  };
  const hideSideMenu = () => {
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
  };

  useEffect(() => {
    setDefaultSelectedKeys([]);
    for (const item of menuList) {
      if (item && item.key.startsWith('/') && pathname.includes(item.key)) {
        setDefaultSelectedKeys([item?.key]);
        break;
      } else if (item?.children && item.children.length > 0) {
        for (const i of item.children) {
          if (i && (pathname === i.key || pathname.startsWith(i.key + '/'))) {
            setDefaultSelectedKeys([item?.key, i.key!]);
            break;
          }
        }
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (profile?.roles?.length > 0) {
      if (profile?.roles.indexOf('Admin') === -1) {
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
      } else {
        setMenus(menuList);
      }
    }
  }, [profile?.roles, i18n.language]);

  return (
    <div
      style={{
        display: hideSideMenu() ? 'none' : 'flex',
        flexDirection: 'column',
        padding: '10px 0 10px 10px',
      }}
      className={classNames({
        'menu-container': true,
        'menu-container-en': i18n.language === 'en_US' && collapsed === '0',
      })}
    >
      {collapsed !== '2' && (
        <div
          className={classNames({
            home: true,
            collapse: collapsed === '1',
          })}
        >
          <div className='name' onClick={() => history.push('/metric/explorer')} key='overview'>
            <img src={collapsed === '1' ? '/image/logo.svg' : '/image/logo-l.svg'} alt='' className='logo' />
          </div>
        </div>
      )}
      <FloatFcMenu
        fullModeWidth={i18n.language === 'en_US' ? 180 : undefined}
        items={menus}
        selectedKeys={defaultSelectedKeys}
        onClick={handleClick}
        collapsed={collapsed}
        switchCollapsed={switchCollapsed}
        quickIcon={<IconFont type='icon-Menu_Search' />}
        quickActiveIcon={<Icon component={menuIcon.Menu_Search as any} />}
      />
    </div>
  );
};

export default SideMenu;
