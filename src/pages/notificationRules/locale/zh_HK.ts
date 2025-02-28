const zh_HK = {
  title: '通知規則',
  basic_configuration: '基礎配置',
  user_group_ids: '授權團隊',
  user_group_ids_tip: '這裡填寫的團隊中的用戶，將有權限管理或查看此通知規則',
  enabled_tip: '是否開啟此告警通知規則。啟用後，匹配到此規則的告警事件將按照設置的通知配置發送通知',
  note_tip: '可在此補充該通知規則的詳細信息或說明，便於日後維護',
  notification_configuration: {
    title: '通知配置',
    add_btn: '添加通知配置',
    channel: '通知媒介',
    channel_tip: '選擇使用哪種方式發送告警事件通知，如果已有方式不滿足需求，可以聯繫管理員創建新的配置',
    template: '消息模板',
    template_tip: '通知通知內容的模板，可以根據不同的場景使用不同的模板',

    severities: '適用級別',
    severities_tip: '選擇要對那個等級的告警事件進行通知，只有勾選上的級別，才會被通知',
    time_ranges: '適用時段',
    time_ranges_tip: '在時間維度對告警事件進行過濾，設置哪個時間段產生的告警事件，會在此通知配置生效，不寫表示不根據時間段做過濾',
    effective_time_start: '開始時間',
    effective_time_end: '結束時間',
    effective_time_week_msg: '請選擇生效星期',
    effective_time_start_msg: '請選擇開始時間',
    effective_time_end_msg: '請選擇結束時間',
    label_keys: '適用標籤',
    label_keys_tip: '在標籤維度對告警事件進行過濾，設置包含了哪些標籤的事件走此通知配置，不寫表示不根據標籤做過濾',
    run_test_btn: '通知測試',
    run_test_btn_tip: '可以選擇幾個已經產生的事件，測試一下此通知配置是否正確，如果正確，應該會收到相關的通知消息',
    run_test_request_success: '提交測試成功',
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
};

export default zh_HK;
