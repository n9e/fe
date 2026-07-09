import React, { createContext, useContext, useMemo } from 'react';
import { Form } from 'antd';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { getTeamInfoList, getNotifiesList } from '@/services/manage';
import { getAlertRulesCallbacks } from '@/services/warning';
import { getItems as getNotificationRules, RuleItem } from '@/pages/notificationRules/services';

import { getItem as getWorkflowItem, getList as getWorkflowList } from '@/pages/eventPipeline/services';
import { Item as WorkflowItem } from '@/pages/eventPipeline/types';
import { getWebhooks } from '@/pages/help/NotificationSettings/services';
import { WebhookType } from '@/pages/help/NotificationSettings/types';

type FormNGDataContextValue = {
  permissions: {
    notificationRules: boolean;
    notificationChannels: boolean;
    userGroups: boolean;
    eventPipelines: boolean;
    serviceCalendar: boolean;
    notificationSettings: boolean;
    alertRules: boolean;
  };
  notificationRules: RuleItem[];
  notificationRuleMap: Record<string, RuleItem>;
  notificationRulesLoading: boolean;
  refreshNotificationRules: () => void;
  notifyChannels: any[];
  notifyChannelMap: Record<string, any>;
  notifyChannelsLoading: boolean;
  refreshNotifyChannels: () => void;
  teams: any[];
  teamMap: Record<string, any>;
  teamsLoading: boolean;
  refreshTeams: () => void;
  workflows: WorkflowItem[];
  workflowMap: Record<string, WorkflowItem>;
  workflowsLoading: boolean;
  workflowItemsLoading: boolean;
  refreshWorkflows: () => void;
  serviceCals: any[];
  serviceCalMap: Record<string, any>;
  serviceCalsLoading: boolean;
  refreshServiceCals: () => void;
  webhooks: WebhookType[];
  webhooksLoading: boolean;
  refreshWebhooks: () => void;
  callbacks: string[];
  callbacksLoading: boolean;
  refreshCallbacks: () => void;
};

const noop = () => {};

function getServiceCals() {
  return request('/api/n9e-plus/service-cals', {
    method: RequestMethod.Get,
  }).then((res) => res.dat || []);
}

const defaultValue: FormNGDataContextValue = {
  permissions: {
    notificationRules: false,
    notificationChannels: false,
    userGroups: false,
    eventPipelines: false,
    serviceCalendar: false,
    notificationSettings: false,
    alertRules: false,
  },
  notificationRules: [],
  notificationRuleMap: {},
  notificationRulesLoading: false,
  refreshNotificationRules: noop,
  notifyChannels: [],
  notifyChannelMap: {},
  notifyChannelsLoading: false,
  refreshNotifyChannels: noop,
  teams: [],
  teamMap: {},
  teamsLoading: false,
  refreshTeams: noop,
  workflows: [],
  workflowMap: {},
  workflowsLoading: false,
  workflowItemsLoading: false,
  refreshWorkflows: noop,
  serviceCals: [],
  serviceCalMap: {},
  serviceCalsLoading: false,
  refreshServiceCals: noop,
  webhooks: [],
  webhooksLoading: false,
  refreshWebhooks: noop,
  callbacks: [],
  callbacksLoading: false,
  refreshCallbacks: noop,
};

export const FormNGDataContext = createContext<FormNGDataContextValue>(defaultValue);

export function useFormNGData() {
  return useContext(FormNGDataContext);
}

export function FormNGDataProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const { perms } = useContext(CommonStateContext);
  const groupId = Form.useWatch('group_id');
  const pipelineConfigs = Form.useWatch('pipeline_configs');

  const permissions = useMemo(
    () => ({
      notificationRules: _.includes(perms, '/notification-rules'),
      notificationChannels: _.includes(perms, '/notification-channels'),
      userGroups: _.includes(perms, '/user-groups'),
      eventPipelines: _.includes(perms, '/event-pipelines'),
      serviceCalendar: _.includes(perms, '/service-calendar'),
      notificationSettings: _.includes(perms, '/help/notification-settings'),
      alertRules: _.includes(perms, '/alert-rules'),
    }),
    [perms],
  );

  const notificationRulesReq = useRequest(() => getNotificationRules(), {
    ready: permissions.notificationRules,
    refreshDeps: [permissions.notificationRules],
  });

  const notifyChannelsReq = useRequest(() => getNotifiesList(), {
    ready: permissions.notificationChannels,
    refreshDeps: [permissions.notificationChannels],
  });

  const teamsReq = useRequest(() => getTeamInfoList({ query: '' }), {
    ready: permissions.userGroups,
    refreshDeps: [permissions.userGroups],
  });

  const workflowsReq = useRequest(() => getWorkflowList({ group_id: Number(groupId), use_case: 'alert_rule' }), {
    ready: permissions.eventPipelines && groupId !== undefined,
    refreshDeps: [permissions.eventPipelines, groupId],
  });

  const pipelineIds = useMemo(() => {
    if (!_.isArray(pipelineConfigs)) return [];
    // 0 是后端补的一个无效 id，这里过滤掉无效的 pipeline_id
    return _.uniq(pipelineConfigs.map((item: any) => item?.pipeline_id).filter((id: any) => _.isNumber(id) && id !== 0));
  }, [pipelineConfigs]);

  const workflowIdsNeedDetail = useMemo(() => {
    if (workflowsReq.data === undefined) return [];
    const workflowMap = _.keyBy(workflowsReq.data || [], 'id');
    return pipelineIds.filter((id) => !workflowMap[id]?.processors);
  }, [pipelineIds, workflowsReq.data]);

  const workflowItemsReq = useRequest(
    () =>
      Promise.all(
        workflowIdsNeedDetail.map((id) =>
          getWorkflowItem(id).catch(() => {
            return undefined;
          }),
        ),
      ),
    {
      ready: permissions.eventPipelines && workflowIdsNeedDetail.length > 0,
      refreshDeps: [permissions.eventPipelines, JSON.stringify(workflowIdsNeedDetail)],
    },
  );

  const serviceCalsReq = useRequest(() => getServiceCals(), {
    ready: permissions.serviceCalendar,
    refreshDeps: [permissions.serviceCalendar],
  });

  const webhooksReq = useRequest(() => getWebhooks(), {
    ready: permissions.notificationSettings,
    refreshDeps: [permissions.notificationSettings],
  });

  const callbacksReq = useRequest(() => getAlertRulesCallbacks(), {
    ready: permissions.alertRules,
    refreshDeps: [permissions.alertRules],
  });

  const notificationRules = notificationRulesReq.data || [];
  const notifyChannels = notifyChannelsReq.data || [];
  const teamList = teamsReq.data;
  const teams = (_.isArray(teamList) ? teamList : teamList?.dat) || [];
  const workflows = workflowsReq.data || [];
  const workflowItems = _.filter(workflowItemsReq.data || [], Boolean) as WorkflowItem[];
  const serviceCals = serviceCalsReq.data || [];
  const webhooks = webhooksReq.data || [];
  const callbacks = callbacksReq.data || [];
  const value = useMemo<FormNGDataContextValue>(
    () => ({
      permissions,
      notificationRules,
      notificationRuleMap: _.keyBy(notificationRules, (item) => _.toString(item.id)),
      notificationRulesLoading: notificationRulesReq.loading,
      refreshNotificationRules: permissions.notificationRules ? notificationRulesReq.refresh : noop,
      notifyChannels,
      notifyChannelMap: _.keyBy(notifyChannels, 'key'),
      notifyChannelsLoading: notifyChannelsReq.loading,
      refreshNotifyChannels: permissions.notificationChannels ? notifyChannelsReq.refresh : noop,
      teams,
      teamMap: _.keyBy(teams, (item) => _.toString(item.id)),
      teamsLoading: teamsReq.loading,
      refreshTeams: permissions.userGroups ? teamsReq.refresh : noop,
      workflows,
      workflowMap: _.keyBy([...workflows, ...workflowItems], (item) => _.toString(item.id)),
      workflowsLoading: workflowsReq.loading,
      workflowItemsLoading: workflowItemsReq.loading,
      refreshWorkflows: permissions.eventPipelines ? workflowsReq.refresh : noop,
      serviceCals,
      serviceCalMap: _.keyBy(serviceCals, (item) => _.toString(item.id)),
      serviceCalsLoading: serviceCalsReq.loading,
      refreshServiceCals: permissions.serviceCalendar ? serviceCalsReq.refresh : noop,
      webhooks,
      webhooksLoading: webhooksReq.loading,
      refreshWebhooks: permissions.notificationSettings ? webhooksReq.refresh : noop,
      callbacks,
      callbacksLoading: callbacksReq.loading,
      refreshCallbacks: permissions.alertRules ? callbacksReq.refresh : noop,
    }),
    [
      permissions,
      notificationRules,
      notificationRulesReq.loading,
      notificationRulesReq.refresh,
      notifyChannels,
      notifyChannelsReq.loading,
      notifyChannelsReq.refresh,
      teams,
      teamsReq.loading,
      teamsReq.refresh,
      workflows,
      workflowItems,
      workflowsReq.loading,
      workflowsReq.refresh,
      workflowItemsReq.loading,
      serviceCals,
      serviceCalsReq.loading,
      serviceCalsReq.refresh,
      webhooks,
      webhooksReq.loading,
      webhooksReq.refresh,
      callbacks,
      callbacksReq.loading,
      callbacksReq.refresh,
    ],
  );

  return <FormNGDataContext.Provider value={value}>{children}</FormNGDataContext.Provider>;
}
