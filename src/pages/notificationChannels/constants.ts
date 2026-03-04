export const NS = 'notification-channels';
export const PERM = `/${NS}`;
export const DEFAULT_VALUES = {
  enable: true,
  param_config: {
    user_info: {
      contact_key: 'phone',
      batch: true,
    },
  },
  request_type: 'http',
  request_config: {
    http_request_config: {
      method: 'POST',
      timeout: 10000,
      concurrency: 3,
      retry_times: 3,
      retry_interval: 3000,
      tls: {
        skip_verify: true,
      },
    },
    smtp_request_config: {
      insecure_skip_verify: true,
      port: 465,
      batch: 16,
    },
    script_request_config: {
      timeout: 10000,
      script_type: 'script',
    },
    flashduty_request_config: {
      timeout: 5000,
      retry_times: 3,
    },
  },
};

export const NOTIFICATION_CHANNEL_TYPES = {
  flashduty: {
    logo: '/image/logos/flashduty.png',
    type: 'flashduty',
  },
  callback: {
    logo: '/image/notification/http.png',
    type: 'http',
  },
  email: {
    logo: '/image/notification/smtp.png',
    type: 'smtp',
  },
  dingtalk: {
    logo: '/image/logos/dingtalk.png',
    type: 'http',
  },
  wecom: {
    logo: '/image/logos/wecom.png',
    type: 'http',
  },
  feishucard: {
    logo: '/image/logos/feishu.png',
    type: 'http',
  },
  feishu: {
    logo: '/image/logos/feishu.png',
    type: 'http',
  },
  larkcard: {
    logo: '/image/logos/feishu.png',
    type: 'http',
  },
  lark: {
    logo: '/image/logos/feishu.png',
    type: 'http',
  },
  telegram: {
    logo: '/image/logos/telegram.png',
    type: 'http',
  },
  'ali-voice': {
    logo: '/image/logos/alibabacloud.png',
    type: 'http',
  },
  'ali-sms': {
    logo: '/image/logos/alibabacloud.png',
    type: 'http',
  },
  'tx-voice': {
    logo: '/image/logos/tencentcloud.png',
    type: 'http',
  },
  'tx-sms': {
    logo: '/image/logos/tencentcloud.png',
    type: 'http',
  },
  slackbot: {
    logo: '/image/logos/slack.png',
    type: 'http',
  },
  slackwebhook: {
    logo: '/image/logos/slack.png',
    type: 'http',
  },
  mattermostbot: {
    logo: '/image/logos/mattermost.png',
    type: 'http',
  },
  mattermostwebhook: {
    logo: '/image/logos/mattermost.png',
    type: 'http',
  },
  discord: {
    logo: '/image/logos/discord.png',
    type: 'http',
  },
  jsm_alert: {
    logo: '/image/logos/jira.png',
    type: 'http',
  },
  jira: {
    logo: '/image/logos/jira.png',
    type: 'http',
  },
  pagerduty: {
    logo: '/image/logos/pagerduty.png',
    type: 'pagerduty',
  },
  script: {
    logo: '/image/notification/script.png',
    type: 'script',
  },
};
