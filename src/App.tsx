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
import { ConfigProvider, Modal } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import 'antd/dist/antd.less';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import TaskOutput from '@/pages/taskOutput';
import TaskHostOutput from '@/pages/taskOutput/host';
import { getAuthorizedDatasourceCates, Cate } from '@/components/AdvancedWrap';
import { GetProfile } from '@/services/account';
import { getBusiGroups, getDatasourceBriefList } from '@/services/common';
import { getLicense } from '@/components/AdvancedWrap';
import { getVersions } from '@/components/pageLayout/Version/services';
import HeaderMenu from './components/menu/SideMenu';
import Content from './routers';

// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
// @ts-ignore
import { getN9eConfig } from 'plus:/pages/SiteInfo/services';
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
  }[];
  setBusiGroups: (groups: { name: string; id: number }[]) => void;
  curBusiId: number;
  setCurBusiId: (id: number) => void;
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
}

// 可以匿名访问的路由 TODO: job-task output 应该也可以匿名访问
const anonymousRoutes = ['/login', '/callback', '/chart', '/dashboards/share/'];
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
  });

  useEffect(() => {
    try {
      (async () => {
        const iconLink = document.querySelector("link[rel~='icon']") as any;
        let siteInfo;
        if (isPlus) {
          const siteInfoStr = await getN9eConfig('site_info');
          if (siteInfoStr) {
            try {
              siteInfo = JSON.parse(siteInfoStr);
            } catch (e) {
              console.error(e);
            }
          }
        }
        document.title = siteInfo?.page_title || 'Nightingale';
        if (iconLink) {
          iconLink.href = siteInfo?.menu_small_logo_url || '/image/favicon.svg';
        }
        // 非匿名访问，需要初始化一些公共数据
        if (!anonymous) {
          const { dat: profile } = await GetProfile();
          const { dat: busiGroups } = await getBusiGroups();
          const datasourceList = await getDatasourceBriefList();
          const { licenseRulesRemaining, licenseExpireDays, feats } = await getLicense(t);
          let versions = { version: '', github_verison: '', newVersion: false };
          if (!isPlus) {
            versions = await getVersions();
          }
          const defaultBusiId = commonState.curBusiId || busiGroups?.[0]?.id;
          window.localStorage.setItem('curBusiId', String(defaultBusiId));
          initialized.current = true;
          setCommonState((state) => {
            return {
              ...state,
              profile,
              busiGroups,
              datasourceCateOptions: getAuthorizedDatasourceCates(feats, isPlus),
              groupedDatasourceList: _.groupBy(datasourceList, 'plugin_type'),
              datasourceList: datasourceList,
              curBusiId: defaultBusiId,
              licenseRulesRemaining,
              licenseExpireDays,
              licenseExpired: licenseExpireDays !== undefined && licenseExpireDays <= 0,
              versions,
              feats,
              siteInfo,
            };
          });
        } else {
          const datasourceList = !location.pathname.startsWith('/login') ? await getDatasourceBriefList() : [];
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
    }
  }, []);

  // 初始化中不渲染任何内容
  if (!initialized.current) {
    return null;
  }

  return (
    <div className='App'>
      <CommonStateContext.Provider value={commonState}>
        <ConfigProvider locale={i18n.language == 'en_US' ? enUS : zhCN}>
          <Router>
            <Switch>
              <Route exact path='/job-task/:busiId/output/:taskId/:outputType' component={TaskOutput} />
              <Route exact path='/job-task/:busiId/output/:taskId/:host/:outputType' component={TaskHostOutput} />
              <>
                <HeaderMenu />
                <Content />
              </>
            </Switch>
          </Router>
        </ConfigProvider>
      </CommonStateContext.Provider>
      {import.meta.env.VITE_IS_ENT !== 'true' && import.meta.env.VITE_IS_PRO === 'true' && <CustomerServiceFloatButton />}
    </div>
  );
}

export default App;
