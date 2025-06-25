const ja_JP = {
  es: {
    ref: '名前',
    index: 'インデックス',
    index_tip:
      '\n      複数の設定方法をサポート\n      <1 />\n      1. 単一のインデックス gb を指定すると、すべてのドキュメントを gb インデックスで検索します\n      <1 />\n      2. 複数のインデックス gb,us を指定すると、すべてのドキュメントを gb および us インデックスで検索します\n      <1 />\n      3. インデックス接頭辞 g*,u* を指定すると、g または u で始まるすべてのインデックスでドキュメントを検索します\n      <1 />\n      ',
    index_msg: 'インデックスは空にできません',
    indexPatterns: 'インデックスパターン',
    indexPattern_msg: 'インデックスパターンは空にできません',
    indexPatterns_manage: 'インデックスパターンの管理',
    filter: 'フィルタ条件',
    time_label: '時間の粒度',
    date_field: '日付フィールド',
    date_field_msg: '日付フィールドは空にできません',
    interval: '時間間隔',
    value: '値の抽出',
    func: '関数',
    funcField: 'フィールド名',
    terms: {
      label: '指定フィールドによるグループ化',
      more: '高度な設定',
      size: '一致数',
      min_value: 'ドキュメントの最小値',
    },
    raw: {
      limit: 'ログ数',
      date_format: '日付フォーマット',
      date_format_tip: 'Moment.jsのフォーマットパターンを使用します。例：YYYY-MM-DD HH:mm:ss.SSS',
    },
    alert: {
      query: {
        title: 'クエリ統計',
        preview: 'データプレビュー',
      },
      trigger: {
        title: 'アラート条件',
        builder: 'シンプルモード',
        code: '式モード',
        label: '関連ラベル',
      },
      prom_eval_interval_tip: '毎 {{num}} 秒、バックエンドストレージをクエリします',
      prom_for_duration_tip:
        '通常、持続時間は実行頻度よりも長く、持続時間内に実行頻度でクエリを複数回実行し、すべてのクエリでアラート条件が満たされた場合にのみアラートを生成します。持続時間を0に設定すると、1回のクエリでアラート条件が満たされた場合にのみアラートを生成します',
      advancedSettings: '高度な設定',
      delay: '遅延実行',
    },
    event: {
      groupBy: '{{field}}によるグループ化、一致数 {{size}}, ドキュメントの最小値 {{min_value}}',
      logs: {
        title: 'ログの詳細',
        size: '結果数',
        fields: 'フィルタフィールド',
        jsonParseError: '解析に失敗しました',
      },
    },
    syntaxOptions: '構文オプション',
    queryFailed: 'クエリに失敗しました。後で再試行してください',
    offset_tip: '指定した時間範囲の前のデータをクエリするために使用されます。PromQLのoffsetに似ており、単位は秒です。',
  },
  datasource: {
    max_query_rows: '単一リクエストで取得可能な最大行数',
    max_idle_conns: '最大アイドル接続数',
    max_open_conns: '最大オープン接続数',
    conn_max_lifetime: '接続の最大寿命 （単位：秒）',
    timeout: 'タイムアウト時間 （単位：秒）',
    timeout_ms: 'タイムアウト時間 （単位：ミリ秒）',
  },
  query: {
    title: 'クエリ統計',
    execute: 'クエリ',
    query: 'クエリ条件',
    query_required: 'クエリ条件は空にできません',
    query_placeholder: 'SQLを入力してクエリを実行します。Shift+Enterで改行します',
    query_placeholder2: 'Shift+Enterで改行します',
    advancedSettings: {
      title: '高度な設定',
      tags_placeholder: '複数入力可能',
      valueKey: '値フィールド',
      valueKey_tip: 'SQLクエリの結果には通常複数の列が含まれています。これらの列のうち、どの列の値をグラフに表示するかを指定できます',
      valueKey_required: '値フィールドは空にできません',
      labelKey: 'ラベルフィールド',
      labelKey_tip: 'SQLクエリの結果には通常複数の列が含まれています。これらの列のうち、どの列をグラフのラベル情報として使用するかを指定できます',
    },
  },
};

export default ja_JP;
