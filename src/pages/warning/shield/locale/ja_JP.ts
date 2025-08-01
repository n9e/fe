const ja_JP = {
  title: 'スクリーンルール',
  search_placeholder: '検索ルールのタイトル、ラベル、ブロック理由',
  datasource_type: 'データソースタイプ',
  datasource_id: 'データソース',
  cause: 'スクリーンの理由',
  time: 'スクリーンの時間',
  note: 'ルールのタイトル',
  btime: 'スクリーンの開始時間',
  duration: 'スクリーンの持続時間',
  etime: 'スクリーンの終了時間',
  prod: '監視タイプ',
  severities: 'イベントのレベル',
  severities_msg: 'イベントのレベルは空にできません',
  mute_type: {
    '0': '固定時間',
    '1': '周期時間',
    label: 'スクリーンの時間タイプ',
    days_of_week: 'スクリーンの時間',
    start: '開始時間',
    start_msg: '開始時間は空にできません',
    end: '終了時間',
    end_msg: '終了時間は空にできません',
  },
  tag: {
    key: {
      label: 'イベントのタグ',
      tip: `ここでのタグはアラートイベントのタグを指し、以下のタグマッチングルールを通じてアラートイベントをフィルタリングします。複数のマッチング演算子がサポートされており、説明は以下の通りです：

- \`==\` 特定のタグ値をマッチングします。1つだけ入力できます。複数の値を同時にマッチングしたい場合は、\`in\` 演算子を使用する必要があります
- \`=~\` 正規表現を入力して、タグ値を柔軟にマッチングします
- \`in\` 複数のタグ値をマッチングします。SQLの \`in\` 演算子に類似しています
- \`not in\` タグ値をマッチングしません。複数の値を入力できます。SQLの \`not in\` 演算子に類似しており、複数のタグ値を除外するために使用されます
- \`!=\` 特定のタグ値を除外するために使用されます
- \`!~\` 正規表現にマッチしません。正規表現を入力し、この正規表現にマッチするタグ値は除外されます。PromQLの \`!~\` に類似しています`,
    },
  },
  basic_configs: '基本情報',
  filter_configs: 'フィルタリング設定',
  filter_configs_tip:
    'フィルタリング条件に一致するアラートイベントはスクリーンルールにマッチし、スクリーンされます。フィルタリング条件は本質的にアラートイベントのフィルタリングであり、イベントのデータソース、レベル、タグなどを通じて行われます',
  mute_configs: 'スクリーンの持続時間',
  alert_content: '会社の全てのアラートを誤ってスクリーンしないために、このスクリーンルールは特定のビジネスグループ下のアラートイベントにのみ適用されます',
  preview_muted_title: '関連イベントのプレビュー',
  preview_muted_save_only: '保存のみ',
  preview_muted_save_and_delete: '保存して関連イベントを削除',
  expired: '期限切れ',
  quick_mute: 'クイックミュート',
};

export default ja_JP;
