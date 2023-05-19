const zh_HK = {
  title: '資料來源管理',
  list_title: '已接入的資料來源',
  name: '資料來源名稱',
  id: '資料來源 ID',
  description: '備註',
  type: '資料來源型別',
  enable: '啟用',
  disable: '禁用',
  confirm: {
    enable: '確定啟用該資料來源嗎？',
    disable: '確定禁用該資料來源嗎？',
  },
  success: {
    enable: '啟用成功',
    disable: '禁用成功',
  },
  rename_title: '修改資料來源名稱',
  type_btn_add: '新增',
  form: {
    other: '其他',
    name: '名稱',
    name_msg: '請輸入字母/數字/下劃線，必須以字母開頭',
    name_msg2: '最少輸入三位',
    timeout: '超時 (單位：ms)',
    auth: '授權',
    username: '使用者名稱',
    password: '密碼',
    skip_ssl_verify: '跳過 SSL 驗證',
    yes: '是',
    no: '否',
    headers: '自定義 HTTP 標頭',
    description: '備註',
    cluster: '關聯告警引擎叢集',
    cluster_confirm: '發現你的資料來源沒有關聯告警引擎叢集，將無法用來做告警，是否去關聯下告警引擎叢集？',
    cluster_confirm_ok: '不做關聯',
    cluster_confirm_cancel: '去做關聯',
    es: {
      version: '版本',
      max_shard: '最大併發分片請求數',
      min_interval: '最小時間間隔 (s)',
      min_interval_tip: '按時間間隔自動分組的下限。建議設定為寫入頻率，例如，如果資料每分鐘寫入一次，則為 1m。',
    },
    jaeger: {
      version: '版本',
    },
    ck: {
      title: '資料庫基本資訊',
      addr: '資料庫地址',
    },
    sls: {
      title: '服務入口',
      endpoint: '訪問域名（私網域名/公網域名/跨域域名）',
      access: '授權',
    },
  },
};

export default zh_HK;
