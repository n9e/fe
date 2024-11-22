const ja_JP = {
  title: 'サブスクライブルール',
  search_placeholder: 'サブスクライブ名、サブスクライブのルール、サブスクライブのタグ、アラート受信グループを検索',
  rule_name: 'サブスクライブのルール',
  sub_rule_name: 'サブスクライブアラートルール',
  sub_rule_selected: '選択されたルール',
  tags: 'サブスクライブのタグ',
  user_groups: 'アラート受信グループ',
  tag: {
    key: {
      label: 'サブスクライブイベントのタグキー',
      tip: 'ここでのタグは、アラートイベントのタグを指し、以下のタグマッチングルールでアラートイベントをフィルタリングします',
      required: 'タグキーは空にできません',
      placeholder: 'タグキーを入力してください',
    },
    func: {
      label: '演算子',
    },
    value: {
      label: 'タグ値',
      equal_placeholder: '値を入力してください',
      include_placeholder: '複数の値を入力できます。改行で区切ってください',
      regex_placeholder: '正規表現一致を入力してください',
      required: 'タグ値は空にできません',
    },
  },
  group: {
    key: {
      label: 'サブスクライブビジネスグループ',
      placeholder: 'ビジネスグループ',
    },
    func: {
      label: '演算子',
    },
    value: {
      label: '値',
      required: '値は空にできません',
    },
  },
  redefine_severity: 'アラートレベルを再定義',
  redefine_channels: '通知メディアを再定義',
  redefine_webhooks: 'コールバックアドレスを再定義',
  user_group_ids: 'サブスクライブアラート受信グループ',
  for_duration: 'サブスクライブイベントの持続時間が(秒)を超えた場合',
  for_duration_tip:
    '例えば、300を設定した場合、同じアラートイベントが最初にサブスクライブされた時にはマッチしないが、後で再びサブスクライブされた場合、そのイベントの発生時間と最初にサブスクライブされた発生時間の差が300秒を超えた場合、サブスクライブ条件を満たすことになり、関連する通知ロジックが実行されます。もし300秒未満であれば、サブスクライブにマッチしない。この機能は、アラートのエスカレーションとして使用できます。チームの責任者は、1時間（3600秒）を超えた持続時間のサブスクライブを設定し、受信者を自分自身に設定することで、必ず誰かがアラートをフォローすることを保証できます。',
  webhooks: '新しいコールバックアドレス',
  webhooks_msg: 'コールバックアドレスは空にできません',
  prod: '監視タイプ',
  subscribe_btn: 'サブスクライブ',
  basic_configs: '基本設定',
  severities: 'サブスクライブイベントのレベル',
  severities_msg: 'サブスクライブイベントのレベルは空にできません',
  tags_groups_require: 'タグと受信グループの少なくとも一方を入力してください',
  note: 'サブスクライブ名',
  filter_configs: 'フィルター設定',
  notify_configs: '通知設定',
  and: 'および',
};

export default ja_JP;
