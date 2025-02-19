export const NS = 'notification-channels';
export const DEFAULT_VALUES = {
  enabled: true,
  param_config: {
    param_type: 'user_info',
    user_info: {
      contact_key: 'phone',
      batch: true,
    },
    custom: {
      params: [{}],
    },
  },
  request_type: 'http',
  http_request_config: {
    method: 'POST',
    // headers: [{}],
    timeout: 10000,
    concurrency: 3,
    retry_times: 3,
    retry_interval: 3000,
    insecure_skip_verify: true,
    request: {
      // params: [{}],
    },
  },
  smtp_request_config: {
    insecure_skip_verify: true,
    batch: 5,
  },
  script_request_config: {
    timeout: 10000,
    script_type: 'script',
  },
};
