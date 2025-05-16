const ja_JP = {
  title: 'イベントパイプライン',
  teams: '権限のあるチーム',
  teams_tip:
    'この設定を表示および変更できるチームメンバーを制限します。複数のチームを関連付けることができます<br />例：infra-teamに設定を付与すると、infra-teamのメンバーのみがこの設定にアクセスまたは調整できます。',
  basic_configuration: '基本設定',
  filter_enable: 'フィルター条件',
  label_filters: '適用ラベル',
  label_filters_tip:
    'イベント処理のタグ フィルタ条件を設定します。イベントは、ここでの設定に一致するタグが含まれている場合にのみ処理されます。 <br />例: service=mon と入力します。これは、イベントにラベル service=mon が含まれている場合にのみこの処理フローが開始されることを意味します。',
  attribute_filters: '適用属性',
  attribute_filters_tip:
    'イベント処理の属性フィルタ条件を設定します。イベントは、ここでの設定に一致する属性が含まれている場合にのみ処理されます。 <br />例: Business Group == DefaultBusiGroup と入力します。これは、イベントの「ビジネス グループ」属性が DefaultBusiGroup の場合にのみ、この処理フローが開始されることを意味します。',
  attribute_filters_value: '属性値',
  attribute_filters_options: {
    group_name: 'ビジネスグループ',
    cluster: 'データソース',
  },
  processor: {
    title: 'プロセッサー',
    add_btn: 'プロセッサーを追加',
    typ: 'タイプ',
    help_btn: '使用説明',
  },
  label_enrich: {
    label_source_type: {
      label: 'ラベルソース',
      options: {
        built_in_mapping: '組み込みマッピング',
      },
    },
    label_mapping_id: 'ラベルマッピング名',
    help: 'ソースラベルで指定されたラベルを使用してマッピングを照会し、「追加ラベル」設定に従って、マッピングから照会されたフィールドをアラームイベントに追加します',
    source_keys: {
      label: 'ソースラベル',
      text: 'マッピングのフィールド <strong>{{field}}</strong> は、イベントのラベルに対応しています',
      target_key_placeholder: 'ラベルキー',
      target_key_required: 'ラベルキーは空にできません',
    },
    append_keys: {
      label: '追加ラベル',
      source_key_placeholder: 'マッピングのフィールド',
      rename_key: 'ラベルキーを変更',
      target_key_placeholder: 'ラベルキー',
    },
  },
  test_modal: {
    title: {
      settings: 'アラームイベントを選択',
      result: 'イベントプレビュー',
    },
  },
  callback: {
    url: '回調アドレス',
    url_placeholder: '回調アドレスを入力してください',
    url_required: '回調アドレスは必須です',
    advanced_settings: '詳細設定',
    basic_auth_user: 'ユーザー名',
    basic_auth_user_placeholder: 'ユーザー名を入力してください',
    basic_auth_pass: 'パスワード',
    basic_auth_pass_placeholder: 'パスワードを入力してください',
    headers: 'ヘッダー',
    headerKey: 'キー',
    headerValue: '値',
    timeout: 'タイムアウト',
    insecure_skip_verify: '証明書の検証をスキップ',
    proxy: 'プロキシ',
  },
};

export default ja_JP;
