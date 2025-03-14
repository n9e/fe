const ja_JP = {
  title: 'アクティブアラート',
  search_placeholder: 'ルールとタグを模糊検索（複数のキーワードはスペースで区切ってください）',
  hours: {
    '6': '最近 6 時間',
    '12': '最近 12 時間',
    '24': '最近 1 日',
    '48': '最近 2 日',
    '72': '最近 3 日',
    '168': '最近 7 日',
    '336': '最近 14 日',
    '720': '最近 30 日',
    '1440': '最近 60 日',
    '2160': '最近 90 日',
  },
  severity: 'アラートレベル',
  eventType: 'イベントカテゴリ',
  rule_name: 'ルールタイトル&イベントタグ',
  first_trigger_time: '初回トリガ時間',
  trigger_time: 'トリガ時間',
  shield: 'シールド',
  prod: '監視タイプ',
  aggregate_rule: '集計ルール',
  aggregate_rule_name: 'ルール名',
  public: '公開',
  isPublic: '公開するかどうか',
  status: '認領状態',
  status_1: '認領済み',
  status_0: '未認領',
  batch_btn: 'バッチ操作',
  batch_claim: 'バッチ認領',
  batch_unclaim: 'バッチ認領解除',
  claim: '認領',
  unclaim: '認領解除',
  claimant: '認領者',
  delete_confirm: {
    title: 'アラートイベントを削除',
    content:
      '通常、監視データが永久に報告されなくなる場合（例えば監視データのタグを変更したり、機器をオフラインにしたり）にのみアラートイベントを削除してください。これらのアラートイベントは自動的に復元できません。本当に削除してよろしいですか？',
  },
  detail: {
    title: 'アラート詳細',
    card_title: 'アラートイベント詳細',
    buisness_not_exist: 'このビジネスグループは削除されたか、またはビューの権限がありません',
    rule_name: 'ルールタイトル',
    group_name: 'ビジネスグループ',
    rule_note: 'ルール備考',
    cate: 'データソースタイプ',
    datasource_id: 'データソース',
    severity: 'アラートレベル',
    is_recovered: 'イベント状態',
    tags: 'イベントタグ',
    target_note: 'オブジェクト備考',
    trigger_time: 'トリガ時間',
    first_trigger_time: '初回トリガ時間',
    last_eval_time: '本次検出時間',
    trigger_value: '前回異常トリガ時値',
    trigger_value2: 'トリガ時値',
    recover_time: '復元時間',
    rule_algo: 'アラート方法',
    rule_algo_anomaly: 'スマートアラート',
    rule_algo_threshold: '閾値アラート',
    prom_eval_interval: '実行頻度',
    prom_for_duration: '持続時間',
    notify_channels: '通知チャネル',
    notify_groups_obj: 'アラート受信グループ',
    callbacks: 'コールバックアドレス',
    runbook_url: 'ルンブックリンク',
    detail_url: '詳細リンク',
    host: {
      trigger: 'トリガ',
    },
    trigger: 'トリガ',
    firemap_ql_label: 'カード',
    northstar_ql_label: '指標',
    event_notify_records: {
      label: '通知レコード',
      view: '詳細を見る',
      result_title: '通知結果',
      alert_rule_notify_records: 'アラートルール通知',
      subscription_rule_notify_records: 'サブスクリプションルール通知',
      channel: '通知チャネル',
      username: '通知対象',
      target: '通知ターゲット',
      status: '通知状態',
      detail: '結果詳細',
      sub_id: 'ルールID',
      notify_rule_id: '通知ルール ID',
    },
    task_tpls: {
      label: '自動回復テンプレート',
    },
  },
};

export default ja_JP;
