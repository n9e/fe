const zh_HK = {
  title: '通知媒介',
  basic_configuration: '基礎配置',
  variable_configuration: {
    title: '變量配置',
    contact_key: '聯繫方式',
    params: {
      title: '參數配置',
      key: '參數標識',
      key_required: '參數標識不能為空',
      cname: '別名',
      cname_required: '別名不能為空',
    },
  },
  request_configuration: {
    http: 'HTTP 配置',
    smtp: 'SMTP 配置',
    script: '腳本配置',
    flashduty: 'FlashDuty 配置',
  },
  request_type: '發送類型',
  http_request_config: {
    title: 'HTTP',
    url: 'URL',
    method: '請求方法',
    header: '請求頭',
    header_key: '參數名',
    header_value: '參數值',
    timeout: '超時時間 (單位: 毫秒)',
    concurrency: '並發數',
    retry_times: '重試次數',
    retry_interval: '重試間隔 (單位: 毫秒)',
    insecure_skip_verify: '跳過證書驗證',
    proxy: '代理',
    params: '請求參數',
    params_key: '參數名',
    params_value: '參數值',
    body: '請求體',
  },
  smtp_request_config: {
    title: 'SMTP',
    host: '服務器',
    port: '端口',
    username: '用戶名',
    password: '密碼',
    from: '發件人',
    insecure_skip_verify: '跳過證書驗證',
    batch: '批量發送',
  },
  script_request_config: {
    title: '腳本',
    script: {
      option: '使用腳本',
      label: '腳本內容',
    },
    path: {
      option: '使用路徑',
      label: '文件路徑',
    },
    timeout: '超時時間 (單位: 毫秒)',
  },
  flashduty_request_config: {
    title: 'FlashDuty',
    integration_url: 'URL',
    proxy: '代理',
  },
};

export default zh_HK;
