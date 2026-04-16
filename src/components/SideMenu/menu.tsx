import React from 'react';
import { NotificationFilled } from '@ant-design/icons';

import IconFont from '@/components/IconFont';

import { MenuItem } from './types';
import './locale';

export const getMenuList = (embeddedProductMenu: MenuItem[] = [], hideDeprecatedMenus: boolean = false) => {
  const menu: MenuItem[] = [
    {
      key: 'infrastructure',
      label: 'menu.infrastructure',
      section: 'infrastructure',
      icon: <IconFont type='icon-Menu_Infrastructure' />,
      children: [
        {
          key: 'business_group',
          label: 'menu.business_group',
          type: 'tabs',
          children: [{ key: '/targets', label: 'menu.targets' }],
        },
      ],
    },
    {
      key: 'integrations',
      label: 'menu.integrations',
      section: 'infrastructure',
      icon: <IconFont type='icon-shujujicheng' />,
      children: [
        {
          key: '/datasources',
          label: 'menu.data_source',
        },
        {
          key: '/components',
          label: 'menu.built_in_components',
        },
        {
          key: '/embedded-products',
          label: 'menu.embedded_products',
        },
        ...embeddedProductMenu,
      ],
    },
    {
      key: 'explorer',
      label: 'menu.explorer',
      section: 'observability',
      icon: <IconFont type='icon-IndexManagement1' />,
      children: [
        {
          key: 'metrics',
          label: 'menu.metrics',
          type: 'tabs',
          children: [
            { key: '/metric/explorer', label: 'menu.metric_explorer' },
            { key: '/metrics-built-in', label: 'menu.metrics_built_in' },
            { key: '/object/explorer', label: 'menu.object_explorer' },
            { key: '/recording-rules', label: 'menu.recording_rules' },
          ],
        },
        {
          key: '/log/explorer',
          label: 'menu.logs_explorer',
        },
        {
          key: 'dashboards',
          label: 'menu.dashboards',
          type: 'tabs',
          children: [{ key: '/dashboards', label: 'menu.dashboards' }],
        },
      ],
    },
    {
      key: 'monitors',
      label: 'menu.monitors',
      section: 'analysis',
      icon: <IconFont type='icon-Menu_AlarmManagement' />,
      children: [
        {
          key: 'rules',
          label: 'menu.rules',
          type: 'tabs',
          children: [
            { key: '/alert-rules', label: 'menu.alert_rules' },
            { key: '/alert-mutes', label: 'menu.alert_mutes' },
            { key: '/alert-subscribes', label: 'menu.alert_subscribes' },
          ],
        },
        {
          key: 'job',
          label: 'menu.job',
          type: 'tabs',
          children: [
            { key: '/job-tpls', label: 'menu.job_tpls' },
            { key: '/job-tasks', label: 'menu.job_tasks' },
          ],
        },
        {
          key: 'events',
          label: 'menu.events',
          type: 'tabs',
          children: [
            { key: '/alert-cur-events', label: 'menu.cur_events' },
            { key: '/alert-his-events', role: ['Admin'], label: 'menu.his_events' },
          ],
        },
        {
          key: 'event-pipelines',
          label: 'menu.event_pipeline',
          type: 'tabs',
          children: [
            { key: '/event-pipelines', label: 'menu.event_pipeline' },
            { key: '/event-pipelines-executions', label: 'menu.event_pipeline_executions' },
          ],
        },
      ],
    },
    {
      key: 'notification',
      label: 'menu.notification',
      section: 'analysis',
      icon: <NotificationFilled />,
      children: [
        {
          key: '/notification-rules',
          label: 'menu.notification_rules',
        },
        {
          key: '/notification-channels',
          label: 'menu.notification_channels',
        },
        {
          key: '/notification-templates',
          label: 'menu.notification_templates',
        },
        ...(hideDeprecatedMenus
          ? []
          : [
              {
                key: '/help/notification-settings',
                label: 'menu.notification_settings',
                deprecated: true,
              },
              {
                key: '/help/notification-tpls',
                label: 'menu.notification_tpls',
                deprecated: true,
              },
            ]),
      ],
    },
    {
      key: 'organization',
      label: 'menu.organization',
      section: 'platform',
      icon: <IconFont type='icon-Menu_PersonnelOrganization' />,
      children: [
        {
          key: '/users',
          label: 'menu.users',
        },
        {
          key: '/user-groups',
          label: 'menu.teams',
        },
        {
          key: '/roles',
          label: 'menu.roles',
        },
      ],
    },
    {
      key: 'setting',
      label: 'menu.setting',
      section: 'platform',
      icon: <IconFont type='icon-Menu_SystemInformation' />,
      children: [
        {
          key: 'ai-config',
          label: 'menu.ai_config',
          type: 'tabs',
          children: [
            { key: '/ai-config/agents', label: 'menu.ai_config_agents' },
            { key: '/ai-config/llm-configs', label: 'menu.ai_config_llm_configs' },
            { key: '/ai-config/skills', label: 'menu.ai_config_skills' },
            { key: '/ai-config/mcp-servers', label: 'menu.ai_config_mcp_servers' },
          ],
        },
        {
          key: '/system/site-settings',
          label: 'menu.site_setting',
        },
        {
          key: '/system/variable-settings',
          label: 'menu.variable_configs',
        },
        {
          key: '/system/sso-settings',
          label: 'menu.sso',
        },
        {
          key: '/system/alerting-engines',
          label: 'menu.alert_servers',
        },
        {
          key: '/system/version',
          label: 'menu.about',
        },
      ],
    },
  ];

  return menu;
};
