const zh_HK = {
  title: '通知設定',
  webhooks: {
    help_content:
      '回調機制，用於夜鶯和其他系統之間的集成。夜鶯產生告警事件之後，會推送給各個回調地址，您可以自己開發一個 HTTP API 配置到這裡，接收夜鶯告警事件，進而做一些自動化的、定制化的邏輯。夜鶯回調時使用的 HTTP 方法是 POST，會把告警事件的內容以 JSON 格式放到 HTTP Request Body 中，事件數據結構請參考[這裡](',
    title: '回撥地址',
    enable: '啟用',
    note: '備註',
    url: 'URL',
    timeout: '超時 (單位： s)',
    basic_auth_user: '使用者名稱 (Basic Auth)',
    basic_auth_password: '密碼 (Basic Auth)',
    skip_verify: '跳過 SSL 驗證',
    add: '新增',
    help: `
      如果您想把夜鶯警告事件全部轉發到另一個平台處理，可以透過這裡的全域回呼位址來實現。
      <br />
      <br />
      通常來講，監控系統專注在資料收集、儲存、分析、警告事件生成，對於事件的後續分發、降噪、認領、升級、排班、協同，通常由單獨的產品來解決，這類產品統一稱為事件OnCall 類產品，OnCall 產品被廣泛應用於實踐SRE 理念的公司。
      <br />
      <br />
      OnCall 產品通常可以對接各類監控系統，例如Prometheus、Nightingale、Zabbix、ElastAlert、藍鯨、各類雲監控，各個監控系統透過WebHook 的方式把告警事件推給OnCall 中心，用戶在OnCall 中心完成後續的分發、降噪、處理。
      <br />
      <br />
      OnCall 產品國外首推 <a1>PagerDuty</a1>，國內首推 <a2>FlashDuty</a2>，大家可以免費註冊試用。
    `,
  },
  script: {
    title: '通知腳本',
    enable: '啟用',
    timeout: '超時 (單位： s)',
    type: ['使用腳本', '使用路徑'],
    path: '檔案路徑',
    content: '腳本內容',
  },
  channels: {
    title: '通知媒介',
    name: '名稱',
    ident: '標識',
    ident_msg1: '標識只能包含字母、數字、下劃線和中劃線',
    ident_msg2: '標識已存在',
    hide: '隱藏',
    add: '新增',
    add_title: '新增通知媒介',
    edit_title: '編輯通知媒介',
    enabled: '啟用',
  },
  contacts: {
    title: '聯繫方式',
    add_title: '新增聯繫方式',
    edit_title: '編輯聯繫方式',
  },
  smtp: {
    title: 'SMTP 設定',
    testMessage: '已發送測試郵件，請查收',
  },
  ibex: {
    title: '自愈配置',
  },
};

export default zh_HK;
