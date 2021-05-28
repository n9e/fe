import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import * as singleSpa from 'single-spa';
import Parcel from 'single-spa-react/parcel';
import _ from 'lodash';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import intlZhCN from './locales/zh';
import intlEnUS from './locales/en';
import { InjectIntlContext } from '@pkgs/hooks/useFormatMessage';
import LayoutMain from '@pkgs/Layout/Main';
import { fetchManifest, getPathBySuffix, createStylesheetLink } from '@pkgs/utils';
import { systemName } from '@common/config';
import PersonnelInfoProfile from './pages/PersonnelInfo/Profile';
import PersonnelInfoUsers from './pages/PersonnelInfo/Users';
import PersonnelInfoTeams from './pages/PersonnelInfo/Teams';
import ResourcesTree from './pages/ResourcesTree';
import SpareResources from './pages/SpareResources';
import ResourcesSearch from './pages/ResourcesSearch';
import UserManagement from './pages/UserManagement';
import TeamManagement from './pages/TeamManagement';
import RoleManagement from './pages/RoleManagement';
import NodeCate from './pages/TreenodeManagement/NodeCate';
import NodeCateField from './pages/TreenodeManagement/NodeCate/NodeCateField';
import Trash from './pages/TreenodeManagement/RecycleBin';
import LogsLogin from './pages/Logs/Login';
import LogsOperation from './pages/Logs/Operation';
import SMTP from './pages/Settings/SMTP';
import SSO from './pages/Settings/SSO';
import Create from './pages/Settings/SSO/create';
import Security from './pages/Settings/Security';
import Resource from './pages/ResourceGeneral/index';
import Privileges from './pages/Privileges';

interface LocaleMap {
  [index: string]: any,
}

const localeMap: LocaleMap = {
  zh: {
    antd: antdZhCN,
    intl: 'zh',
    intlMessages: intlZhCN,
  },
  en: {
    antd: antdEnUS,
    intl: 'en',
    intlMessages: intlEnUS,
  },
};

export const { Provider, Consumer } = React.createContext('zh');

// const defaultLanguage = window.localStorage.getItem('language') || navigator.language.substr(0, 2);
const defaultLanguage = 'zh';
const systemsConfItem = {
  ident: 'ticket',
  development: {
    publicPath: 'http://localhost:7001/ticket/',
    index: 'http://localhost:7001/ticket/index.html',
  },
  production: {
    publicPath: '/ticket/',
    index: '/ticket/index.html',
  },
};

const App = () => {
  const [menus, setMenus] = useState<any>([]);
  const [mainNoBackground, setMainNoBackground] = useState(false);
  const [language, setLanguage] = useState(defaultLanguage);
  const intlMessages = _.get(localeMap[language], 'intlMessages', intlZhCN);
  const title = language === 'zh' ? '用户资源中心' : 'Resource DB';

  useEffect(() => {
    fetch('/static/rdbMenusConfig.json').then((res) => {
      return res.json();
    }).then((res) => {
      setMenus(res);
    });

    window.postMessage({
      type: 'tenantProjectVisible',
      value: false,
    }, window.location.origin);

    return () => {
      window.postMessage({
        type: 'tenantProjectVisible',
        value: true,
      }, window.location.origin);
    }
  }, []);

  return (
    <IntlProvider
      locale={_.get(localeMap[language], 'intl', 'zh')}
      messages={intlMessages}
    >
      <ConfigProvider locale={_.get(localeMap[language], 'antd', antdZhCN)}>
        <InjectIntlContext>
          <Provider value={language}>
            <BrowserRouter basename={systemName}>
              <Switch>
                <LayoutMain
                  treeVisible
                  systemName={systemName}
                  systemNameChn={title}
                  menus={menus}
                  noBackground={mainNoBackground}
                >
                  <Switch>
                    <Route exact path="/" render={() => <Redirect to="/resources-tree" />} />
                    <Route exact path="/resources-tree" component={ResourcesTree} />
                    <Route exact path="/spare-resources" component={SpareResources} />
                    <Route exact path="/resources-search" component={ResourcesSearch} />
                    <Route exact path="/personnel-info/profile" component={PersonnelInfoProfile} />
                    <Route exact path="/personnel-info/users" component={PersonnelInfoUsers} />
                    <Route exact path="/personnel-info/teams" component={PersonnelInfoTeams} />
                    <Route exact path="/resource-general" component={Resource} />
                    <Route exact path="/user-management" component={UserManagement} />
                    <Route exact path="/team-management" component={TeamManagement} />
                    <Route exact path="/role-management/privileges" component={Privileges} />
                    <Route exact path="/role-management/:type" component={RoleManagement} />
                    <Route exact path="/treenode-management/node-cate" component={NodeCate} />
                    <Route exact path="/treenode-management/node-cate/:ident/types" component={NodeCateField} />
                    <Route exact path="/treenode-management/trash" component={Trash} />
                    <Route exact path="/logs/login" component={LogsLogin} />
                    <Route exact path="/logs/operation" component={LogsOperation} />
                    <Route exact path="/settings/smtp" component={SMTP} />
                    <Route exact path="/settings/sso" component={SSO} />
                    <Route exact path="/settings/sso/create" component={Create} />
                    <Route exact path="/settings/security" component={Security} />
                    <Route path="/ticket" render={(props: any) => {
                      return (
                        <Parcel
                          config={async () => {
                            const sysUrl = systemsConfItem[process.env.NODE_ENV].index;
                            const htmlData = await fetchManifest(sysUrl, systemsConfItem[process.env.NODE_ENV].publicPath);
                            const lifecyclesFile = await System.import(htmlData);
                            const jsPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.js');
                            const cssPath = await getPathBySuffix(systemsConfItem, lifecyclesFile.default, '.css');
                            createStylesheetLink('ticket', cssPath);
                            const reactLifecycles = await System.import(jsPath);
                            reactLifecycles.mount.push(() => {
                              setMainNoBackground(true);
                              return Promise.resolve();
                            });
                            reactLifecycles.unmount.push(() => {
                              setMainNoBackground(false);
                              return Promise.resolve();
                            });
                            return reactLifecycles;
                          }}
                          mountParcel={singleSpa.mountRootParcel}
                          history={props.history}
                        />
                      );
                    }} />
                  </Switch>
                </LayoutMain>
                <Route render={() => <Redirect to="/404" />} />
              </Switch>
            </BrowserRouter>
          </Provider>
        </InjectIntlContext>
      </ConfigProvider>
    </IntlProvider>
  );
}

export default App;
