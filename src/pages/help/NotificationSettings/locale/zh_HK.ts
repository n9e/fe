const zh_HK = {
  title: '通知設定',
  webhooks: {
    title: '回撥地址',
    enable: '啟用',
    note: '備註',
    url: 'URL',
    timeout: '超時 (單位： s)',
    basic_auth_user: '使用者名稱 (Basic Auth)',
    basic_auth_password: '密碼 (Basic Auth)',
    skip_verify: '跳過 SSL 驗證',
    add: '新增',
  },
  script: {
    title: '通知指令碼',
    enable: '啟用',
    timeout: '超時 (單位： s)',
    type: ['使用指令碼', '使用路徑'],
    path: '檔案路徑',
    content: '指令碼內容',
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
  },
  contacts: {
    title: '聯繫方式',
    add_title: '新增聯繫方式',
    edit_title: '編輯聯繫方式',
  },
  smtp: {
    title: 'SMTP 設定',
  },
  ibex: {
    title: '自愈配置',
  },
};

export default zh_HK;
