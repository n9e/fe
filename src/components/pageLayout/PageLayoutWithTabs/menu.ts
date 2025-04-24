import i18next from 'i18next';
import { MenuItem } from './types';

const menu: MenuItem[] = [
  {
    key: 'infrastructure',
    label: i18next.t('pageLayout:infrastructure.title'),
    children: [
      {
        key: 'bgroup',
        label: i18next.t('pageLayout:infrastructure.bgGroup'),
        type: 'tabs',
        children: [
          { key: 'targets', label: i18next.t('pageLayout:infrastructure.bgGroup_targets'), path: '/targets' },
          { key: 'collects', label: i18next.t('pageLayout:infrastructure.bgGroup_collects'), path: '/collects' },
          { key: 'network-devices', label: i18next.t('pageLayout:infrastructure.bgGroup_networkDevices'), path: '/network-devices' },
          { key: 'dashboards', label: i18next.t('pageLayout:infrastructure.bgGroup_dashboards'), path: '/dashboards' },
          { key: 'reports', label: i18next.t('pageLayout:infrastructure.bgGroup_reports'), path: '/reports' },
        ],
      },
      {
        key: 'heartbeat',
        label: i18next.t('pageLayout:infrastructure.heartbeat'),
        path: '',
      },
      {
        key: 'pingmesh',
        label: i18next.t('pageLayout:infrastructure.pingmesh'),
        path: '',
      },
    ],
  },
  {
    key: 'query',
    label: i18next.t('pageLayout:query.title'),
    children: [
      {
        key: 'metric',
        label: i18next.t('pageLayout:query.metric'),
        type: 'tabs',
        children: [
          { key: 'metric-explorer', label: i18next.t('pageLayout:query.metric_explorer'), path: '/metric/explorer' },
          { key: 'metrics-built-in', label: i18next.t('pageLayout:query.metric_metricsBuiltIn'), path: '/metrics-built-in' },
          { key: 'object-explorer', label: i18next.t('pageLayout:query.metric_objectExplorer'), path: '/object/explorer' },
          { key: 'recording-rules', label: i18next.t('pageLayout:query.metric_recordingRules'), path: '/recording-rules' },
        ],
      },
      {
        key: 'log',
        label: i18next.t('pageLayout:query.log_analysis'),
        path: '',
      },
    ],
  },
  {
    key: 'alert',
    label: i18next.t('pageLayout:alert.title'),
    children: [
      {
        key: 'rules',
        label: i18next.t('pageLayout:alert.rules'),
        type: 'tabs',
        children: [
          { key: 'alert-rules', label: i18next.t('pageLayout:alert.rules_alertRules'), path: '/alert-rules' },
          { key: 'alert-mutes', label: i18next.t('pageLayout:alert.rules_warningShield'), path: '/alert-mutes' },
          { key: 'alert-subscribes', label: i18next.t('pageLayout:alert.rules_warningSubscribe'), path: '/alert-subscribes' },
        ],
      },
      {
        key: 'job',
        label: i18next.t('pageLayout:alert.job'),
        type: 'tabs',
        children: [
          { key: '/job-tpls', label: i18next.t('pageLayout:alert.job_taskTpl'), path: '/job-tpls' },
          { key: '/job-tasks', label: i18next.t('pageLayout:alert.job_task'), path: '/job-tasks' },
        ],
      },
      {
        key: 'active-alert',
        label: i18next.t('pageLayout:alert.active_alert'),
        path: '',
      },
      {
        key: 'historical-alert',
        label: i18next.t('pageLayout:alert.historical_alert'),
        path: '',
      },
      {
        key: 'global-muting',
        label: i18next.t('pageLayout:alert.global_muting'),
        path: '',
      },
    ],
  },
  {
    key: 'notification',
    label: i18next.t('pageLayout:notification.title'),
    children: [
      {
        key: 'notify_rule',
        label: i18next.t('pageLayout:notification.notify_rule'),
        path: '',
      },
      {
        key: 'notify_channels',
        label: i18next.t('pageLayout:notification.notify_channels'),
        path: '',
      },
      {
        key: 'notify_configs',
        label: i18next.t('pageLayout:notification.notify_configs'),
        path: '',
      },
      {
        key: 'notify_settings',
        label: i18next.t('pageLayout:notification.notify_settings'),
        path: '',
      },
      {
        key: 'notify_template',
        label: i18next.t('pageLayout:notification.notify_template'),
        path: '',
      },
    ],
  },
  {
    key: 'integrations',
    label: i18next.t('pageLayout:integrations.title'),
    children: [
      {
        key: 'data_source',
        label: i18next.t('pageLayout:integrations.data_source'),
        path: '',
      },
      {
        key: 'built_in_components',
        label: i18next.t('pageLayout:integrations.built_in_components'),
        path: '',
      },
      {
        key: 'system_built_in',
        label: i18next.t('pageLayout:integrations.system_built_in'),
        path: '',
      },
      {
        key: 'Grafana',
        label: i18next.t('pageLayout:integrations.Grafana'),
        path: '',
      },
      {
        key: 'CMDB',
        label: i18next.t('pageLayout:integrations.CMDB'),
        path: '',
      },
      {
        key: 'change_system',
        label: i18next.t('pageLayout:integrations.change_system'),
        path: '',
      },
    ],
  },
  {
    key: 'organization',
    label: i18next.t('pageLayout:organization.title'),
    children: [
      {
        key: 'users',
        label: i18next.t('pageLayout:organization.users'),
        path: '',
      },
      {
        key: 'teams',
        label: i18next.t('pageLayout:organization.teams'),
        path: '',
      },
      {
        key: 'permission',
        label: i18next.t('pageLayout:organization.permission'),
        path: '',
      },
      {
        key: 'contact',
        label: i18next.t('pageLayout:organization.contact'),
        path: '',
      },
    ],
  },
  {
    key: 'setting',
    label: i18next.t('pageLayout:setting.title'),
    children: [
      {
        key: 'site_setting',
        label: i18next.t('pageLayout:setting.site_setting'),
        path: '',
      },
      {
        key: 'variable_configs',
        label: i18next.t('pageLayout:setting.variable_configs'),
        path: '',
      },
      {
        key: 'sso',
        label: i18next.t('pageLayout:setting.sso'),
        path: '',
      },
      {
        key: 'audit_log',
        label: i18next.t('pageLayout:setting.audit_log'),
        path: '',
      },
      {
        key: 'alert_servers',
        label: i18next.t('pageLayout:setting.alert_servers'),
        path: '',
      },
      {
        key: 'about',
        label: i18next.t('pageLayout:setting.about'),
        path: '',
      },
    ],
  },
];

export default menu;
