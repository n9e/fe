const zh_HK = {
  title: '事件 Pipelines',
  teams: '授權團隊',
  teams_tip: '限定哪些團隊成員可以查看和修改此配置，可以關聯多個團隊<br />例如：將配置授權給 infra-team，則只有 infra-team 團隊下的成員可以訪問或調整本配置。',
  basic_configuration: '基本配置',
  filter_enable: '過濾條件',
  label_filters: '適用標籤',
  label_filters_tip:
    '設置事件處理的標籤過濾條件，僅當事件包含與此處配置匹配的標籤時，才會被處理。<br />示例：填寫 service=mon，表示僅當事件包含標籤 service=mon 時，才會進入該處理流程。',
  attribute_filters: '適用屬性',
  attribute_filters_tip:
    '設置事件處理的屬性過濾條件，僅當事件包含與此處配置匹配的屬性時，才會被處理。<br />示例：填寫 業務組==DefaultBusiGroup，表示僅當事件的“業務組”屬性為 DefaultBusiGroup 時，才會進入該處理流程。',
  attribute_filters_value: '屬性值',
  attribute_filters_options: {
    group_name: '業務組',
    cluster: '數據源',
  },
  processor: {
    title: '處理器',
    add_btn: '添加處理器',
    typ: '類型',
    help_btn: '使用說明',
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
      target_key_placeholder: '標籤 Key',
      target_key_required: '標籤 Key 不能為空',
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
  callback: {
    url: '回調地址',
    url_placeholder: '請輸入回調地址',
    url_required: '回調地址不能為空',
    advanced_settings: '高級設置',
    basic_auth_user: '授權用戶名',
    basic_auth_user_placeholder: '請輸入授權用戶名',
    basic_auth_pass: '授權密碼',
    basic_auth_pass_placeholder: '請輸入授權密碼',
    headers: '請求頭',
    headerKey: 'Key',
    headerValue: 'Value',
    timeout: '超時時間',
    insecure_skip_verify: '跳過證書校驗',
    proxy: '代理',
  },
};

export default zh_HK;
