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
              AccessKeyId: '需要改为实际的access_key_id',
              AccessKeySecret: '需要改为实际的access_key_secret',
              CalledNumber: '{{ $sendto }}',
              CalledShowNumber: '需要改为实际的show_number, 如果为空则不显示',
              TtsCode: '需要改为实际的voice_code',
              TtsParam: '{"incident":"故障{{$tpl.incident}}，一键认领请按1"}',
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
              AccessKeyId: '需要改为实际的access_key_id',
              AccessKeySecret: '需要改为实际的access_key_secret',
              PhoneNumbers: '{{ $sendto }}',
              SignName: '需要改为实际的签名',
              TemplateCode: '需要改为实际的模板id',
              TemplateParam: '{"incident":"故障{{$tpl.incident}}，请及时处理"}',
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
            Secret_ID: '需要改为实际的secret_id',
            Secret_Key: '需要改为实际的secret_key',
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
            body: '{"CalledNumber":"+86{{ $sendto }}","TemplateId":"需要改为实际的模板id","TemplateParamSet":["{{$tpl.content}}"],"VoiceSdkAppid":"需要改为实际的appid"}',
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
            Secret_ID: '需要改为实际的secret_id',
            Secret_Key: '需要改为实际的secret_key',
            Service: 'sms',
            'X-TC-Action': 'SendSms',
            'X-TC-Region': '需要改为实际的region',
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
            body: '{"PhoneNumberSet":["{{ $sendto }}"],"SignName":"需要改为实际的签名","SmsSdkAppId":"需要改为实际的appid","TemplateId":"需要改为实际的模板id","TemplateParamSet":["{{$tpl.content}}"]}',
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
  // slackwebhook: {
  //   logo: '/image/logos/slack.png',
  //   type: 'http',
  //   default_values: {
  //     param_config: {
  //       custom: {
  //         params: [
  //           {
  //             key: 'webhook_url',
  //             cname: 'Webhook Url',
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
  //         url: '{{$params.webhook_url}}',
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
  //           body: '{"text":  "{{$tpl.content}}", "mrkdwn": true}',
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
  // mattermostwebhook: {
  //   logo: '/image/logos/mattermost.png',
  //   type: 'http',
  //   default_values: {
  //     param_config: {
  //       custom: {
  //         params: [
  //           {
  //             key: 'webhook_url',
  //             cname: 'Webhook Url',
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
  //         url: '{{$params.webhook_url}}',
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
  //           body: '{"text":  "{{$tpl.content}}"}',
  //         },
  //       },
  //     },
  //   },
  // },
  // discord: {
  //   logo: '/image/logos/discord.png',
  //   type: 'http',
  //   default_values: {
  //     param_config: {
  //       custom: {
  //         params: [
  //           {
  //             key: 'webhook_url',
  //             cname: 'Webhook Url',
  //             type: 'string',
  //           },
  //         ],
  //       },
  //     },
  //     request_type: 'http',
  //     request_config: {
  //       http_request_config: {
  //         url: '{{$params.webhook_url}}',
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
  //           body: '{"content": "{{$tpl.content}}"}',
  //         },
  //       },
  //     },
  //   },
  // },
  // jsm_alert: {
  //   logo: '/image/logos/jira.png',
  //   type: 'http',
  //   default_values: {
  //     param_config: {
  //       custom: {
  //         params: [
  //           {
  //             key: 'api_key',
  //             cname: 'API Key',
  //             type: 'string',
  //           },
  //         ],
  //       },
  //     },
  //     request_type: 'http',
  //     request_config: {
  //       http_request_config: {
  //         url: 'https://api.atlassian.com/jsm/ops/integration/v2/alerts{{if $event.IsRecovered}}/{{$event.Hash}}/close?identifierType=alias{{else}}{{end}}',
  //         method: 'POST',
  //         headers: {
  //           Authorization: 'GenieKey {{$params.api_key}}',
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
  //           body: '{{if $event.IsRecovered}}{"note":"{{$tpl.content}}","source":"{{$event.Cluster}}"}{{else}}{"message":"{{$event.RuleName}}","description":"{{$tpl.content}}","alias":"{{$event.Hash}}","priority":"P{{$event.Severity}}","tags":[{{range $i, $v := $event.TagsJSON}}{{if $i}},{{end}}"{{$v}}"{{end}}],"details":{{jsonMarshal $event.AnnotationsJSON}},"entity":"{{$event.TargetIdent}}","source":"{{$event.Cluster}}"}{{end}}',
  //         },
  //       },
  //     },
  //   },
  // },
  // jira: {
  //   logo: '/image/logos/jira.png',
  //   type: 'http',
  //   default_values: {
  //     param_config: {
  //       custom: {
  //         params: [
  //           {
  //             key: 'project_key',
  //             cname: 'Project Key',
  //             type: 'string',
  //           },
  //         ],
  //       },
  //     },
  //     request_type: 'http',
  //     request_config: {
  //       http_request_config: {
  //         url: 'https://{JIRA Service Account Email}:{API Token}@api.atlassian.com/ex/jira/{CloudID}/rest/api/3/issue',
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
  //           body: '{"fields":{"project":{"key":"{{$params.project_key}}"},"issuetype":{"name":"{{if $event.IsRecovered}}Recovery{{else}}Alert{{end}}"},"summary":"{{$event.RuleName}}","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"{{$tpl.content}}"}]}]},"labels":["{{join $event.TagsJSON "\\",\\""}}", "eventHash={{$event.Hash}}"]}}',
  //         },
  //       },
  //     },
  //   },
  // },
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
