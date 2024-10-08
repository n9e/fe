const ja_JP = {
  title: "履歴アラート",
  rule_name: "ルールタイトル＆イベントラベル",
  search_placeholder:
    "ルールとラベルを模糊検索（複数のキーワードはスペースで区切ってください）",
  first_trigger_time: "初回トリガ時間",
  trigger_time: "トリガ時間",
  last_eval_time: "検出時間",
  hours: {
    "6": "最近6時間",
    "12": "最近12時間",
    "24": "最近1日",
    "48": "最近2日",
    "72": "最近3日",
    "168": "最近7日",
    "336": "最近14日",
    "720": "最近30日",
    "1440": "最近60日",
    "2160": "最近90日",
  },
  severity: "アラートレベル",
  eventType: "イベントカテゴリ",
  export: "エクスポート",
  export_failed: "エクスポートに失敗しました",
  prod: "監視タイプ",
  rule_prod: {
    firemap: "消火図",
    northstar: "北極星",
    metric: "メトリクス",
    host: "ホスト",
    logging: "ログ",
    anomaly: "異常",
    loki: "Loki",
  },
};

export default ja_JP;
