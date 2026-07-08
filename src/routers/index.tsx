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
import React, { useEffect, useContext } from 'react';
import { Spin } from 'antd';
import { Switch, Route, useLocation, Redirect, useHistory, matchPath } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { getMenuPerm } from '@/services/common';
import { IS_ENT } from '@/utils/constant';
import { CommonStateContext } from '@/App';
// 路由页面统一懒加载：避免任意一个页面（如登录页）就把整棵页面依赖图 eager 拉起
const Page403 = React.lazy(() => import('@/pages/notFound/Page403'));
const OutOfService = React.lazy(() => import('@/pages/notFound/OutOfService'));
const NotFound = React.lazy(() => import('@/pages/notFound'));
const Login = React.lazy(() => import('@/pages/login'));
const Overview = React.lazy(() => import('@/pages/login/overview'));
const LoginCallback = React.lazy(() => import('@/pages/loginCallback'));
const LoginCallbackCAS = React.lazy(() => import('@/pages/loginCallback/cas'));
const LoginCallbackOAuth = React.lazy(() => import('@/pages/loginCallback/oauth'));
const LoginCallbackCustom = React.lazy(() => import('@/pages/loginCallback/Custom'));
const LoginCallbackDingTalk = React.lazy(() => import('@/pages/loginCallback/DingTalk'));
const LoginCallbackFeishu = React.lazy(() => import('@/pages/loginCallback/Feishu'));
const OAuthConsent = React.lazy(() => import('@/pages/oauthConsent'));
const AlertRules = React.lazy(() => import('@/pages/alertRules'));
const AlertRuleAdd = React.lazy(() => import('@/pages/alertRules').then((m) => ({ default: m.Add })));
const AlertRuleEdit = React.lazy(() => import('@/pages/alertRules').then((m) => ({ default: m.Edit })));
const Profile = React.lazy(() => import('@/pages/account/profile'));
// 直接指向子模块，避免经过 @/pages/dashboard 桶文件把 List/Detail/Share 打进同一个 chunk
const Dashboard = React.lazy(() => import('@/pages/dashboard/List'));
const DashboardDetail = React.lazy(() => import('@/pages/dashboard/Detail'));
const DashboardShare = React.lazy(() => import('@/pages/dashboard/Share'));
const Chart = React.lazy(() => import('@/pages/chart'));
const Groups = React.lazy(() => import('@/pages/user/groups'));
const Users = React.lazy(() => import('@/pages/user/users'));
const Business = React.lazy(() => import('@/pages/user/business'));
const MetricExplore = React.lazy(() => import('@/pages/explorer/Metric'));
const LogExplore = React.lazy(() => import('@/pages/explorer/Log'));
const IndexPatterns = React.lazy(() => import('@/pages/log/IndexPatterns'));
const ObjectExplore = React.lazy(() => import('@/pages/monitor/object'));
const Shield = React.lazy(() => import('@/pages/warning/shield'));
const AddShield = React.lazy(() => import('@/pages/warning/shield').then((m) => ({ default: m.Add })));
const ShieldEdit = React.lazy(() => import('@/pages/warning/shield').then((m) => ({ default: m.Edit })));
const Subscribe = React.lazy(() => import('@/pages/warning/subscribe'));
const SubscribeAdd = React.lazy(() => import('@/pages/warning/subscribe').then((m) => ({ default: m.Add })));
const SubscribeEdit = React.lazy(() => import('@/pages/warning/subscribe').then((m) => ({ default: m.Edit })));
const EventDetail = React.lazy(() => import('@/pages/event/detail'));
const historyEvents = React.lazy(() => import('@/pages/historyEvents'));
const Demo = React.lazy(() => import('@/pages/demo'));
const LogViewerTestPage = React.lazy(() => import('@/pages/logExplorer/LogViewerTestPage'));
const TaskTpl = React.lazy(() => import('@/pages/taskTpl'));
const TaskTplAdd = React.lazy(() => import('@/pages/taskTpl/add'));
const TaskTplDetail = React.lazy(() => import('@/pages/taskTpl/detail'));
const TaskTplModify = React.lazy(() => import('@/pages/taskTpl/modify'));
const TaskTplClone = React.lazy(() => import('@/pages/taskTpl/clone'));
const Task = React.lazy(() => import('@/pages/task'));
const TaskAdd = React.lazy(() => import('@/pages/task/add'));
const TaskResult = React.lazy(() => import('@/pages/task/result'));
const TaskDetail = React.lazy(() => import('@/pages/task/detail'));
const Version = React.lazy(() => import('@/pages/help/version'));
const Servers = React.lazy(() => import('@/pages/help/servers'));
const Datasource = React.lazy(() => import('@/pages/datasource'));
const DatasourceAdd = React.lazy(() => import('@/pages/datasource').then((m) => ({ default: m.Form })));
const RecordingRule = React.lazy(() => import('@/pages/recordingRules'));
const RecordingRuleAdd = React.lazy(() => import('@/pages/recordingRules').then((m) => ({ default: m.Add })));
const RecordingRuleEdit = React.lazy(() => import('@/pages/recordingRules').then((m) => ({ default: m.Edit })));
const TraceExplorer = React.lazy(() => import('@/pages/traceCpt/Explorer'));
const TraceDependencies = React.lazy(() => import('@/pages/traceCpt/Explorer').then((m) => ({ default: m.Dependencies })));
const Permissions = React.lazy(() => import('@/pages/permissions'));
const SSOConfigs = React.lazy(() => import('@/pages/help/SSOConfigs'));
const NotificationTpls = React.lazy(() => import('@/pages/help/NotificationTpls'));
const NotificationSettings = React.lazy(() => import('@/pages/help/NotificationSettings'));
const MigrateDashboards = React.lazy(() => import('@/pages/help/migrate'));
const VariableConfigs = React.lazy(() => import('@/pages/variableConfigs'));
const SiteSettings = React.lazy(() => import('@/pages/siteSettings'));
const Landing = React.lazy(() => import('@/pages/landing'));
import { dynamicPackages, Entry, dynamicPages } from '@/utils';
// @ts-ignore
const StrategyBrain = React.lazy(() => import('plus:/datasource/anomaly').then((m) => ({ default: m.Jobs })));
// @ts-ignore
import plusLoader from 'plus:/utils/loader';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';
import { spaceIdRoutes } from './config';

const Packages = dynamicPackages();
let lazyRoutes = Packages.reduce((result: any, module: Entry) => {
  return (result = result.concat(module.routes));
}, []);

const lazyPagesRoutes = _.reduce(
  dynamicPages(),
  (result: any, module: Entry) => {
    return (result = result.concat(module.routes));
  },
  [],
);

function RouteWithSubRoutes(route) {
  return (
    <Route
      path={route.path}
      render={(props) => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

export default function Content() {
  const location = useLocation();
  const history = useHistory();
  const isPlus = useIsPlus();
  const { profile, siteInfo, perms } = useContext(CommonStateContext);

  useEffect(() => {
    /**
     * 这里是一个很脆弱的权限控制，期望的效果是菜单配置的路径和权限点匹配，如果没有权限则重定向到 403 页面
     * 但是目前无法把菜单配置和perms权限点一一对应
     * 所以这里现在只能通过白名单的方式来单独处理个别未配置权限点的路径
     */
    if (
      profile?.roles?.length > 0 &&
      !_.includes(['/', '/account/profile/info', '/account/profile/pwd', '/account/profile/token', '/alert-aggr-events', '/oauth-consent'], location.pathname) &&
      !location.pathname.includes('/settings/datasource/edit/') &&
      !location.pathname.includes('/settings/infrastructure/add') &&
      !location.pathname.includes('/settings/source/') &&
      !location.pathname.includes('/403')
    ) {
      if (profile?.roles.indexOf('Admin') === -1) {
        // 如果没有权限则重定向到 403 页面
        if (
          _.every(perms, (item) => {
            return location.pathname.indexOf(item) === -1;
          })
        ) {
          history.push('/403');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_IS_ENT === 'true') {
      const isMatch = spaceIdRoutes.find((route) => matchPath(location.pathname, { path: route, exact: true }));
      if (isMatch) {
        // urlAddSpaceId(history);
      }
    }
  }, [location.pathname]);

  return (
    <div className='content'>
      <React.Suspense
        fallback={
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin />
          </div>
        }
      >
        <Switch>
        <Route path='/demo' component={Demo} />
        {import.meta.env.DEV && <Route path='/log-viewer-test' component={LogViewerTestPage} />}
        <Route path='/overview' component={Overview} />
        <Route path='/login' component={Login} exact />
        <Route path='/callback' component={LoginCallback} exact />
        <Route path='/callback/cas' component={LoginCallbackCAS} exact />
        <Route path='/callback/oauth' component={LoginCallbackOAuth} exact />
        <Route path='/callback/custom' component={LoginCallbackCustom} exact />
        <Route path='/callback/dingtalk' component={LoginCallbackDingTalk} exact />
        <Route path='/callback/feishu' component={LoginCallbackFeishu} exact />
        <Route path='/oauth-consent' component={OAuthConsent} exact />
        <Route path='/metric/explorer' component={MetricExplore} exact />
        <Route path='/log/explorer' component={LogExplore} exact />
        <Route path='/log/index-patterns' component={IndexPatterns} exact />
        <Route path='/object/explorer' component={ObjectExplore} exact />
        <Route path='/busi-groups' component={Business} />
        <Route path='/users' component={Users} />
        <Route path='/user-groups' component={Groups} />
        <Route path='/account/profile/:tab' component={Profile} />

        <Route path='/dashboard/:id' exact component={DashboardDetail} />
        <Route path='/dashboards/:id' exact component={DashboardDetail} />
        <Route path='/dashboards/share/:id' component={DashboardShare} />
        <Route path='/dashboards' component={Dashboard} />
        <Route path='/chart/:ids' component={Chart} />

        <Route exact path='/alert-rules/add/:bgid' component={AlertRuleAdd} />
        <Route exact path='/alert-rules/edit/:id' component={AlertRuleEdit} />
        <Route exact path='/alert-rules' component={AlertRules} />
        <Route exact path='/alert-rules/brain/:id' component={StrategyBrain} />
        <Route exact path='/alert-mutes' component={Shield} />
        <Route exact path='/alert-mutes/add/:from?' component={AddShield} />
        <Route exact path='/alert-mutes/edit/:id' component={ShieldEdit} />
        <Route exact path='/alert-subscribes' component={Subscribe} />
        <Route exact path='/alert-subscribes/add' component={SubscribeAdd} />
        <Route exact path='/alert-subscribes/edit/:id' component={SubscribeEdit} />

        {!isPlus && [
          <Route key='recording-rules' exact path='/recording-rules/:id?' component={RecordingRule} />,
          <Route key='recording-rules-add' exact path='/recording-rules/add/:group_id' component={RecordingRuleAdd} />,
          <Route key='recording-rules-edit' exact path='/recording-rules/edit/:id' component={RecordingRuleEdit} />,
        ]}

        <Route exact path='/alert-his-events' component={historyEvents} />
        <Route exact path='/alert-cur-events/:eventId' component={EventDetail} />
        <Route exact path='/alert-his-events/:eventId' component={EventDetail} />
        {/* <Route exact path='/targets' component={Targets} /> */}

        <Route exact path='/job-tpls' component={TaskTpl} />
        <Route exact path='/job-tpls/add' component={TaskTplAdd} />
        <Route exact path='/job-tpls/add/task' component={TaskAdd} />
        <Route exact path='/job-tpls/:id/detail' component={TaskTplDetail} />
        <Route exact path='/job-tpls/:id/modify' component={TaskTplModify} />
        <Route exact path='/job-tpls/:id/clone' component={TaskTplClone} />
        <Route exact path='/job-tasks' component={Task} />
        <Route exact path='/job-tasks/add' component={TaskAdd} />
        <Route exact path='/job-tasks/:id/result' component={TaskResult} />
        <Route exact path='/job-tasks/:id/detail' component={TaskDetail} />

        <Route exact path='/system/version' component={Version} />
        <Route exact path='/system/alerting-engines' component={Servers} />
        <Route exact path='/datasources' component={Datasource} />
        <Route exact path='/datasources/:action/:type' component={DatasourceAdd} />
        <Route exact path='/datasources/:action/:type/:id' component={DatasourceAdd} />
        <Route exact path='/system/sso-settings' component={SSOConfigs} />
        <Route exact path='/help/notification-tpls' component={NotificationTpls} />
        <Route exact path='/help/notification-settings' component={NotificationSettings} />
        <Route exact path='/help/migrate' component={MigrateDashboards} />
        <Route exact path='/system/variable-settings' component={VariableConfigs} />

        <Route exact path='/trace/explorer' component={TraceExplorer} />
        <Route exact path='/trace/dependencies' component={TraceDependencies} />

        <Route exact path='/roles' component={Permissions} />

        {import.meta.env.VITE_IS_ENT !== 'true' && <Route exact path='/system/site-settings' component={SiteSettings} />}

        {!IS_ENT && <Route exact path='/landing' component={Landing} />}

        {lazyRoutes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        {_.map(lazyPagesRoutes, (route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        {_.map(plusLoader.routes, (route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        <Route path='/' exact>
          <Redirect to={siteInfo?.home_page_url || '/landing'} />
        </Route>
        <Route path='/403' component={Page403} />
        <Route path='/404' component={NotFound} />
        <Route path='/out-of-service' component={OutOfService} />
        <Route path='*' component={NotFound} />
        </Switch>
      </React.Suspense>
    </div>
  );
}
