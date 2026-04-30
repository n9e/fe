const zh_HK = {
  toolbar: {
    current_chat: '當前會話',
    new_chat: '新建會話',
    history: '會話歷史',
    switch_to_drawer: '切換為抽屜模式',
    switch_to_floating: '切換為浮窗模式',
  },
  history: {
    untitled: '新會話',
    today: '今天',
    yesterday: '昨天',
    earlier: '更早',
    unknown_time: '--:--',
    delete_confirm: '刪除該會話？',
    empty: '暫無歷史會話',
  },
  input: {
    placeholder: '輸入問題，Enter 發送，Shift + Enter 換行',
  },
  query: {
    title: '查詢語句',
    copied: '已複製查詢語句',
    copy: '複製',
    execute: '執行查詢',
    execute_disabled: '未傳入執行回調，僅支持複製',
  },
  action: {
    query_generator: '生成查詢語句',
  },
  message: {
    generating: '正在生成回覆...',
    hint: '提示',
    stopped: '已停止生成',
    request_failed: '請求失敗',
    cancelled: '本次回覆已被取消。',
    retry_later: '請稍後重試。',
    empty_response: '暫無回覆內容',
    thinking: '思考過程',
    unsupported_type: '暫不支持的內容類型：{{type}}',
  },
  form_select: {
    title: '請先補充以下資訊後繼續：',
    busi_group: '業務組',
    datasource: '數據源',
    placeholder_select: '請選擇',
    confirm: '確定',
  },
  alert_rule: {
    title: '告警規則',
    copy: '複製',
    copied: '已複製規則 ID',
    duration_seconds: '持續 {{seconds}} 秒',
    field: {
      id: '規則 ID',
      name: '規則名稱',
      group: '業務組',
      datasource: '數據源',
      cate: '數據源類型',
      severity: '告警級別',
      metric: '監控指標',
      condition: '觸發條件',
      note: '告警內容',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  dashboard: {
    title: '儀表盤',
    copied: '已複製儀表盤 ID',
    field: {
      id: '儀表盤 ID',
      name: '名稱',
      group: '業務組',
      datasource: '默認數據源',
      panels_count: '面板數',
      variables_count: '變量數',
      tags: '標籤',
    },
  },
  empty: {
    greeting_prefix: '你好,我是',
  },
};

export default zh_HK;
