const ja_JP = {
  title: 'イベントパイプライン',
  teams: '権限のあるチーム',
  basic_configuration: '基本設定',
  filter_enable: 'フィルター条件',
  label_filters: '適用ラベル',
  label_filters_tip: '適用ラベル',
  attribute_filters: '適用属性',
  attribute_filters_tip: '適用属性',
  attribute_filters_value: '属性値',
  attribute_filters_options: {
    group_name: 'ビジネスグループ',
    cluster: 'データソース',
  },
  processor: {
    title: 'プロセッサー',
    add_btn: 'プロセッサーを追加',
    typ: 'タイプ',
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
      target_key_required: 'ラベル名は空にできません',
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
};

export default ja_JP;
