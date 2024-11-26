const ja_JP = {
  title: '即時クエリ',
  add_btn: 'クエリパネルを追加',
  query_btn: 'クエリ実行',
  query_tab: 'クエリ',
  addPanel: 'パネルを追加',
  log: {
    search_placeholder: '検索フィールド',
    available: '選択可能フィールド',
    selected: '選択済みフィールド',
    interval: '間隔',
    mode: {
      indexPatterns: 'インデックスパターン',
      indices: 'インデックス',
    },
    hideChart: 'チャートを非表示',
    showChart: 'チャートを表示',
    fieldValues_topn: 'トップ5の値',
    fieldValues_topnNoData: 'このフィールドはマッピングに存在しますが、表示される500ドキュメントに存在しません',
    copyToClipboard: 'クリップボードにコピー',
    show_conext: 'コンテキストを表示',
    context: 'ログコンテキスト',
    limit: '結果数',
    sort: {
      NEWEST_FIRST: '最新のものから',
      OLDEST_FIRST: '最古のものから',
    },
    download: 'ログをダウンロード',
    export: 'レコードをエクスポート',
    log_download: {
      title: 'ダウンロード',
      download_title: 'ログデータをダウンロード',
      range: '時間範囲',
      filter: '検索語句',
      format: 'データ形式',
      time_sort: 'ログの並べ替え',
      count: 'ログの数',
      time_sort_desc: '時間降順',
      time_sort_asc: '時間昇順',
      all: '全て',
      custom: 'カスタム',
      custom_validated: '数は1-65535の間でなければなりません',
      all_quantity: '合計約',
      createSuccess: 'タスク作成成功',
    },
    log_export: {
      title: 'レコードをエクスポート（オンラインエクスポートファイルは3日間保持）',
      fileName: 'ファイル名',
      create_time: '作成時間',
      describe: 'ファイル説明',
      status: '状態',
      status0: '待機中',
      status1: '生成済み',
      status2: 'ファイルが期限切れ',
      operation: '操作',
      delSuccess: 'タスクが削除されました',
      del_btn_tips: '削除してよろしいですか？',
      del_btn: '削除',
      emptyText: 'エクスポートレコードが見つかりません。ログクエリを実行し、ダウンロードをクリックしてください。',
    },
  },
  historicalRecords: {
    button: '歴史レコード',
    searchPlaceholder: '歴史レコードを検索',
  },
  help: 'データソースヘルプを表示',
  share_tip: 'クリックして共有リンクをコピー',
  share_tip_2: 'クリックして共有リンクをコピー、現在はログの元のクエリのみを共有できます',
};

export default ja_JP;
