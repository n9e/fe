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
import { Switch, Route, useLocation, Redirect, useHistory } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { getMenuPerm } from '@/services/common';
import { IS_ENT } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import Page403 from '@/pages/notFound/Page403';
import OutOfService from '@/pages/notFound/OutOfService';
import NotFound from '@/pages/notFound';
import Login from '@/pages/login';
import Overview from '@/pages/login/overview';
import LoginCallback from '@/pages/loginCallback';
import LoginCallbackCAS from '@/pages/loginCallback/cas';
import LoginCallbackOAuth from '@/pages/loginCallback/oauth';
import LoginCallbackCustom from '@/pages/loginCallback/Custom';
import AlertRules, { Add as AlertRuleAdd, Edit as AlertRuleEdit } from '@/pages/alertRules';
import Profile from '@/pages/account/profile';
import { List as Dashboard, Detail as DashboardDetail, Share as DashboardShare } from '@/pages/dashboard';
import { getDefaultThemeMode } from '@/pages/dashboard/Detail/utils';
import Chart from '@/pages/chart';
import Groups from '@/pages/user/groups';
import Users from '@/pages/user/users';
import Business from '@/pages/user/business';
import { Metric as MetricExplore, Log as LogExplore } from '@/pages/explorer';
import IndexPatterns from '@/pages/log/IndexPatterns';
import ObjectExplore from '@/pages/monitor/object';
import Shield, { Add as AddShield, Edit as ShieldEdit } from '@/pages/warning/shield';
import Subscribe, { Add as SubscribeAdd, Edit as SubscribeEdit } from '@/pages/warning/subscribe';
import Event from '@/pages/event';
import EventDetail from '@/pages/event/detail';
import historyEvents from '@/pages/historyEvents';
import Targets from '@/pages/targets';
import Demo from '@/pages/demo';
import TaskTpl from '@/pages/taskTpl';
import TaskTplAdd from '@/pages/taskTpl/add';
import TaskTplDetail from '@/pages/taskTpl/detail';
import TaskTplModify from '@/pages/taskTpl/modify';
import TaskTplClone from '@/pages/taskTpl/clone';
import Task from '@/pages/task';
import TaskAdd from '@/pages/task/add';
import TaskResult from '@/pages/task/result';
import TaskDetail from '@/pages/task/detail';
import Version from '@/pages/help/version';
import Servers from '@/pages/help/servers';
import Datasource, { Form as DatasourceAdd } from '@/pages/datasource';
import RecordingRule, { Add as RecordingRuleAdd, Edit as RecordingRuleEdit } from '@/pages/recordingRules';
import TraceExplorer, { Dependencies as TraceDependencies } from '@/pages/traceCpt/Explorer';
import Permissions from '@/pages/permissions';
import SSOConfigs from '@/pages/help/SSOConfigs';
import NotificationTpls from '@/pages/help/NotificationTpls';
import NotificationSettings from '@/pages/help/NotificationSettings';
import MigrateDashboards from '@/pages/help/migrate';
import VariableConfigs from '@/pages/variableConfigs';
import SiteSettings from '@/pages/siteSettings';
import { dynamicPackages, Entry, dynamicPages } from '@/utils';
// @ts-ignore
import { Jobs as StrategyBrain } from 'plus:/datasource/anomaly';
// @ts-ignore
import plusLoader from 'plus:/utils/loader';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';

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
     * /docs/等页面不进行权限校验
     */
    if (
      profile?.roles?.length > 0 &&
      !_.includes(['/', '/account/profile/info', '/account/profile/pwd', '/account/profile/token'], location.pathname) &&
      !location.pathname.includes('/docs/') &&
      !location.pathname.includes('/settings/datasource/edit/')
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

  return (
    <div className='content'>
      <Switch>
        <Route path='/demo' component={Demo} />
        <Route path='/overview' component={Overview} />
        <Route path='/login' component={Login} exact />
        <Route path='/callback' component={LoginCallback} exact />
        <Route path='/callback/cas' component={LoginCallbackCAS} exact />
        <Route path='/callback/oauth' component={LoginCallbackOAuth} exact />
        <Route path='/callback/custom' component={LoginCallbackCustom} exact />
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
        <Route exact path='/targets' component={Targets} />

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
          <Redirect to={siteInfo?.home_page_url || '/metric/explorer'} />
        </Route>
        <Route path='/403' component={Page403} />
        <Route path='/404' component={NotFound} />
        <Route path='/out-of-service' component={OutOfService} />
        <Route path='*' component={NotFound} />
      </Switch>
    </div>
  );
}
