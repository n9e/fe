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
  },
};

export default ja_JP;
