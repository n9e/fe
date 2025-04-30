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
          key: 'business_group',
          label: 'menu.business_group',
          type: 'tabs',
          children: [
            { key: '/targets', label: 'menu.targets' },
            { key: '/dashboards', label: 'menu.dashboards' },
          ],
        },
      ],
    },
    {
      key: 'explorer',
      label: 'menu.explorer',
      icon: <IconFont type='icon-IndexManagement1' />,
      children: [
        {
          key: 'metric',
          label: 'menu.metric',
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
          label: 'menu.log_explorer',
        },
      ],
    },
    {
      key: 'alerting',
      label: 'menu.alerting',
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
          key: '/alert-cur-events',
          label: 'menu.cur_events',
        },
        {
          key: '/alert-his-events',
          role: ['Admin'],
          label: 'menu.his_events',
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
        //   key: 'embedded_products',
        //   label: i18next.t('menu.embedded_products'),
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
          label: 'menu.site_settings',
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
