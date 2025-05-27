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
  event_name: 'イベント',
  first_trigger_time: '初回トリガ時間',
  trigger_time: 'トリガ時間',
  shield: 'シールド',
  prod: '監視タイプ',
  duration: '持続時間',
  aggregate_rule: '集計ルール',
  aggregate_rule_mgs: '集計ルールを選択してください',
  aggregate_rule_tip: `イベントの属性とタグに基づいてアラートを集計して分類し、表示を簡素化します。Go Templateを使用してイベントフィールドを参照します。例：
  
- ビジネスグループ+イベントレベルで集計：\`Group:{{.GroupName}} Severity:{{.Severity}}\`
- アラートルールのタイトルで集計：\`{{.RuleName}}\`
- イベントのインスタンスタグで集計：\`{{.TagsMap.instance}}\``,
  aggr_result: '集計結果',
  aggregate_rule_name: 'ルール名',
  aggregate_rule_title: '集計カードタイトル',
  add_rule: 'ルールを追加',
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
  search: 'データソースを検索',
  delete_confirm: {
    title: 'アラートイベントを削除',
    content:
      '通常、監視データが永久に報告されなくなる場合（例えば監視データのタグを変更したり、機器をオフラインにしたり）にのみアラートイベントを削除してください。これらのアラートイベントは自動的に復元できません。本当に削除してよろしいですか？',
  },
  my_groups: '私のビジネスグループ',
  all_groups: 'すべてのビジネスグループ',
  datasources: 'データソース',
  detail_title: 'アラート詳細',
};

export default ja_JP;
