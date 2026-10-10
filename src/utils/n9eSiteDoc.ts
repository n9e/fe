// 夜莺新官网 n9e.github.io 目前只有英文文档；非中文界面内嵌（iframe）文档时，
// 把 flashcat.cloud 上的旧文档地址映射到新官网的对应页面。映射不到的保持旧地址。
export const N9E_SITE_ORIGIN = 'https://n9e.github.io';

const NV = '/docs/content/flashcat-monitor/nightingale-v9';
const LOG_DISCOVER = '/docs/content/flashcat/log/discover';

// key: flashcat.cloud 文档路径（不带结尾 /）；value: 新官网路径，可带 #anchor
const N9E_SITE_DOC_MAP: Record<string, string> = {
  '/docs/content/flashcat-monitor/categraf/2-installation': '/docs/data/categraf/install',
  [NV]: '/docs',
  [`${NV}/prologue/introduction`]: '/docs/get-started/introduction',

  [`${NV}/quickstart/datasource`]: '/docs/data/overview',
  [`${NV}/quickstart/dashboard`]: '/docs/query/dashboards',
  [`${NV}/quickstart/ad-hoc`]: '/docs/query/metric-explorer',
  [`${NV}/quickstart/metric-alerting`]: '/docs/alerting/first-rule',
  [`${NV}/quickstart/notify-rules`]: '/docs/notifications/rules',

  [`${NV}/usage/ai-config/llm-configs`]: '/docs/ai/llm-provider',
  [`${NV}/usage/ai-config/skills`]: '/docs/ai/skills',
  [`${NV}/usage/ai-config/builtin-skills`]: '/docs/ai/skills',

  [`${NV}/usage/alert-notify/event-pipelines`]: '/docs/events/pipelines',
  [`${NV}/usage/alert-notify/event-pipelines/executions`]: '/docs/events/execution-records',
  [`${NV}/usage/alert-notify/event-pipelines/processor-ai-summary`]: '/docs/events/ai-summary',
  [`${NV}/usage/alert-notify/event-pipelines/processor-callback`]: '/docs/events/relabel-enrich#callback-versus-event-update',
  [`${NV}/usage/alert-notify/event-pipelines/processor-event-drop`]: '/docs/events/noise-patterns',
  [`${NV}/usage/alert-notify/event-pipelines/processor-event-relabel`]: '/docs/events/relabel-enrich#rewriting-labels-the-event-label-rewrite-processor',
  [`${NV}/usage/alert-notify/event-pipelines/processor-event-update`]: '/docs/events/relabel-enrich#pulling-context-from-an-external-system-the-event-update-processor',
  [`${NV}/usecase/processor`]: '/docs/events/pipelines',

  [`${NV}/usage/alert-notify/events/alert-history`]: '/docs/events/active-historical',
  [`${NV}/usage/alert-notify/events/cur-events`]: '/docs/events/active-historical',

  [`${NV}/usage/alert-notify/msg-template/notification-templates`]: '/docs/notifications/templates',
  [`${NV}/usage/alert-notify/msg-template/tpl_func`]: '/docs/reference/notification-variables#commonly-used-helper-functions',
  [`${NV}/usage/alert-notify/notify-channel`]: '/docs/notifications/overview',
  [`${NV}/usecase/media`]: '/docs/notifications/overview',

  [`${NV}/usage/alert-notify/rules/alert-mute`]: '/docs/events/mute-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules`]: '/docs/alerting/overview',
  [`${NV}/usage/alert-notify/rules/alert-rules/alert-basic-conf`]: '/docs/alerting/first-rule',
  [`${NV}/usage/alert-notify/rules/alert-rules/effective-configuration`]: '/docs/alerting/scope#the-effective-time-window',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/alert-promql-var-set`]: '/docs/alerting/metric-rules#variables-one-rule-different-thresholds-per-host',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/promethues`]: '/docs/alerting/metric-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/doris`]: '/docs/alerting/sql-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/iotdb`]: '/docs/alerting/sql-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/mysql`]: '/docs/alerting/sql-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/pgsql`]: '/docs/alerting/sql-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/tdengine`]: '/docs/alerting/sql-rules',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/es`]: '/docs/alerting/log-rules#elasticsearch-and-opensearch',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/loki`]: '/docs/alerting/log-rules#loki',
  [`${NV}/usage/alert-notify/rules/alert-rules/query-data/victorialogs`]: '/docs/alerting/log-rules#victorialogs',

  [`${NV}/usage/alert-notify/self-healing/create-temporary-task`]: '/docs/events/self-healing',
  [`${NV}/usage/alert-notify/self-healing/self-healing-script`]: '/docs/events/self-healing#1-write-a-self-healing-script',

  [`${NV}/usage/data-query/dashboard/integrated-dashboard`]: '/docs/data/integrations/import#importing-dashboards',
  [`${NV}/usage/data-query/logs/elasticserch`]: '/docs/query/log-explorer',
  [`${NV}/usage/data-query/metrics/metrics-built-in`]: '/docs/query/built-in-views',
  [`${NV}/usage/data-query/metrics/quick-view`]: '/docs/query/object-view',
  [`${NV}/usage/data-query/metrics/recording-rules`]: '/docs/query/recording-rules',

  [`${NV}/usage/infrastructure/collection`]: '/docs/data/integrations/collector-config',
  [`${NV}/usage/infrastructure/server-list`]: '/docs/data/categraf/targets',

  [`${NV}/usage/integrations/datasource`]: '/docs/data/overview',
  [`${NV}/usage/integrations/datasource/prometheus`]: '/docs/data/prometheus',
  [`${NV}/usage/integrations/datasource/es`]: '/docs/data/elasticsearch',
  [`${NV}/usage/integrations/datasource/loki`]: '/docs/data/loki-victorialogs',
  [`${NV}/usage/integrations/datasource/mysql`]: '/docs/data/sql-databases',
  [`${NV}/usage/integrations/datasource/tdengine`]: '/docs/data/sql-databases',
  [`${NV}/usage/integrations/embedded-products`]: '/docs/query/embedding#embed-an-external-system-into-nightingale',
  [`${NV}/usage/integrations/templates`]: '/docs/data/integrations',
  [`${NV}/usage/integrations/templates/alert-rule-template`]: '/docs/alerting/templates',
  [`${NV}/usage/integrations/templates/built-in-metric-template`]: '/docs/query/built-in-views#3-add-one-of-your-own',
  [`${NV}/usage/integrations/templates/dashboard-template`]: '/docs/data/integrations/import#importing-dashboards',

  [`${NV}/usage/personnel-permissions/business-group`]: '/docs/security/business-groups',
  [`${NV}/usage/personnel-permissions/contact`]: '/docs/security/contacts',
  [`${NV}/usage/personnel-permissions/permissions-management`]: '/docs/security/roles',
  [`${NV}/usage/personnel-permissions/team-management`]: '/docs/security/users-teams#3-create-a-team-and-add-people-to-it',
  [`${NV}/usage/personnel-permissions/user-management`]: '/docs/security/users-teams',

  [`${NV}/usage/system-configuration/alert-engine`]: '/docs/operations/health#the-alerting-engine-heartbeat',
  [`${NV}/usage/system-configuration/site-settings`]: '/docs/security/variables#6-the-fields-in-site-settings',
  [`${NV}/usage/system-configuration/variable`]: '/docs/security/variables',
  [`${NV}/usage/system-configuration/sso/oidc`]: '/docs/security/sso#1-connect-an-oidc-provider',
  [`${NV}/usage/system-configuration/sso/oauth2`]: '/docs/security/sso#oauth2',
  [`${NV}/usage/system-configuration/sso/cas`]: '/docs/security/sso#cas',
  [`${NV}/usage/system-configuration/sso/ldap`]: '/docs/security/sso#4-connect-ldap',
  [`${NV}/usage/system-configuration/sso/dingtalk`]: '/docs/security/sso#5-dingtalk-and-feishu-qr-login',
  [`${NV}/usage/system-configuration/sso/feishu`]: '/docs/security/sso#5-dingtalk-and-feishu-qr-login',
  [`${NV}/usecase/sso`]: '/docs/security/sso',
  [`${NV}/usecase/subscribe`]: '/docs/events/subscriptions',

  [`${LOG_DISCOVER}/what-is-log-discover`]: '/docs/query/log-explorer',
  [`${LOG_DISCOVER}/loki-log-query`]: '/docs/data/loki-victorialogs#querying-logql-and-logsql',
  [`${LOG_DISCOVER}/victorialogs-log-query`]: '/docs/data/loki-victorialogs#querying-logql-and-logsql',
  [`${LOG_DISCOVER}/what-is-sql-mode-in-ck-discover`]: '/docs/data/clickhouse-doris-iotdb#clickhouse',
  [`${LOG_DISCOVER}/what-is-sql-mode-in-doris-discover`]: '/docs/data/clickhouse-doris-iotdb#doris',
  [`${LOG_DISCOVER}/what-is-query-mode-in-doris-discover`]: '/docs/data/clickhouse-doris-iotdb#doris',
};

// 通知媒介表单按 ident 拼的文档地址 notify-channel/${ident}
const NOTIFY_CHANNEL_DOC_MAP: Record<string, string> = {
  dingtalk: '/docs/notifications/dingtalk-feishu-wecom',
  wecom: '/docs/notifications/dingtalk-feishu-wecom',
  feishu: '/docs/notifications/dingtalk-feishu-wecom',
  feishucard: '/docs/notifications/dingtalk-feishu-wecom',
  lark: '/docs/notifications/dingtalk-feishu-wecom',
  larkcard: '/docs/notifications/dingtalk-feishu-wecom',
  email: '/docs/notifications/email-phone-sms#email-smtp-lives-on-the-media-type',
  'ali-sms': '/docs/notifications/email-phone-sms#phone-and-sms-four-cards',
  'ali-voice': '/docs/notifications/email-phone-sms#phone-and-sms-four-cards',
  'tx-sms': '/docs/notifications/email-phone-sms#phone-and-sms-four-cards',
  'tx-voice': '/docs/notifications/email-phone-sms#phone-and-sms-four-cards',
  telegram: '/docs/notifications/chat#telegram-there-is-a-card-for-it',
  slackwebhook: '/docs/notifications/chat#slack-discord-and-mattermost-create-the-media-type-by-import',
  discord: '/docs/notifications/chat#slack-discord-and-mattermost-create-the-media-type-by-import',
  mattermostwebhook: '/docs/notifications/chat#slack-discord-and-mattermost-create-the-media-type-by-import',
  flashduty: '/docs/notifications/oncall-ticketing#flashduty-shipped-with-the-open-source-edition',
  pagerduty: '/docs/notifications/oncall-ticketing#pagerduty-there-is-a-card-for-it',
  jira: '/docs/notifications/oncall-ticketing#jira--jsm-create-the-media-type-by-import',
  jsm_alert: '/docs/notifications/oncall-ticketing#jira--jsm-create-the-media-type-by-import',
  callback: '/docs/notifications/callback',
  script: '/docs/notifications/script',
};

const NOTIFY_CHANNEL_PREFIX = `${NV}/usage/alert-notify/notify-channel/`;

export function isChineseLanguage(language?: string) {
  return language === 'zh_CN' || language === 'zh_HK';
}

// 旧文档地址（flashcat.cloud 绝对地址或 /docs/content 相对路径）-> 新官网完整地址；找不到返回 undefined
export function getN9eSiteDocUrl(documentPath?: string): string | undefined {
  if (!documentPath) return undefined;
  let pathname: string;
  try {
    const u = new URL(documentPath, 'https://flashcat.cloud');
    if (u.hostname !== 'flashcat.cloud' && u.hostname !== 'www.flashcat.cloud') return undefined;
    pathname = u.pathname;
  } catch (e) {
    return undefined;
  }
  // 去掉结尾 / 以及按语言追加的 _en / _hk 后缀
  pathname = pathname.replace(/\/+$/, '').replace(/_(en|hk)$/, '');
  let target = N9E_SITE_DOC_MAP[pathname];
  if (!target && pathname.startsWith(NOTIFY_CHANNEL_PREFIX)) {
    target = NOTIFY_CHANNEL_DOC_MAP[pathname.slice(NOTIFY_CHANNEL_PREFIX.length)];
  }
  return target ? `${N9E_SITE_ORIGIN}${target}` : undefined;
}

// 新官网的内嵌模式：?onlyContent 隐藏站点导航，theme 跟随夜莺主题；hash 保持在最后以便定位到小节
export function getN9eSiteEmbedSrc(url: string, darkMode: boolean) {
  const hashIndex = url.indexOf('#');
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  return `${base}?onlyContent&theme=${darkMode ? 'dark' : 'light'}${hash}`;
}
