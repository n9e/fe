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
    },
    run_test_btn: 'テストを実行',
    run_test_btn_tip: 'すでに発生したイベントをいくつか選択して、この通知設定が正しいかどうかをテストできます。正しい場合、関連する通知メッセージを受信するはずです',
    run_test_request_result: 'テスト結果を送信',
    user_info: {
      user_ids: '受信者',
      user_group_ids: '受信チーム',
      error: '受信者と受信チームを同時に空にすることはできません',
    },
    flashduty: {
      ids: '協力スペース',
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
    item_title: '通知エスカレーション',
    item_add_btn: '通知エスカレーションを追加',
    interval: '検出間隔',
    interval_required: '検出間隔は必須です',
    duration_required: '継続時間は必須です',
    duration_1: '異常イベントが',
    duration_2: 'を超えた場合、未回復/未承認の状態が続く場合、この設定を使用して通知を送信します。',
  },
};

export default ja_JP;
