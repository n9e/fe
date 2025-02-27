const ja_JP = {
  title: '通知渠道',
  basic_configuration: '基本設定',
  variable_configuration: {
    title: '変数設定',
    contact_key: '連絡先',
    params: {
      title: 'パラメータ設定',
      key: 'パラメータ識別子',
      key_required: 'パラメータ識別子は必須です',
      cname: '別名',
      cname_required: '別名は必須です',
    },
  },
  request_configuration: {
    http: 'HTTP 設定',
    smtp: 'SMTP 設定',
    script: 'スクリプト設定',
    flashduty: 'FlashDuty 設定',
  },
  request_type: '送信タイプ',
  http_request_config: {
    title: 'HTTP',
    url: 'URL',
    method: 'リクエストメソッド',
    header: 'リクエストヘッダー',
    header_key: 'パラメータ名',
    header_value: 'パラメータ値',
    timeout: 'タイムアウト (単位: ミリ秒)',
    concurrency: '同時実行数',
    retry_times: 'リトライ回数',
    retry_interval: 'リトライ間隔 (単位: ミリ秒)',
    insecure_skip_verify: '証明書検証をスキップ',
    proxy: 'プロキシ',
    params: 'リクエストパラメータ',
    params_key: 'パラメータ名',
    params_value: 'パラメータ値',
    body: 'リクエストボディ',
  },
  smtp_request_config: {
    title: 'SMTP',
    host: 'サーバー',
    port: 'ポート',
    username: 'ユーザー名',
    password: 'パスワード',
    from: '差出人',
    insecure_skip_verify: '証明書検証をスキップ',
    batch: 'バッチ送信',
  },
  script_request_config: {
    title: 'スクリプト',
    script: {
      option: 'スクリプトを使用',
      label: 'スクリプト内容',
    },
    path: {
      option: 'パスを使用',
      label: 'ファイルパス',
    },
    timeout: 'タイムアウト (単位: ミリ秒)',
  },
  flashduty_request_config: {
    title: 'FlashDuty',
    integration_url: 'URL',
    proxy: 'プロキシ',
  },
};

export default ja_JP;
