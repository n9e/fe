import i18next from 'i18next';

// @ts-ignore
import * as plusNotificationChannels from 'plus:/parcels/NotificationChannels';

export const NS = 'notification-channels';
export const PERM = `/${NS}`;
export const FILTER_SESSION_STORAGE_KEY = 'notification-channels-filter';
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

/**
 * 历史数据与自建的 script 媒介会带上不在类型表里的 ident（如 feishuapp、dchat）。
 * 此前这类 ident 会 fallback 到 callback 的配置，页面顶部因此顶着一个 Callback 的图标，
 * 看上去像是「这条是 Callback 媒介」——直接误导。
 *
 * known 为 false 时调用方应展示原始 ident 与中性图标，不要冒充任何已知类型。
 */
export function getChannelTypeMeta(ident?: string): { logo?: string; label: string; known: boolean } {
  const types = getNotificationChannelTypes();
  const config = ident ? types[ident] : undefined;
  if (!config) {
    return { label: ident ?? '-', known: false };
  }
  return { logo: config.logo, label: i18next.t(`${NS}:types.${ident}`), known: true };
}

export const getNotificationChannelTypes = () => {
  const dt = (key: string) => i18next.t(`${NS}:default_values.${key}`);
  const types = {
    flashduty: {
      logo: '/image/logos/flashduty.png',
      type: 'flashduty',
      default_values: {
        request_type: 'flashduty',
        request_config: {
          http_request_config: {
            url: '',
            method: '',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: '',
            },
          },
          flashduty_request_config: {
            proxy: '',
            integration_url: 'flashduty integration url',
            timeout: 5000,
            retry_times: 3,
            retry_sleep: 0,
          },
        },
      },
    },
    callback: {
      logo: '/image/notification/http.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'callback_url',
                cname: 'Callback Url',
                type: 'string',
              },
              {
                key: 'note',
                cname: 'Note',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: '{{$params.callback_url}}',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: '{{ jsonMarshal $events }}',
            },
          },
        },
      },
    },
    email: {
      logo: '/image/notification/smtp.png',
      type: 'smtp',
      default_values: {
        param_config: {
          user_info: {
            contact_key: 'email',
          },
          custom: {
            params: null,
          },
        },
        request_type: 'smtp',
        request_config: {
          smtp_request_config: {
            host: 'smtp.host',
            port: 25,
            username: 'your-username',
            password: 'your-password',
            from: 'your-email',
            insecure_skip_verify: true,
            batch: 0,
          },
        },
      },
    },
    dingtalk: {
      logo: '/image/logos/dingtalk.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'access_token',
                cname: 'Access Token',
                type: 'string',
              },
              {
                key: 'bot_name',
                cname: 'Bot Name',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://oapi.dingtalk.com/robot/send',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: {
                access_token: '{{$params.access_token}}',
              },
              form: '',
              body: '{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}\\n{{batchContactsAts $sendtos}}"}, "at": {"atMobiles": {{batchContactsJsonMarshal $sendtos}} }}',
            },
          },
          dingtalk_request_config: {
            app_key: '',
            app_secret: '',
          },
        },
      },
    },
    // dingtalkapp: {
    //   logo: '/image/logos/dingtalk.png',
    //   type: 'dingtalkapp',
    //   default_values: {},
    // },
    wecom: {
      logo: '/image/logos/wecom.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'key',
                cname: 'Key',
                type: 'string',
              },
              {
                key: 'bot_name',
                cname: 'Bot Name',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: {
                key: '{{$params.key}}',
              },
              form: '',
              body: '{"msgtype": "markdown", "markdown": {"content": "{{$tpl.content}}"}}',
            },
          },
        },
      },
    },
    // wecomapp: {
    //   logo: '/image/logos/wecom.png',
    //   type: 'wecomapp',
    //   default_values: {},
    // },
    feishucard: {
      logo: '/image/logos/feishu.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'access_token',
                cname: 'Access Token',
                type: 'string',
              },
              {
                key: 'bot_name',
                cname: 'Bot Name',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://open.feishu.cn/open-apis/bot/v2/hook/{{$params.access_token}}',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: '{"msg_type": "interactive", "card": {"config": {"wide_screen_mode": true}, "header": {"title": {"content": "{{$tpl.title}}", "tag": "plain_text"}, "template": "{{if $event.IsRecovered}}green{{else}}red{{end}}"}, "elements": [{"tag": "markdown", "content": "{{$tpl.content}}"}]}}',
            },
          },
          feishu_request_config: {
            app_id: '',
            app_secret: '',
          },
        },
      },
    },
    // feishu: {
    //   logo: '/image/logos/feishu.png',
    //   type: 'http',
    //   default_values: {
    //     param_config: {
    //       custom: {
    //         params: [
    //           {
    //             key: 'access_token',
    //             cname: 'Access Token',
    //             type: 'string',
    //           },
    //           {
    //             key: 'bot_name',
    //             cname: 'Bot Name',
    //             type: 'string',
    //           },
    //         ],
    //       },
    //     },
    //     request_type: 'http',
    //     request_config: {
    //       http_request_config: {
    //         url: 'https://open.feishu.cn/open-apis/bot/v2/hook/{{$params.access_token}}',
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         proxy: '',
    //         timeout: 10000,
    //         concurrency: 5,
    //         retry_times: 3,
    //         retry_interval: 100,
    //         request: {
    //           parameters: null,
    //           form: '',
    //           body: '{"msg_type": "interactive", "card": {"config": {"wide_screen_mode": true}, "header": {"title": {"content": "{{$tpl.title}}", "tag": "plain_text"}, "template": "{{if $event.IsRecovered}}green{{else}}red{{end}}"}, "elements": [{"tag": "markdown", "content": "{{$tpl.content}}"}]}}',
    //         },
    //       },
    //       feishu_request_config: {
    //         app_id: '',
    //         app_secret: '',
    //       },
    //     },
    //   },
    // },
    // feishuapp: {
    //   logo: '/image/logos/feishu.png',
    //   type: 'feishuapp',
    // },
    larkcard: {
      logo: '/image/logos/feishu.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'token',
                cname: 'Token',
                type: 'string',
              },
              {
                key: 'bot_name',
                cname: 'Bot Name',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://open.larksuite.com/open-apis/bot/v2/hook/{{$params.token}}',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: '{"msg_type": "interactive", "card": {"config": {"wide_screen_mode": true}, "header": {"title": {"content": "{{$tpl.title}}", "tag": "plain_text"}, "template": "{{if $event.IsRecovered}}green{{else}}red{{end}}"}, "elements": [{"tag": "markdown", "content": "{{$tpl.content}}"}]}}',
            },
          },
          feishu_request_config: {
            app_id: '',
            app_secret: '',
          },
        },
      },
    },
    // lark: {
    //   logo: '/image/logos/feishu.png',
    //   type: 'http',
    //   default_values: {
    //     param_config: {
    //       custom: {
    //         params: [
    //           {
    //             key: 'token',
    //             cname: 'Token',
    //             type: 'string',
    //           },
    //           {
    //             key: 'bot_name',
    //             cname: 'Bot Name',
    //             type: 'string',
    //           },
    //         ],
    //       },
    //     },
    //     request_type: 'http',
    //     request_config: {
    //       http_request_config: {
    //         url: 'https://open.larksuite.com/open-apis/bot/v2/hook/{{$params.token}}',
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         proxy: '',
    //         timeout: 10000,
    //         concurrency: 5,
    //         retry_times: 3,
    //         retry_interval: 100,
    //         request: {
    //           parameters: null,
    //           form: '',
    //           body: '{"msg_type": "interactive", "card": {"config": {"wide_screen_mode": true}, "header": {"title": {"content": "{{$tpl.title}}", "tag": "plain_text"}, "template": "{{if $event.IsRecovered}}green{{else}}red{{end}}"}, "elements": [{"tag": "markdown", "content": "{{$tpl.content}}"}]}}',
    //         },
    //       },
    //       feishu_request_config: {
    //         app_id: '',
    //         app_secret: '',
    //       },
    //     },
    //   },
    // },
    telegram: {
      logo: '/image/logos/telegram.png',
      type: 'http',
      default_values: {
        param_config: {
          custom: {
            params: [
              {
                key: 'token',
                cname: 'Token',
                type: 'string',
              },
              {
                key: 'chat_id',
                cname: 'Chat Id',
                type: 'string',
              },
              {
                key: 'bot_name',
                cname: 'Bot Name',
                type: 'string',
              },
            ],
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://api.telegram.org/bot{{$params.token}}/sendMessage',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: {
                chat_id: '{{$params.chat_id}}',
              },
              form: '',
              body: '{"text":"{{$tpl.content}}","parse_mode": "HTML"}',
            },
          },
        },
      },
    },
    'ali-voice': {
      logo: '/image/logos/alibabacloud.png',
      type: 'http',
      default_values: {
        param_config: {
          user_info: {
            contact_key: 'phone',
          },
          custom: {
            params: null,
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://dyvmsapi.aliyuncs.com',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'dyvmsapi.aliyuncs.com',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: {
                AccessKeyId: dt('access_key_id'),
                AccessKeySecret: dt('access_key_secret'),
                CalledNumber: '{{ $sendto }}',
                CalledShowNumber: dt('show_number'),
                TtsCode: dt('voice_code'),
                TtsParam: `{"incident":"${dt('ali_voice_tts_param')}"}`,
              },
              form: '',
              body: '',
            },
          },
        },
      },
    },
    'ali-sms': {
      logo: '/image/logos/alibabacloud.png',
      type: 'http',
      default_values: {
        param_config: {
          user_info: {
            contact_key: 'phone',
          },
          custom: {
            params: null,
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://dysmsapi.aliyuncs.com',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'dysmsapi.aliyuncs.com',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: {
                AccessKeyId: dt('access_key_id'),
                AccessKeySecret: dt('access_key_secret'),
                PhoneNumbers: '{{ $sendto }}',
                SignName: dt('sign_name'),
                TemplateCode: dt('template_id'),
                TemplateParam: `{"incident":"${dt('ali_sms_template_param')}"}`,
              },
              form: '',
              body: '',
            },
          },
        },
      },
    },
    'tx-voice': {
      logo: '/image/logos/tencentcloud.png',
      type: 'http',
      default_values: {
        param_config: {
          user_info: {
            contact_key: 'phone',
          },
          custom: {
            params: null,
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://vms.tencentcloudapi.com',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'vms.tencentcloudapi.com',
              Secret_ID: dt('secret_id'),
              Secret_Key: dt('secret_key'),
              Service: 'vms',
              'X-TC-Action': 'SendTtsVoice',
              'X-TC-Region': 'ap-beijing',
              'X-TC-Version': '2020-09-02',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: `{"CalledNumber":"+86{{ $sendto }}","TemplateId":"${dt('template_id')}","TemplateParamSet":["{{$tpl.content}}"],"VoiceSdkAppid":"${dt('app_id')}"}`,
            },
          },
        },
      },
    },
    'tx-sms': {
      logo: '/image/logos/tencentcloud.png',
      type: 'http',
      default_values: {
        param_config: {
          user_info: {
            contact_key: 'phone',
          },
          custom: {
            params: null,
          },
        },
        request_type: 'http',
        request_config: {
          http_request_config: {
            url: 'https://sms.tencentcloudapi.com',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'sms.tencentcloudapi.com',
              Secret_ID: dt('secret_id'),
              Secret_Key: dt('secret_key'),
              Service: 'sms',
              'X-TC-Action': 'SendSms',
              'X-TC-Region': dt('region'),
              'X-TC-Version': '2021-01-11',
            },
            proxy: '',
            timeout: 10000,
            concurrency: 5,
            retry_times: 3,
            retry_interval: 100,
            request: {
              parameters: null,
              form: '',
              body: `{"PhoneNumberSet":["{{ $sendto }}"],"SignName":"${dt('sign_name')}","SmsSdkAppId":"${dt('app_id')}","TemplateId":"${dt(
                'template_id',
              )}","TemplateParamSet":["{{$tpl.content}}"]}`,
            },
          },
        },
      },
    },
    // slackbot: {
    //   logo: '/image/logos/slack.png',
    //   type: 'http',
    //   default_values: {
    //     param_config: {
    //       custom: {
    //         params: [
    //           {
    //             key: 'channel',
    //             cname: 'channel',
    //             type: 'string',
    //           },
    //           {
    //             key: 'channel_name',
    //             cname: 'Channel Name',
    //             type: 'string',
    //           },
    //         ],
    //       },
    //     },
    //     request_type: 'http',
    //     request_config: {
    //       http_request_config: {
    //         url: 'https://slack.com/api/chat.postMessage',
    //         method: 'POST',
    //         headers: {
    //           Authorization: 'Bearer <you slack bot token>',
    //           'Content-Type': 'application/json',
    //         },
    //         proxy: '',
    //         timeout: 10000,
    //         concurrency: 5,
    //         retry_times: 3,
    //         retry_interval: 100,
    //         request: {
    //           parameters: null,
    //           form: '',
    //           body: '{"channel": "#{{$params.channel}}", "text":  "{{$tpl.content}}", "mrkdwn": true}',
    //         },
    //       },
    //     },
    //   },
    // },
    // mattermostbot: {
    //   logo: '/image/logos/mattermost.png',
    //   type: 'http',
    //   default_values: {
    //     param_config: {
    //       custom: {
    //         params: [
    //           {
    //             key: 'channel_id',
    //             cname: 'Channel ID',
    //             type: 'string',
    //           },
    //           {
    //             key: 'channel_name',
    //             cname: 'Channel Name',
    //             type: 'string',
    //           },
    //         ],
    //       },
    //     },
    //     request_type: 'http',
    //     request_config: {
    //       http_request_config: {
    //         url: '<your mattermost url>/api/v4/posts',
    //         method: 'POST',
    //         headers: {
    //           Authorization: 'Bearer <you mattermost bot token>',
    //           'Content-Type': 'application/json',
    //         },
    //         proxy: '',
    //         timeout: 10000,
    //         concurrency: 5,
    //         retry_times: 3,
    //         retry_interval: 100,
    //         request: {
    //           parameters: null,
    //           form: '',
    //           body: '{"channel_id": "{{$params.channel_id}}", "message":  "{{$tpl.content}}"}',
    //         },
    //       },
    //     },
    //   },
    // },
    discord: {
      logo: '/image/logos/discord.png',
      type: 'discord',
      default_values: {
        request_type: 'discord',
        // 规则侧参数与后端内置 Discord 媒介（models.DiscordRuleParams）一致，规则页的历史参数复用按这些 key 回显
        param_config: {
          custom: {
            params: [
              { key: 'webhook_url', cname: 'Webhook URL', type: 'string' },
              { key: 'bot_name', cname: 'Name', type: 'string' },
              { key: 'target', cname: 'Send to', type: 'string' },
              { key: 'thread_name', cname: 'Post title', type: 'string' },
              { key: 'thread_id', cname: 'Thread ID', type: 'string' },
            ],
          },
        },
        request_config: {
          discord_request_config: {
            timeout: 10000,
            retry_times: 3,
            retry_sleep: 1000,
          },
        },
      },
    },
    slackwebhook: {
      logo: '/image/logos/slack.png',
      type: 'slackwebhook',
      default_values: {
        request_type: 'slackwebhook',
        // 规则侧参数与后端内置媒介（models.SlackWebhookRuleParams）一致，规则页的历史参数复用按这些 key 回显
        param_config: {
          custom: {
            params: [
              { key: 'webhook_url', cname: 'Webhook URL', type: 'string' },
              { key: 'bot_name', cname: 'Name', type: 'string' },
            ],
          },
        },
        request_config: {
          slackwebhook_request_config: {
            timeout: 10000,
            retry_times: 3,
            retry_sleep: 1000,
          },
        },
      },
    },
    mattermostwebhook: {
      logo: '/image/logos/mattermost.png',
      type: 'mattermostwebhook',
      default_values: {
        request_type: 'mattermostwebhook',
        // 规则侧参数与后端内置媒介（models.MattermostWebhookRuleParams）一致，规则页的历史参数复用按这些 key 回显
        param_config: {
          custom: {
            params: [
              { key: 'webhook_url', cname: 'Webhook URL', type: 'string' },
              { key: 'bot_name', cname: 'Name', type: 'string' },
            ],
          },
        },
        request_config: {
          mattermostwebhook_request_config: {
            timeout: 10000,
            retry_times: 3,
            retry_sleep: 1000,
          },
        },
      },
    },
    jsm_alert: {
      logo: '/image/logos/jira.png',
      type: 'jsm_alert',
      default_values: {
        request_type: 'jsm_alert',
        // 规则侧参数与后端内置 JSM Alert 媒介（models.JSMAlertRuleParams）一致，规则页的历史参数复用按这些 key 回显
        param_config: {
          custom: {
            params: [
              { key: 'api_key', cname: 'API Key', type: 'string' },
              { key: 'bot_name', cname: 'Name', type: 'string' },
            ],
          },
        },
        request_config: {
          jsm_alert_request_config: {
            priority_map: { '1': 'P1', '2': 'P2', '3': 'P3' },
            timeout: 10000,
            retry_times: 3,
            retry_sleep: 1000,
          },
        },
      },
    },
    jira: {
      logo: '/image/logos/jira.png',
      type: 'jira',
      default_values: {
        request_type: 'jira',
        // 显式给出 param_config：浅合并 DEFAULT_VALUES 时会继承 contact_key: 'phone'，Jira 不需要收件人
        param_config: {
          custom: {
            params: [],
          },
        },
        request_config: {
          jira_request_config: {
            deployment_type: 'cloud',
            token_type: 'scoped',
            site_url: '',
            email: '',
            api_token: '',
            cloud_id: '',
            proxy: '',
            timeout: 10000,
            retry_times: 3,
            retry_sleep: 1000,
            insecure_skip_verify: false,
          },
        },
      },
    },
    pagerduty: {
      logo: '/image/logos/pagerduty.png',
      type: 'pagerduty',
      default_values: {
        request_type: 'pagerduty',
        request_config: {
          pagerduty_request_config: {
            proxy: '',
            api_key: 'pagerduty api key',
            timeout: 5000,
            retry_times: 3,
            retry_sleep: 0,
          },
        },
      },
    },
    script: {
      logo: '/image/notification/script.png',
      type: 'script',
      default_values: {
        request_type: 'script',
        request_config: {
          script_request_config: {
            script_type: 'script',
            timeout: 5000,
            script: '',
            path: '',
          },
        },
      },
    },
  };
  // 商业版会在这里覆盖部分媒介的默认请求体（灭火图截图与详情/AI 链接），开源版原样返回
  return typeof plusNotificationChannels.applyChannelDefaultValues === 'function' ? plusNotificationChannels.applyChannelDefaultValues(types) : types;
};
