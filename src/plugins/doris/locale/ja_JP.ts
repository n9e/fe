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
      raw: '生データ',
      metric: '統計グラフ',
    },
    time_field: '時間フィールド',
    time_field_msg: '時間フィールドを入力してください',
    query_tip: 'SQL例：最近5分間のログ行数をクエリするには、SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)を使用します',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: 'クエリ',
    database: 'データベース',
    database_placeholder: 'デフォルトでは空のままにできます',
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
  },
};

export default ja_JP;
