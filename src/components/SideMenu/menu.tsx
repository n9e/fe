import React from 'react';
import { NotificationFilled } from '@ant-design/icons';

import IconFont from '@/components/IconFont';

import { MenuItem } from './types';

export const getMenuList = (embeddedProductMenu: MenuItem[] = []) => {
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
          children: [{ key: '/targets', label: 'menu.targets' }],
        },
      ],
    },
    {
      key: 'explorer',
      label: 'menu.explorer',
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
          key: '/event-pipelines',
          label: 'menu.event_pipeline',
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
          key: '/components',
          label: 'menu.built_in_components',
        },
        {
          key: '/embedded-product',
          label: 'menu.embedded_products',
        },
        ...embeddedProductMenu,
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
          key: '/roles',
          label: 'menu.roles',
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
