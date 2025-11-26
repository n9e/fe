const ja_JP = {
  title: '通知ルール',
  basic_configuration: '基本設定',
  user_group_ids: '権限のあるチーム',
  user_group_ids_tip: 'ここに記入されたチームのユーザーは、この通知ルールを管理または表示する権限があります',
  enabled_tip: 'このアラーム通知ルールを有効にするかどうか。有効にすると、このルールに一致するアラームイベントは、通知設定に従って通知されます',
  note_tip: '将来のメンテナンスのために、この通知ルールの詳細情報や説明を補足できます',
  notification_configuration: {
    title: '通知設定',
    add_btn: '通知設定を追加',
    channel: '通知チャネル',
    channel_tip: 'アラームイベント通知を送信するために使用する方法を選択します。既存の方法が要件を満たさない場合は、管理者に連絡して新しい構成を作成できます',
    channel_msg: '通知メディアを選択してください',
    template: '通知テンプレート',
    template_tip: '通知内容のテンプレート、異なるシナリオに応じて異なるテンプレートを使用できます',
    template_msg: 'メッセージテンプレートを選択してください',
    severities: '適用レベル',
    severities_tip:
      '通知するアラームイベントのレベルを選択します。チェックされたレベルのみが通知されます。3つのレベルのいずれもチェックされていない場合、この通知設定はアラームイベントに一致せず、この通知設定は無効になります',
    time_ranges: '適用時間帯',
    time_ranges_tip:
      '時間次元でアラームイベントをフィルタリングし、アラームイベントが生成される時間帯を設定し、アラームイベントはこの通知設定で有効になります。記載されていない場合、時間帯によるフィルタリングは行われません',
    effective_time_start: '開始時間',
    effective_time_end: '終了時間',
    effective_time_week_msg: '有効な週を選択してください',
    effective_time_start_msg: '開始時間を選択してください',
    effective_time_end_msg: '終了時間を選択してください',
    fetch_integration_key_failed_remove: '以下の PagerDuty キーの取得に失敗しました：{list}。再選択するには、もう一度クリックしてみてください',
    label_keys: '適用タグ',
    label_keys_tip:
      'タグ次元でアラームイベントをフィルタリングし、この通知設定を通過するイベントに含まれるタグを設定します。記載されていない場合、タグによるフィルタリングは行われません',
    attributes: '適用属性',
    attributes_value: '属性値',
    attributes_tip:
      'イベント属性次元でアラームイベントをフィルタリングし、この通知設定を通過するイベントに含まれる属性を設定します。記載されていない場合、属性によるフィルタリングは行われません',
    attributes_options: {
      group_name: 'ビジネスグループ',
      cluster: 'クラスタ',
      is_recovered: '回復イベントかどうか？',
      rule_id: 'アラームルール',
      severity: 'アラームレベル',
      target_group: 'ホストビジネスグループ',
    },
    run_test_btn: 'テストを実行',
    run_test_btn_tip: 'すでに発生したイベントをいくつか選択して、この通知設定が正しいかどうかをテストできます。正しい場合、関連する通知メッセージを受信するはずです',
    run_test_request_result: 'テスト通知が送信されました。通知対象は以下のように応答しました：',
    user_info: {
      user_ids: '受信者',
      user_group_ids: '受信チーム',
      error: '受信者と受信チームを同時に空にすることはできません',
    },
    flashduty: {
      ids: '協力スペース',
    },
    pagerduty: {
      services: 'サービス/統合',
    },
  },
  user_group_id_invalid_tip: '権限のあるチームが存在しません',
  channel_invalid_tip: '通知メディアが存在しません',
  pipeline_configuration: {
    title: 'イベント処理',
    name_placeholder: 'イベント処理を選択してください',
    name_required: 'イベント処理は空にできません',
    add_btn: '新しいイベント処理を追加',
    disable: '無効化',
    enable: '有効化',
  },
  escalations: {
    title: 'エスカレーション設定',
    title_tip:
      'アラートが設定した期間を超え、まだ回復していない場合、システムは以下の条件に従って通知を指定チャネルにエスカレーションし、長期間誰もフォローしない状況を避けます。詳細な設定については <a>使用文書</a> を参照してください',
    item_title: '通知エスカレーション',
    item_add_btn: '通知エスカレーションを追加',
    interval: '検出周期',
    interval_required: '検出周期は空にできません',
    duration_required: '持続時間は空にできません',
    duration_1: '異常イベントが既に',
    duration_2: 'を超過し、まだ',
    duration_3: '状態にある時、この設定を使用して通知を送信します。',
    repeating_notification: '繰り返し通知設定',
    repeating_notification_tip: 'このスイッチがオフの場合、同じイベントのエスカレーション通知は1回のみ通知されます',
    repeating_notification_1: '毎',
    repeating_notification_2: '分ごとに1回通知し、最大で',
    repeating_notification_3: '回繰り返し通知します',
    notification_interval_required: '通知間隔は空にできません',
    notification_max_times_required: '繰り返し通知の最大回数は空にできません',
    event_status_options: {
      0: '未回復',
      1: '未回復かつ未対応',
    },
    time_ranges: {
      label_tip: 'チェックした曜日と時間帯でのみエスカレーションをトリガーするよう制限できます。設定なしは制限なしを意味します',
    },
    labels_filter: {
      label_tip:
        'これらのラベル条件を満たすアラートイベントのみエスカレーション通知を実行します。影響範囲を狭めるために使用します。設定なしは制限なしを意味します。既存のラベルキーのドロップダウン選択（推奨）または手動入力をサポートします',
    },
    attributes_filter: {
      label_tip: 'これらの属性に同時に一致するアラートのみエスカレーションを有効にします；設定なしは制限なしを意味します。複数の条件はAND関係です',
    },
  },
  notify_aggr_configs: {
    title: '集約設定',
    enable: '集約を有効化',
    group_enable: '細粒度集約',
    group_title: '細粒度集約',
    group_add_btn: '細粒度集約を追加',
    group_tip1: '以下の条件を満たす',
    group_tip2: '以下の次元に従って一つのグループに集約して通知',
    group_label_keys: 'ラベル',
    group_label_keys_required: 'ラベルは空にできません',
    group_attribute_keys: '属性',
    group_attribute_keys_required: '属性は空にできません',
    group_keys_at_least_one_required: 'ラベルと属性のうち少なくとも一つは入力が必要です',
    group_duration_1: 'アラートを受信した後、',
    group_duration_2: '秒以内に受信した同グループのアラートを一緒に集約して送信',
    group_duration_required: '集約持続時間は空にできません',
    default_title: 'デフォルト次元',
    default_tip: '上記のフィルタリング条件を満たさない場合、<b>以下の次元に従って一つのグループに集約して通知</b>',
    default_duration_tip: '注意：集約時間間隔が大きすぎるとアラートの送信遅延を引き起こします',
    default_duration_tip2: '集約最大間隔は3600秒を超えることはできません',
    attribute_keys_map: {
      cluster: 'データソース',
      group_name: 'ビジネスグループ',
      rule_id: 'アラートルール',
      severity: 'アラートレベル',
    },
    enable_tip: '有効化後、ルールに合致するアラートは次元別に一つの通知に統合されます <a>使用文書</a>',
    labels_filter: {
      label_tip:
        'これらのラベル条件を満たすアラートイベントのみ集約通知を実行します。影響範囲を狭めるために使用します。設定なしは制限なしを意味します。既存のラベルキーのドロップダウン選択（推奨）または手動入力をサポートします',
    },
    attributes_filter: {
      label_tip:
        'これらのラベルフィルタリング条件に一致するアラートのみ集約に参加させ、一致しないアラートはこのルールの影響を受けません<br />複数の条件はAND関係であり、下記の適用属性フィルタリング条件ともAND関係です',
    },
    label_keys: {
      tip: 'identとして設定した場合、同じidentのイベントが一つのグループに統合され、一つの通知メッセージが送信されます。SMS/IMノイズ削減によく使用されます',
      placeholder: '例：ident、app。既存のラベルキーのドロップダウン選択（推奨）または手動入力をサポートします',
    },
    attribute_keys: {
      tip: 'ビジネスグループとして設定した場合、同じビジネスグループのイベントが一つのグループに統合され、一つの通知メッセージが送信されます',
      placeholder: '例：ビジネスグループ',
    },
  },
  statistics: {
    total_notify_events: '過去 {{days}} 日間の通知イベントの総数',
    total_notify_events_tip: '実際に送信された通知の回数を集計します。<b>収束、抑制、ブロック</b>されたイベントはカウントされません',
    escalation_events: '過去 {{days}} 日間のエスカレーションイベント数',
    escalation_events_tip:
      'エスカレーションルールを満たし、優先度が昇格されたイベントの数。数が多いほど、処理サイクルが長くなることを意味し、<b>応答SLA/エスカレーションしきい値/アラートノイズ削減戦略</b>を最適化する必要があります',
    noise_reduction_ratio: '過去 {{days}} 日間のノイズ削減率',
    noise_reduction_ratio_tip:
      'ノイズ削減率 = <b>(1 − 実際に送信された通知の数 ÷ 元のアラートイベントの数) × 100%</b>。値が<b>100%</b>に近いほど、<b>ノイズ削減効果</b>が高くなります',
  },
  tabs: {
    events: 'イベントリスト',
    rules: 'アラームルール',
    sub_rules: 'サブスクリプションルール',
  },
};

export default ja_JP;
