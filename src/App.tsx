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
import React, { useEffect, useState, createContext, useRef } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// Modal 会被注入的代码所使用，请不要删除
import { ConfigProvider, Modal, Spin } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import 'antd/dist/antd.less';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import TaskOutput from '@/pages/taskOutput';
import TaskHostOutput from '@/pages/taskOutput/host';
import { getAuthorizedDatasourceCates, Cate } from '@/components/AdvancedWrap';
import { GetProfile } from '@/services/account';
import { getBusiGroups, getDatasourceBriefList, getMenuPerm } from '@/services/common';
import { getLicense } from '@/components/AdvancedWrap';
import { getVersions } from '@/components/pageLayout/Version/services';
import { getCleanBusinessGroupIds, getDefaultBusiness, getVaildBusinessGroup } from '@/components/BusinessGroup';
import Feedback from '@/components/Feedback';
import { getN9eConfig } from '@/pages/siteSettings/services';
import HeaderMenu from './components/menu/SideMenu';
import Content from './routers';
import { getDarkMode, updateDarkMode } from '@/utils/darkMode';

// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
// @ts-ignore
import CustomerServiceFloatButton from 'plus:/components/CustomerServiceFloatButton';

import './App.less';
import './global.variable.less';

interface IProfile {
  admin?: boolean;
  nickname: string;
  role: string;
  roles: string[];
  username: string;
  email: string;
  phone: string;
  id: number;
  portrait: string;
  contacts: { string?: string };
}

interface Datasource {
  id: number;
  name: string;
  plugin_type: string;
}

export interface ICommonState {
  datasourceCateOptions: Cate[];
  groupedDatasourceList: {
    [index: string]: Datasource[];
  };
  datasourceList: Datasource[];
  setDatasourceList: (list: Datasource[]) => void;
  busiGroups: {
    name: string;
    id: number;
    label_value?: string;
  }[];
  setBusiGroups: (groups: { name: string; id: number }[]) => void;
  curBusiId: number;
  setCurBusiId: (id: number) => void;
  businessGroup: {
    key?: string; // 业务组组件本身的key
    ids?: string; // 逗号分割 'id1,id2,id3'
    id?: number; // 叶子节点的id 用于兼容旧的代码
    isLeaf?: boolean;
  };
  setBusiGroup: (group: { key?: string; ids?: string; id?: number; isLeaf?: boolean }) => void;
  getVaildBusinessGroup: (busiGroups: any[], businessGroupKey: { key?: string; ids?: string; id?: number; isLeaf?: boolean }) => void;
  businessGroupOnChange: (key: string) => void;
  profile: IProfile;
  setProfile: (profile: IProfile) => void;
  licenseRulesRemaining?: number;
  licenseExpireDays?: number;
  licenseExpired: boolean;
  versions: {
    version: string;
    github_verison: string;
    newVersion: boolean;
  };
  feats?: {
    fcBrain: boolean;
    plugins: any[];
  };
  isPlus: boolean;
  siteInfo?: { [index: string]: string };
  sideMenuBgMode: string;
  setSideMenuBgMode: (color: string) => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  dashboardDefaultRangeIndex?: string;
  esIndexMode: string;
  dashboardSaveMode: 'auto' | 'manual';
  perms?: string[];
  screenTemplates?: string[];
}

export const basePrefix = import.meta.env.VITE_PREFIX || '';

// 可以匿名访问的路由 TODO: job-task output 应该也可以匿名访问
const anonymousRoutes = [`${basePrefix}/login`, `${basePrefix}/callback`, `${basePrefix}/chart`, `${basePrefix}/dashboards/share/`];
// 判断是否是匿名访问的路由
const anonymous = _.some(anonymousRoutes, (route) => location.pathname.startsWith(route));
// 初始化数据 context
export const CommonStateContext = createContext({} as ICommonState);

function App() {
  const { t, i18n } = useTranslation();
  const isPlus = useIsPlus();
  const initialized = useRef(false);
  const [commonState, setCommonState] = useState<ICommonState>({
    datasourceCateOptions: [],
    groupedDatasourceList: {},
    datasourceList: [],
    setDatasourceList: (datasourceList) => {
      setCommonState((state) => ({ ...state, datasourceList, groupedDatasourceList: _.groupBy(datasourceList, 'plugin_type') }));
    },
    busiGroups: [],
    setBusiGroups: (busiGroups) => {
      setCommonState((state) => ({ ...state, busiGroups }));
    },
    curBusiId: window.localStorage.getItem('curBusiId') ? Number(window.localStorage.getItem('curBusiId')) : 0,
    setCurBusiId: (id: number) => {
      window.localStorage.setItem('curBusiId', String(id));
      setCommonState((state) => ({ ...state, curBusiId: id }));
    },
    businessGroup: {},
    setBusiGroup: (businessGroup) => {
      setCommonState((state) => ({ ...state, businessGroup }));
    },
    getVaildBusinessGroup,
    businessGroupOnChange: (key: string) => {
      window.localStorage.setItem('businessGroupKey', key);
      const ids = getCleanBusinessGroupIds(key);
      setCommonState((state) => ({
        ...state,
        businessGroup: {
          key,
          ids,
          id: _.map(_.split(ids, ','), _.toNumber)?.[0],
          isLeaf: !_.startsWith(key, 'group,'),
        },
      }));
    },
    profile: {} as IProfile,
    setProfile: (profile: IProfile) => {
      setCommonState((state) => ({ ...state, profile }));
    },
    licenseExpired: false,
    versions: {
      version: '',
      github_verison: '',
      newVersion: false,
    },
    isPlus,
    sideMenuBgMode: localStorage.getItem('sideMenuBgMode') || 'theme',
    setSideMenuBgMode: (mode: string) => {
      window.localStorage.setItem('sideMenuBgMode', mode);
      setCommonState((state) => ({ ...state, sideMenuBgMode: mode }));
    },
    darkMode: getDarkMode(),
    setDarkMode: (mode: boolean) => {
      updateDarkMode(mode);
      setCommonState((state) => ({ ...state, darkMode: mode }));
    },
    esIndexMode: 'all',
    dashboardSaveMode: 'manual',
    screenTemplates: [],
  });

  useEffect(() => {
    if (location.pathname === '/out-of-service') {
      initialized.current = true;
      setCommonState({ ...commonState }); // 为了触发重新渲染
      return;
    }
    try {
      (async () => {
        const iconLink = document.querySelector("link[rel~='icon']") as any;
        let siteInfo;
        const siteInfoStr = await getN9eConfig('site_info');
        if (siteInfoStr) {
          try {
            siteInfo = JSON.parse(siteInfoStr);
          } catch (e) {
            console.error(e);
          }
        }
        document.title = siteInfo?.page_title || 'Nightingale';
        if (iconLink) {
          iconLink.href = siteInfo?.favicon_url || '/image/favicon.ico';
        }
        // 非匿名访问，需要初始化一些公共数据
        if (!anonymous) {
          const { dat: profile } = await GetProfile();
          const { dat: busiGroups } = await getBusiGroups();
          const { dat: perms } = await getMenuPerm();
          const datasourceList = await getDatasourceBriefList();
          const { licenseRulesRemaining, licenseExpireDays, feats } = await getLicense(t);
          let versions = { version: '', github_verison: '', newVersion: false };
          if (!isPlus) {
            versions = await getVersions();
          }
          /* 兼容旧的业务组组件 */
          const defaultBusiId = commonState.curBusiId || busiGroups?.[0]?.id;
          window.localStorage.setItem('curBusiId', String(defaultBusiId));
          /* 兼容旧的业务组组件 */
          initialized.current = true;

          setCommonState((state) => {
            return {
              ...state,
              profile,
              busiGroups,
              businessGroup: getDefaultBusiness(busiGroups),
              datasourceCateOptions: getAuthorizedDatasourceCates(feats, isPlus, (cate) => {
                const groupedDatasourceList = _.groupBy(datasourceList, 'plugin_type');
                return !_.isEmpty(groupedDatasourceList[cate.value]);
              }),
              groupedDatasourceList: _.groupBy(datasourceList, 'plugin_type'),
              datasourceList: datasourceList,
              curBusiId: defaultBusiId,
              licenseRulesRemaining,
              licenseExpireDays,
              licenseExpired: licenseExpireDays !== undefined && licenseExpireDays <= 0,
              versions,
              feats,
              siteInfo,
              perms,
            };
          });
        } else {
          const datasourceList = !_.some([`${basePrefix}/login`, `${basePrefix}/callback`], (route) => location.pathname.startsWith(route)) ? await getDatasourceBriefList() : [];
          initialized.current = true;
          setCommonState((state) => {
            return {
              ...state,
              groupedDatasourceList: _.groupBy(datasourceList, 'plugin_type'),
              datasourceList: datasourceList,
              siteInfo,
            };
          });
        }
      })();
    } catch (error) {
      console.error(error);
      location.href = basePrefix + '/out-of-service';
    }
  }, []);

  useEffect(() => {
    if (!location.pathname.startsWith('/login')) {
      document.body.className = commonState.darkMode ? 'theme-dark' : 'theme-light';
      // TODO: 临时兼容 Class 组件的写法
      localStorage.setItem('n9e-dark-mode', _.toString(commonState.darkMode));
      window.dispatchEvent(new Event('n9e-dark-mode-update'));
    }
  }, [commonState.darkMode]);

  // 初始化中不渲染任何内容
  if (!initialized.current) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='App'>
      <CommonStateContext.Provider value={commonState}>
        <ConfigProvider locale={i18n.language == 'en_US' ? enUS : zhCN}>
          <Router
            getUserConfirmation={(message, callback) => {
              if (message === 'CUSTOM') return;
              window.confirm(message) ? callback(true) : callback(false);
            }}
            basename={basePrefix}
          >
            <Switch>
              <Route exact path='/job-task/:busiId/output/:taskId/:outputType' component={TaskOutput} />
              <Route exact path='/job-task/:busiId/output/:taskId/:host/:outputType' component={TaskHostOutput} />
              <>
                {location.pathname !== `${basePrefix}/out-of-service` && <HeaderMenu />}
                <Content />
              </>
            </Switch>
            <Feedback />
          </Router>
        </ConfigProvider>
      </CommonStateContext.Provider>
      {/* {import.meta.env.VITE_IS_ENT !== 'true' && import.meta.env.VITE_IS_PRO === 'true' && <CustomerServiceFloatButton />} */}
    </div>
  );
}

export default App;
