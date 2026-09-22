interface ParamConfig {
  user_info: {
    contact_key: string;
  };
  custom: {
    params: {
      type: string;
      key: string;
      cname: string;
    }[];
  };
}

interface HttpRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: {
    key: string;
    value: string;
  }[];
  timeout: number;
  concurrency: number;
  retry_times: number;
  retry_interval: number;
  proxy: string;
  tls: {
    skip_verify: boolean;
  };
  request: {
    parameters: {
      key: string;
      value: string;
    }[];
    body: string;
  };
}

interface SmtpRequestConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  from: string;
  insecure_skip_verify: boolean;
  batch: number;
}

interface ScriptRequestConfig {
  script_type: 'script' | 'path';
  timeout: number;
  script: string;
  path: string;
}

interface FlashdutyRequestConfig {
  integration_url: string;
  proxy: string;
}

interface PagerdutyRequestConfig {
  integration_keys: string[];
}

interface DingtalkAppRequestConfig {
  app_key: string;
  app_secret: string;
  proxy: string;
  timeout: number;
  retry_times: number;
  retry_interval: number;
}

interface WecomAppRequestConfig {
  corp_id: string;
  corp_secret: string;
  agentid: string;
  proxy: string;
  timeout: number;
  retry_times: number;
  retry_interval: number;
}

interface FeishuAppRequestConfig {
  app_id: string;
  app_secret: string;
  receive_id_type: string;
  proxy: string;
  timeout: number;
  retry_times: number;
  retry_interval: number;
}

/** 原生对接媒介共用的网络设置，与后端 models.NativeNetworkConfig 对应 */
export interface NativeNetworkConfig {
  proxy?: string;
  timeout?: number;
  retry_times?: number;
  retry_sleep?: number;
  insecure_skip_verify?: boolean;
}

export interface JiraRequestConfig extends NativeNetworkConfig {
  deployment_type: 'cloud' | 'datacenter';
  site_url: string;
  token_type: 'scoped' | 'classic';
  email: string;
  api_token: string;
  cloud_id?: string;
}

export interface DiscordRequestConfig extends NativeNetworkConfig {
  username?: string;
  avatar_url?: string;
  silent?: boolean;
}

export interface JSMAlertRequestConfig extends NativeNetworkConfig {
  api_url?: string;
  /** 告警级别 '1'/'2'/'3' → JSM 优先级 P1–P5 */
  priority_map?: Record<string, string>;
}

export interface ChannelItem {
  id: number;
  name: string;
  ident: string;
  description: string;
  enable: boolean;
  param_config: ParamConfig;
  request_type:
    | 'http'
    | 'smtp'
    | 'script'
    | 'flashduty'
    | 'pagerduty'
    | 'feishuapp'
    | 'dingtalkapp'
    | 'wecomapp'
    | 'feishu'
    | 'feishucard'
    | 'lark'
    | 'larkcard'
    | 'dingtalk'
    | 'jira'
    | 'discord'
    | 'jsm_alert';
  request_config: {
    http_request_config: HttpRequestConfig;
    smtp_request_config: SmtpRequestConfig;
    script_request_config: ScriptRequestConfig;
    flashduty_request_config: FlashdutyRequestConfig;
    pagerduty_request_config: PagerdutyRequestConfig;
    dingtalkapp_request_config: DingtalkAppRequestConfig;
    wecomapp_request_config: WecomAppRequestConfig;
    feishuapp_request_config: FeishuAppRequestConfig;
    jira_request_config?: JiraRequestConfig;
    discord_request_config?: DiscordRequestConfig;
    jsm_alert_request_config?: JSMAlertRequestConfig;
    // 群机器人（webhook）类渠道只有上传告警截图用的应用凭证，字段名与后端 models.RequestConfig 一一对应：
    // feishu / feishucard / lark / larkcard 共用 feishu_request_config，dingtalk 用 dingtalk_request_config
    feishu_request_config: Pick<FeishuAppRequestConfig, 'app_id' | 'app_secret'>;
    dingtalk_request_config: Pick<DingtalkAppRequestConfig, 'app_key' | 'app_secret'>;
  };
}
