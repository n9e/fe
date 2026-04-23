const ja_JP = {
  toolbar: {
    current_chat: '現在の会話',
    new_chat: '新規会話',
    history: '会話履歴',
    switch_to_drawer: 'ドロワーモードに切り替え',
    switch_to_floating: 'フローティングパネルに切り替え',
  },
  history: {
    untitled: '新しい会話',
    today: '今日',
    yesterday: '昨日',
    earlier: '過去',
    unknown_time: '--:--',
    delete_confirm: 'この会話を削除しますか？',
    empty: '会話履歴はありません',
  },
  input: {
    placeholder: '質問を入力してください。Enter で送信、Shift + Enter で改行',
  },
  query: {
    title: 'クエリ',
    copied: 'クエリをコピーしました',
    copy: 'コピー',
    execute: 'クエリを実行',
    execute_disabled: '実行コールバックが未設定のため、コピーのみ可能です',
  },
  action: {
    query_generator: 'クエリを生成',
  },
  message: {
    generating: '応答を生成中...',
    hint: 'ヒント',
    stopped: '生成を停止しました',
    request_failed: 'リクエストに失敗しました',
    cancelled: '今回の応答はキャンセルされました。',
    retry_later: 'しばらくしてから再試行してください。',
    empty_response: '応答内容がありません',
    thinking: '思考過程',
    unsupported_type: '未対応のコンテンツタイプ: {{type}}',
  },
  form_select: {
    title: '続行するには以下の情報を入力してください:',
    busi_group: 'ビジネスグループ',
    datasource: 'データソース',
    placeholder_select: '選択してください',
    confirm: '確定',
  },
  alert_rule: {
    title: 'アラートルール',
    copy: 'コピー',
    copied: 'ルールIDをコピーしました',
    duration_seconds: '{{seconds}} 秒継続',
    field: {
      id: 'ルールID',
      name: 'ルール名',
      group: 'ビジネスグループ',
      datasource: 'データソース',
      cate: 'データソース種別',
      severity: '重大度',
      metric: 'メトリクス',
      condition: '条件',
      note: 'アラート内容',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  dashboard: {
    title: 'ダッシュボード',
    copied: 'ダッシュボードIDをコピーしました',
    field: {
      id: 'ダッシュボードID',
      name: '名前',
      group: 'ビジネスグループ',
      datasource: '既定のデータソース',
      panels_count: 'パネル数',
      variables_count: '変数数',
      tags: 'タグ',
    },
  },
  empty: {
    greeting_prefix: 'こんにちは、私は',
  },
};

export default ja_JP;
