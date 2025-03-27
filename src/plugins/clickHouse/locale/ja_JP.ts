const ja_JP = {
  preview: "データプレビュー",
  query: {
    title: "クエリ統計",
    execute: "クエリ",
    sql_msg: "SQLを入力してください",
    sql_tip:
      "SQL：データをクエリするSQL文。例：select count() AS cnt, event_time, type from system.query_log GROUP BY type, event_time",
    time_field: "時間フィールド",
    time_field_tip_timeSeries:
      "SQLで時間を表すフィールド。このフィールドはデータのクエリ範囲と時系列データの時間として使用されます",
    time_field_tip_raw:
      "SQLで時間を表すフィールド。このフィールドはデータのクエリ範囲と時系列データの時間として使用されます。空の場合は、SQLでクエリ範囲を自分で処理する必要があります。全体のデータ量が大きくなり、システムが異常終了する可能性があるため、避けてください",
    time_field_msg: "時間フィールドを入力してください",
    time_format: "時間フォーマット",
    epoch_second: "秒単位のタイムスタンプ",
    epoch_millis: "ミリ秒単位のタイムスタンプ",
    range: "クエリ範囲",
    mode: {
      timeSeries: "時系列値",
      raw: "ログ原文",
    },
    sql_preview: "SQLプレビュー",
    advancedSettings: {
      title: "高度な設定",
      valueKey_tip:
        "このフィールドを使用して、返された結果から値を抽出します。例えば、クエリ条件が `select count() AS cnt, event_time from system.query_log ` 結果が cnt:11 の場合、ValueKey に cnt を書いた場合、cnt:11 から 11 を抽出し、クエリ結果とアラート判定の値として使用します",
      valuekey_msg: "valueKeyを入力してください",
      labelKey_tip:
        "このフィールドとその対応する値を、タグとして監視データのラベルに追加します。例えば、クエリ条件が `select count() cnt, event_time, type from system.query_log GROUP BY type, event_time` 結果が `[{cnt:11 type:QueryFinish},{cnt:10 type:QueryStart}]`, LabelKey に type を書いた場合、返されたデータの中で type が時系列データのラベルとして使用されます",
      labelKey_placeholder: "複数入力可能",
    },
    dashboard: {
      mode: {
        label: "クエリモード",
        table: "非時系列データ",
        timeSeries: "時系列データ",
      },
      time: "時間選択",
      timeTip:
        "クエリ範囲を指定できます。デフォルトはダッシュボードの全体時間範囲です",
    },
  },
};

export default ja_JP;
