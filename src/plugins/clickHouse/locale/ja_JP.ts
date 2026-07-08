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
      valueKey_tip:
        'このフィールドを使用して、返された結果から値を抽出します。例えば、クエリ条件が `select count() AS cnt, event_time from system.query_log ` 結果が cnt:11 の場合、ValueKey に cnt を書いた場合、cnt:11 から 11 を抽出し、クエリ結果とアラート判定の値として使用します',
      valueKey_required: '値フィールドは空にできません',
      labelKey: 'ラベルフィールド',
      labelKey_tip:
        'このフィールドとその対応する値を、タグとして監視データのラベルに追加します。例えば、クエリ条件が `select count() cnt, event_time, type from system.query_log GROUP BY type, event_time` 結果が `[{cnt:11 type:QueryFinish},{cnt:10 type:QueryStart}]`, LabelKey に type を書いた場合、返されたデータの中で type が時系列データのラベルとして使用されます',
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
    title: 'トリガー',
    value_msg: '式の値を入力してください',
  },
};

export default ja_JP;
