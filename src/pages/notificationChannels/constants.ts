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
