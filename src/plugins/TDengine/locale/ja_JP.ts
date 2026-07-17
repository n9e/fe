const ja_JP = {
  preview: 'データプレビュー',
  query: {
    title: 'クエリ統計',
    execute: 'クエリ',
    project: 'プロジェクト',
    project_msg: 'プロジェクトを選択してください',
    project_tip: `
      <1>プロジェクトはログサービスのリソース管理単位であり、マルチユーザーの分離とアクセス制御の主要な境界です。詳細については、<1>
      <2>プロジェクト</2>
    `,
    logstore: 'ログストア',
    logstore_msg: 'ログストアを選択してください',
    logstore_tip: `
      <1>ログストアはログサービスにおけるログデータの収集、保存、クエリの単位です。詳細については、<1>
      <2>ログストア</2>
    `,
    range: 'クエリ範囲',
    power_sql: 'SQL強化',
    query: 'クエリ条件',
    query_msg: 'クエリ条件を入力してください',
    query_tip1: 'TDengine クエリ構文については、以下を参照してください',
    query_tip2: '公式ドキュメント',
    sqlTemplates: 'クエリテンプレート',
    sqlTemplates_tip: '以下の SQL クエリ条件は参考用です。実際に使用する際は、$変数 を実際の値に置き換える必要があります',
    mode: {
      timeSeries: '時系列値',
      raw: 'ログ原文',
    },
    advancedSettings: {
      title: '高度な設定',
      metricKey_label: 'メトリック名フィールド',
      metricKey_tip:
        'このフィールドで、どのフィールドを metricName として使用するかを指定できます。デフォルトでは数値型のフィールドが metricName として使用されます。例えば、クエリ結果が used_percent:96 host:host01 の場合、used_percent が metricName、96 が値になります',
      tags_placeholder: '複数入力可能',
      labelKey_label: 'ラベルフィールド',
      labelKey_tip:
        'このフィールドで、どのフィールドを labelName として使用するかを指定できます。デフォルトでは非数値型のフィールドが labelName として使用されます。例えば、クエリ結果が used_percent:96 host:host01 の場合、host が label の name、host01 が label の値になります',
      timeKey_tip: 'どのフィールドが時間フィールドであるかを指定し、曲線グラフのX軸座標として使用します',
      timeFormat_tip: '時間のフォーマット。このフォーマットに基づいて時間をタイムスタンプに変換します',
    },
    schema: 'メタ情報',
    table: 'テーブル',
    stable: 'スーパーテーブル',
  },
  trigger: {
    title: 'アラート条件',
    value_msg: '式の値を入力してください',
  },
};
export default ja_JP;
