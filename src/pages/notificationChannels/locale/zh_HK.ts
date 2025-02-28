const zh_HK = {
  title: '通知媒介',
  basic_configuration: '基礎配置',
  ident_tip: '系統中用於識別該通知媒介的標識碼，一般為英文、數字或下劃線組合，不可重復',
  note_tip: '可填寫對該通知媒介的補充說明或使用場景，方便後續維護或協作時查看',
  enable_tip: '是否啟用此通知媒介的配置。關閉後，該配置將暫時失效，不會再發送通知，通知規則的媒介選擇中，也會隱藏此通知媒介',
  variable_configuration: {
    title: '變量配置',
    contact_key: '聯繫方式',
    contact_key_tip: '選擇通知發送的目標類型，如“Phone”表示通過電話、短信等方式進行發送，可以到聯繫方式管理頁面添加新的聯繫方式',
    params: {
      title: '參數配置',
      title_tip:
        '可在此處設置該通知媒介所需的自定義參數（如釘釘機器人 Token、API Key 等），並為其指定別名。這樣就能讓同一個通知媒介模板在不同通知規則中使用不同的參數值（例如不同的釘釘機器人 Token），實現靈活發送到不同接收對象或場景',
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
    url_tip: '接收通知請求的目標地址，例如 Webhook 地址或自建服務接口',
    method: '請求方法',
    header: '請求頭',
    header_tip: '需要在請求中附帶的自定義 Header 參數，如認證信息或數據格式聲明',
    header_key: '參數名',
    header_value: '參數值',
    timeout: '超時時間 (單位: 毫秒)',
    concurrency: '並發數',
    concurrency_tip: '同時發起的最大並行請求數。適當增大可提高發送效率，但需注意目標服務的處理能力',
    retry_times: '重試次數',
    retry_interval: '重試間隔 (單位: 毫秒)',
    insecure_skip_verify: '跳過證書驗證',
    proxy: '代理',
    proxy_tip: '當系統需要通過特定代理服務器進行外部 HTTP 請求時，可在此處填寫代理地址和端口',
    params: '請求參數',
    params_key: '參數名',
    params_value: '參數值',
    body: '請求體',
  },
  smtp_request_config: {
    title: 'SMTP',
    host: '服務器',
    host_tip: '填寫 SMTP 服務器的域名或 IP 地址，例如 smtp.example.com，用於發送郵件',
    port: '端口',
    port_tip: 'SMTP 服務器的端口號。常見端口如 25、465（SSL）、587（STARTTLS）；請與提供方確認正確端口',
    username: '用戶名',
    username_tip: '登錄 SMTP 服務器所需的用戶名，通常是郵箱地址或賬號',
    password: '密碼',
    password_tip: '對應 SMTP 用戶名的登錄密碼或授權碼，建議使用授權碼以增強安全性',
    from: '發件人',
    from_tip: '郵件中顯示的發件人名稱或郵箱別名，可以讓收件人更好識別郵件來源',
    insecure_skip_verify: '跳過證書驗證',
    insecure_skip_verify_tip: '若啟用，則忽略對 SMTP 服務器 SSL 證書的校驗，多用於測試或自簽名證書環境；生產環境建議關閉',
    batch: '批量發送',
    batch_tip: '在通知時，可同時發送的郵件最大數量，避免單次發送過多導致延遲或被服務器拒絕',
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
    integration_url_tip: '此處填寫的是 Flashduty 整合中心所建立的整合位址，可以到 https://console.flashcat.cloud/settings/source/alert/add/n9e 去建立',
    proxy: '代理',
    proxy_tip: '當系統需要通過特定代理服務器進行外部 HTTP 請求時，可在此處填寫代理地址和端口',
  },
};

export default zh_HK;
