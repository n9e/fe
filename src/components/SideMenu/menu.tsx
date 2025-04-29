import React from 'react';
import { NotificationFilled } from '@ant-design/icons';

import IconFont from '@/components/IconFont';

import { MenuItem } from './types';

export const getMenuList = () => {
  const menu: MenuItem[] = [
    {
      key: 'infrastructure',
      label: 'menu.infrastructure',
      icon: <IconFont type='icon-Menu_Infrastructure' />,
      children: [
        {
          key: 'bgroup',
          label: 'menu.bgGroup',
          type: 'tabs',
          children: [
            { key: '/targets', label: 'menu.bgGroup_targets' },
            { key: '/dashboards', label: 'menu.bgGroup_dashboards' },
          ],
        },
      ],
    },
    {
      key: 'query',
      label: 'menu.query',
      icon: <IconFont type='icon-IndexManagement1' />,
      children: [
        {
          key: 'metric',
          label: 'menu.metric',
          type: 'tabs',
          children: [
            { key: '/metric/explorer', label: 'menu.metric_explorer' },
            { key: '/metrics-built-in', label: 'menu.metric_metricsBuiltIn' },
            { key: '/object/explorer', label: 'menu.metric_objectExplorer' },
            { key: '/recording-rules', label: 'menu.metric_recordingRules' },
          ],
        },
        {
          key: '/log/explorer',
          label: 'menu.log_analysis',
        },
      ],
    },
    {
      key: 'alert',
      label: 'menu.alert',
      icon: <IconFont type='icon-Menu_AlarmManagement' />,
      children: [
        {
          key: 'rules',
          label: 'menu.rules',
          type: 'tabs',
          children: [
            { key: '/alert-rules', label: 'menu.rules_alertRules' },
            { key: '/alert-mutes', label: 'menu.rules_warningShield' },
            { key: '/alert-subscribes', label: 'menu.rules_warningSubscribe' },
          ],
        },
        {
          key: 'job',
          label: 'menu.job',
          type: 'tabs',
          children: [
            { key: '/job-tpls', label: 'menu.job_taskTpl' },
            { key: '/job-tasks', label: 'menu.job_task' },
          ],
        },
        {
          key: '/alert-cur-events',
          label: 'menu.active_alert',
        },
        {
          key: '/alert-his-events',
          role: ['Admin'],
          label: 'menu.historical_alert',
        },
      ],
    },
    {
      key: 'notification',
      label: 'menu.notification',
      icon: <NotificationFilled />,
      children: [
        {
          key: '/notification-rules',
          label: 'menu.notify_rule',
        },
        {
          key: '/notification-channels',
          label: 'menu.notify_channels',
        },
        {
          key: '/notification-templates',
          label: 'menu.notify_configs',
        },
        {
          key: '/help/notification-settings',
          label: 'menu.notify_settings',
          deprecated: true,
        },
        {
          key: '/help/notification-tpls',
          label: 'menu.notify_template',
          deprecated: true,
        },
      ],
    },
    {
      key: 'integrations',
      label: 'menu.integrations',
      icon: <IconFont type='icon-shujujicheng' />,
      children: [
        {
          key: '/help/source',
          label: 'menu.data_source',
        },
        {
          key: '/built-in-components',
          label: 'menu.built_in_components',
        },
        // {
        //   key: 'system_built_in',
        //   label: i18next.t('sideMenu:integrations.system_built_in'),
        //   path: '',
        // },
      ],
    },
    {
      key: 'organization',
      label: 'menu.organization',
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
          key: '/permissions',
          label: 'menu.permission',
        },
        {
          key: '/contacts',
          label: 'menu.contact',
        },
      ],
    },
    {
      key: 'setting',
      label: 'menu.setting',
      icon: <IconFont type='icon-Menu_SystemInformation' />,
      children: [
        {
          key: '/site-settings',
          label: 'menu.site_setting',
        },
        {
          key: '/help/variable-configs',
          label: 'menu.variable_configs',
        },
        {
          key: '/help/sso',
          label: 'menu.sso',
        },
        {
          key: '/help/servers',
          label: 'menu.alert_servers',
        },
        {
          key: '/help/version',
          label: 'menu.about',
        },
      ],
    },
  ];

  return menu;
};
