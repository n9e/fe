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

export interface ChannelItem {
  id: number;
  name: string;
  ident: string;
  description: string;
  enable: boolean;
  param_config: ParamConfig;
  request_type: 'http' | 'smtp' | 'script' | 'flashduty';
  request_config: {
    http_request_config: HttpRequestConfig;
    smtp_request_config: SmtpRequestConfig;
    script_request_config: ScriptRequestConfig;
    flashduty_request_config: FlashdutyRequestConfig;
  };
}
