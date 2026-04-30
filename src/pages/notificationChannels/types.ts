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

export interface ChannelItem {
  id: number;
  name: string;
  ident: string;
  description: string;
  enable: boolean;
  param_config: ParamConfig;
  request_type: 'http' | 'smtp' | 'script' | 'flashduty' | 'pagerduty' | 'feishuapp' | 'dingtalkapp' | 'wecomapp' | 'feishu' | 'feishucard' | 'lark' | 'larkcard' | 'dingtalk';
  request_config: {
    http_request_config: HttpRequestConfig;
    smtp_request_config: SmtpRequestConfig;
    script_request_config: ScriptRequestConfig;
    flashduty_request_config: FlashdutyRequestConfig;
    pagerduty_request_config: PagerdutyRequestConfig;
    dingtalkapp_request_config: DingtalkAppRequestConfig;
    wecomapp_request_config: WecomAppRequestConfig;
    feishuapp_request_config: FeishuAppRequestConfig;
    feishu_request_config: Omit<FeishuAppRequestConfig, 'app_id' | 'app_secret'>;
    feishucard_request_config: Omit<FeishuAppRequestConfig, 'app_id' | 'app_secret'>;
    lark_request_config: Omit<FeishuAppRequestConfig, 'app_id' | 'app_secret'>;
    larkcard_request_config: Omit<FeishuAppRequestConfig, 'app_id' | 'app_secret'>;
    dingtalk_request_config: Omit<DingtalkAppRequestConfig, 'app_key' | 'app_secret'>;
  };
}
