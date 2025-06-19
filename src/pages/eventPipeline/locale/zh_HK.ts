const zh_HK = {
  title: '事件管道',
  title_add: '新增事件管道',
  title_edit: '編輯事件管道',
  teams: '授權團隊',
  teams_tip: '限定哪些團隊成員可以查看和修改此配置，可以關聯多個團隊<br />例如：將配置授權給 infra-team，則只有 infra-team 團隊下的成員可以訪問或調整本配置。',
  basic_configuration: '基本配置',
  filter_enable: '過濾條件',
  label_filters: '適用標籤',
  label_filters_tip:
    '設置事件處理的標籤過濾條件，僅當事件包含與此處配置匹配的標籤時，才會被處理。<br />示例：填寫 service=mon，表示僅當事件包含標籤 service=mon 時，才會進入該處理流程。',
  attribute_filters: '適用屬性',
  attribute_filters_tip:
    '設置事件處理的屬性過濾條件，僅當事件包含與此處配置匹配的屬性時，才會被處理。<br />示例：填寫 業務組==DefaultBusiGroup，表示僅當事件的"業務組"屬性為 DefaultBusiGroup 時，才會進入該處理流程。',
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
    url: 'URL',
    advanced_settings: '高級設置',
    basic_auth_user: '授權用戶名',
    basic_auth_user_placeholder: '請輸入授權用戶名',
    basic_auth_pass: '授權密碼',
    basic_auth_pass_placeholder: '請輸入授權密碼',
  },
  event_drop: {
    content: '判斷邏輯',
    content_placeholder: '使用 go template 語法，如果最後顯示為 true，將會將 event 在此環節丟棄',
  },
  ai_summary: {
    url_placeholder: '請輸入 API 服務地址',
    url_required: '請輸入 URL',
    api_key_placeholder: 'API 密鑰',
    api_key_required: '請輸入 API Key',
    model_name: '模型名稱',
    model_name_placeholder: '如 deepseek-chat',
    model_name_required: '請輸入模型名稱',
    prompt_template: '提示詞模板',
    prompt_template_required: '請輸入提示詞模板',
    advanced_config: '高級配置',
    custom_params: 'AI模型參數配置',
    custom_params_key_label: '參數名 (如: temperature)',
    custom_params_value_label: '參數值 (如: 0.7)',
    proxy_placeholder: '如: http://proxy.example.com:8080',
    timeout_placeholder: '超時時間（秒）',
    timeout_required: '請輸入超時時間',
    url_tip: `- **說明**: AI服務的API接口地址\n- **示例**: \`https://api.deepseek.com/v1/chat/completions\``,
    api_key_tip: `- **說明**: AI服務提供商的API密鑰\n- **獲取方式**:\n  - OpenAI: 在OpenAI官網申請\n  - DeepSeek: 在DeepSeek官網註冊獲取`,
    model_name_tip: `- **說明**: 指定使用的AI模型名稱\n- **常用模型**:\n  - \`gpt-3.5-turbo\` (OpenAI)\n  - \`gpt-4\` (OpenAI)\n  - \`deepseek-chat\` (DeepSeek)`,
    prompt_template_tip: `提示詞模板是AI分析的核心，可以使用 {{$event}} 引用事件的各個字段，事件的詳細結構參考[告警歷史表](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/schema/alert_his_event/)說明，剛開始使用提供的默認模板即可`,
    custom_params_tip: `- AI模型參數配置\n\n用於精細化調整AI模型的行為：\n\n| 參數名 | 說明 | 推薦值 | 示例 |\n|--------|------|--------|------|\n| temperature | 控制回答的隨機性 | 0.3-0.7 | 0.7 |\n| max_tokens | 最大輸出token數 | 200-500 | 300 |\n| top_p | 採樣概率閾值 | 0.8-1.0 | 0.9 |\n\n**配置方法**:\n1. 點擊 "Custom Params" 旁的 + 按鈕\n2. 在"參數名"欄輸入參數名（如：temperature）\n3. 在"參數值"欄輸入對應值（如：0.7）`,
    prompt_template_placeholder: `請分析以下告警事件信息，並提供一個簡潔明了的中文總結：
告警規則: {{$event.RuleName}}
嚴重程度: {{$event.Severity}}
告警狀態: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}
觸發時間: {{$event.TriggerTime}}
觸發值: {{$event.TriggerValue}}
規則說明: {{$event.RuleNote}}
標籤信息: {{$event.Tags}}
註釋信息: {{$event.Annotations}}

請提供一個100字以內的中文總結，重點說明：
1. 什麼系統/服務出現了什麼問題
2. 問題的嚴重程度
3. 可能的影響
4. 簡單的處理建議
總結內容要簡潔明了，方便運維人員快速了解告警情況。`,
  },
  script: {
    timeout: '超時時間（單位毫秒）',
    timeout_tooltip: '腳本執行的最大超時時間，超過此時間腳本將被終止',
    timeout_placeholder: '請輸入超時時間',
    content: '腳本內容',
    content_tooltip: '編寫用於處理事件的腳本代碼，告警事件會以 stdin 方式傳入腳本，腳本需要將 event 作為 json 對象輸出到 stdout',
    content_placeholder: '請輸入腳本內容',
  },
};

export default zh_HK;
