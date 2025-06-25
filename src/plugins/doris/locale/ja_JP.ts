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
    sql_msg: 'SQLステートメントを入力してください',
    execute: 'クエリ',
    database: 'データベース',
    advancedSettings: {
      title: '詳細設定',
      valueKey: '値フィールド',
      valueKey_tip: 'SQLクエリの結果には通常、複数の列が含まれています。どの列の値をグラフに表示するかを指定できます',
      valueKey_required: '値フィールドは空にできません',
      labelKey: 'ラベルフィールド',
      labelKey_tip: 'SQLクエリの結果には通常、複数の列が含まれています。どの列を曲線のラベルメタデータとして使用するかを指定できます',
    },
  },
};

export default ja_JP;
