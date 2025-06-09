const ja_JP = {
  preview: 'データプレビュー',
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
    schema: 'メタ情報',
    document: '使用文書',
    dashboard: {
      mode: {
        label: 'クエリモード',
        table: '非時系列データ',
        timeSeries: '時系列データ',
      },
    },
    historicalRecords: {
      button: '履歴記録',
      searchPlaceholder: '履歴記録を検索',
    },
    compass_btn_tip: 'テーブルデータを表示するにはクリック',
  },
  trigger: {
    title: 'アラート条件',
    value_msg: '式の値を入力してください',
  },
  datasource: {
    shards: {
      title: 'データソースの基本情報',
      title_tip:
        'データベースへの接続が可能かどうかは、DBAが対応するDBユーザーに権限を与えたかどうかに依存します。接続できない場合は、後続の設定を続行してから、後で検証してください。',
      addr: 'データベースアドレス',
      addr_tip: 'データベースアドレスは一意である必要があります',
      user: 'ユーザー名',
      password: 'パスワード',
      help: '説明：アカウントは対応するデータベースに読み取り権限を持っている必要があります。他のアカウントに変更する場合は、できるだけ読み取り専用アカウントを使用してください。',
    },
    max_query_rows: '単一リクエストで取得可能な最大行数',
    max_idle_conns: '最大アイドル接続数',
    max_open_conns: '最大オープン接続数',
    conn_max_lifetime: '接続の最大寿命 （単位：秒）',
    timeout: 'タイムアウト時間 （単位：秒）',
  },
};

export default ja_JP;
