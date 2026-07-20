const ja_JP = {
  preview: 'データプレビュー',
  query: {
    title: 'クエリ統計',
    execute: 'クエリ',
    range: 'クエリ範囲',
    power_sql: 'SQL強化',
    query: 'クエリ条件',
    query_msg: 'クエリ条件を入力してください',
    query_tip1: 'IoTDB クエリ構文については、以下を参照してください',
    query_tip2: '公式ドキュメント',
    sqlTemplates: 'クエリテンプレート',
    sqlTemplates_tip: '以下の SQL クエリ条件は参考用です。実際に使用する際は、$変数 を実際の値に置き換える必要があります',
    sqlTemplates_load_failed: 'クエリテンプレートの読み込みに失敗しました',
    previewFailed: 'データプレビューに失敗しました',
    loadSchemaFailed: 'メタ情報の読み込みに失敗しました',
    mode: {
      timeSeries: '時系列値',
      raw: 'ログ原文',
    },
    advancedSettings: {
      title: '高度な設定',
      metricKey_label: 'メトリック名フィールド',
      metricKey_tip: 'このフィールドで、どのフィールドを metricName として使用するかを指定できます。',
      tags_placeholder: '複数入力可能',
      labelKey_label: 'ラベルフィールド',
      labelKey_tip: 'このフィールドで、どのフィールドを labelName として使用するかを指定できます。',
      timeKey_label: '時間フィールド',
      timeKey_tip: 'どのフィールドが時間フィールドであるかを指定し、曲線グラフのX軸座標として使用します',
      timeFormat_tip: '時間のフォーマット。このフォーマットに基づいて時間をタイムスタンプに変換します',
    },
    schema: 'メタ情報',
    table: 'テーブル',
  },
  trigger: {
    title: 'アラート条件',
    value_msg: '式の値を入力してください',
  },
};

export default ja_JP;
