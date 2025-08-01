const zh_HK = {
  title: '通知規則',
  basic_configuration: '基礎配置',
  user_group_ids: '授權團隊',
  user_group_ids_tip: '這裡填寫的團隊中的用戶，將有權限管理或查看此通知規則',
  enabled_tip: '是否啟用此通知規則',
  note_tip: '可在此補充該通知規則的詳細信息或說明，便於日後維護',
  notification_configuration: {
    title: '通知配置',
    add_btn: '添加通知配置',
    channel: '通知媒介',
    channel_tip: '選擇使用哪種媒介發送告警事件通知，如果已有媒介不滿足需求，可以聯繫管理員創建新的媒介',
    channel_msg: '請選擇通知媒介',
    template: '消息模板',
    template_tip: '通知內容的模板，可以根據不同的場景使用不同的模板',
    template_msg: '請選擇消息模板',
    severities: '適用級別',
    severities_tip: '選擇要對哪個等級的告警事件進行通知，只有勾選上的級別，才會被通知。如果三個等級都沒有勾選，這個媒介就匹配不到告警事件了，相當於禁用了這個媒介',
    time_ranges: '適用時段',
    time_ranges_tip: '通知規則可以限制僅在部分時段生效，不配置表示不做限制',
    effective_time_start: '開始時間',
    effective_time_end: '結束時間',
    effective_time_week_msg: '請選擇生效星期',
    effective_time_start_msg: '請選擇開始時間',
    effective_time_end_msg: '請選擇結束時間',
    label_keys: '適用標籤',
    label_keys_tip: '通知規則可以限制僅對符合條件（通過事件標籤做篩選）的部分告警事件生效，不配置表示不做限制',
    attributes: '適用屬性',
    attributes_value: '屬性值',
    attributes_tip: '通知規則可以限制僅對符合某些事件屬性的部分告警事件生效，不配置表示不做限制',
    attributes_options: {
      group_name: '業務組',
      cluster: '數據源',
      is_recovered: '是恢復事件？',
    },
    run_test_btn: '通知測試',
    run_test_btn_tip: '可以選擇幾個已經產生的事件，測試一下此通知配置是否正確，如果正確，應該會收到相關的通知消息',
    run_test_request_result: '測試通知已發送，通知目標返回響應如下：',
    user_info: {
      user_ids: '接收人',
      user_group_ids: '接收團隊',
      error: '接收人和接收團隊不能同時為空',
    },
    flashduty: {
      ids: '協作空間',
    },
  },
  user_group_id_invalid_tip: '授權團隊不存在',
  channel_invalid_tip: '通知媒介不存在',
  pipeline_configuration: {
    title: '事件處理',
    name_placeholder: '請選擇事件處理',
    name_required: '事件處理不能為空',
    add_btn: '添加事件處理',
    disable: '禁用',
    enable: '啟用',
  },
};

export default zh_HK;
