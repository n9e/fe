const zh_HK = {
  title: '事件 Pipeline',
  teams: '授權團隊',
  basic_configuration: '基本配置',
  filter_enable: '過濾條件',
  label_filters: '適用標籤',
  label_filters_tip: '適用標籤',
  attribute_filters: '適用屬性',
  attribute_filters_tip: '適用屬性',
  attribute_filters_value: '屬性值',
  attribute_filters_options: {
    group_name: '業務組',
    cluster: '數據源',
  },
  processor: {
    title: '處理器',
    add_btn: '添加處理器',
    typ: '類型',
  },
  label_enrich: {
    label_source_type: {
      label: '標籤來源',
      options: {
        built_in_mapping: '內置標籤詞表',
      },
    },
    label_mapping_id: '詞表名稱',
    help: '使用源標籤中指定的標籤查詢詞表，將詞表中查詢到的字段根據 "新增標籤" 配置追加到告警事件中',
    source_keys: {
      label: '源標籤',
      text: '詞表中的字段 <strong>{{field}}</strong> 對應事件中的標籤',
      target_key_required: '標籤名不能為空',
    },
    append_keys: {
      label: '新增標籤',
      source_key_placeholder: '詞表中的字段',
      rename_key: '重命名標籤 Key',
      target_key_placeholder: '標籤 Key',
    },
  },
  test_modal: {
    title: {
      settings: '選擇告警事件',
      result: '事件預覽',
    },
  },
};

export default zh_HK;
