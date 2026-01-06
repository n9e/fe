const ja_JP = {
  quick_query: 'クイッククエリ',
  quick_query_tip:
    'クイッククエリ 固定のSQLテンプレートに基づいて、クエリステートメントを迅速に生成します。たとえば、フィールドAが0より大きい場合、A>0と入力するだけです。このボタンをクリックすると、クイックモードに迅速に切り替えて、SQLステートメントを表示および変更できます',
  custom_query: 'カスタムクエリ',
  custom_query_tip: 'カスタムクエリ SQL構文に基づいて自由にクエリステートメントを入力できます',
  current_database: 'データベース',
  table: 'テーブル',
  database_table_required: 'データベースとテーブルを選択してください',
  query: {
    mode: {
      query: 'Query モード',
      sql: 'SQL モード',
    },
    submode: {
      raw: 'ログ原文',
      timeSeries: '時系列',
    },
    query_tip:
      'SQL例：最近5分間のログ行数をクエリするには、SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)を使用します。<br />詳細なSQLモードの説明については、<a>Doris SQLモードの説明</a>を参照してください。',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: 'クエリ',
    database: 'データベース',
    database_msg: 'データベースを選択してください',
    table: 'テーブル',
    table_msg: 'テーブルを選択してください',
    time_field: '日付フィールド',
    time_field_msg: '日付フィールドを選択してください',
    time_field_tip: '<span>このタイムピッカーをリンクするには、クエリ条件で時間マクロを使用する必要があります</span><br/>時間マクロの使用方法の紹介: <a>詳細</a>',
    query: 'クエリ',
    query_required: 'クエリは必須です',
    advancedSettings: {
      title: '高度な設定',
      valueKey_tip:
        'このフィールドを使用して、返された結果から値を抽出します。例えば、クエリ条件が `select count() AS cnt, event_time from system.query_log ` 結果が cnt:11 の場合、ValueKey に cnt を書いた場合、cnt:11 から 11 を抽出し、クエリ結果とアラート判定の値として使用します',
      valuekey_msg: 'valueKeyを入力してください',
      labelKey_tip:
        'このフィールドとその対応する値を、タグとして監視データのラベルに追加します。例えば、クエリ条件が `select count() cnt, event_time, type from system.query_log GROUP BY type, event_time` 結果が `[{cnt:11 type:QueryFinish},{cnt:10 type:QueryStart}]`, LabelKey に type を書いた場合、返されたデータの中で type が時系列データのラベルとして使用されます',
      labelKey_placeholder: '複数入力可能',
    },
    get_index_fail: 'データテーブルのインデックス取得に失敗しました',
    warn_message_btn_1: 'クエリの送信を続行',
    warn_message_btn_2: '修正に戻る',
    warn_message: 'クエリ条件に時間マクロが含まれていないため、選択した時間範囲は有効になりません！',
    warn_message_content_1:
      'このクエリ条件は全表スキャンを引き起こす可能性があります。ストレージパフォーマンスへの影響を自己評価し、クエリの送信を続行するか、修正に戻って時間マクロを追加するかを決定してください。',
    warn_message_content_2: '一般的な時間マクロ: ',
    warn_message_content_3: '例：',
    warn_message_content_4: '時間マクロの使用方法: <a>詳細</a>',
    dashboard: {
      mode: {
        label: 'クエリモード',
        table: '非時系列データ',
        timeSeries: '時系列データ',
      },
    },
    stackByField: 'フィールドで積み上げ',
    stack_disabled_tip: 'ユニークな値の数が1または10を超える場合、積み上げグラフはサポートされていません',
    stack_tip_pin: '積み上げグラフを有効にする',
    stack_tip_unpin: '積み上げグラフを無効にする',
    stack_group_by_tip: 'このフィールド値で積み上げ傾向グラフを表示する',
    sql_format: 'SQLフォーマット',
    defaultSearchField: 'デフォルトの検索フィールド',
    default_search_tip_1: 'デフォルトの検索フィールドとして設定',
    default_search_tip_2: 'デフォルトの検索フィールドをキャンセル',
    default_search_by_tip: 'デフォルトの検索フィールド',
    interval: 'クエリ間隔',
    interval_tip:
      'SQLで$__timeFilter時間マクロを使用する場合にのみ、クエリ間隔の構成が有効になります。<br />アラートシステムは、この時間ウィンドウに基づいてデータスキャン範囲を制限し、アラートの即時性とデータベースのパフォーマンスを保証します',
    offset: 'オフセット',
    offset_tip:
      '現在のクエリ時間に基づいて、指定された秒数を前方にオフセットしてからクエリを実行します。これはPromQLのoffsetに似ています。<br />データ書き込みの遅延、リンクの遅延などのシナリオを処理するために一般的に使用され、データがタイムリーに到達しないことによるアラートの誤報を回避します',
    sql_warning_1:
      'WHERE条件で$__timeFilter(時間フィールド)を使用して時間範囲を明示的に制限することを強くお勧めします。そうしないと、<b>データベースの負荷異常、アラートクエリのタイムアウト</b>などの問題が発生する可能性があります',
    sql_warning_2: 'SQLは$__timeGroupを使用しており、このクエリは複数の時間ポイントのデータを返します。このシナリオでは、<b>システムは最新の時間ポイントの結果のみを使用します</b>',
    duration: '所要時間',
    count: '件数',
  },
};

export default ja_JP;
