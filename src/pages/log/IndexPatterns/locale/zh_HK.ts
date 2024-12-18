const zh_HK = {
  unauthorized: '沒有權限',
  title: '索引規則',
  name: '名稱',
  name_msg1: '請輸入名稱',
  name_msg2: '已存在同名的規則',
  time_field: '時間字段',
  allow_hide_system_indices: '匹配隱藏的索引',
  create_btn: '創建索引規則',
  create_title: '創建索引規則',
  edit_title: '編輯索引規則',
  cross_cluster_enabled: '跨集群',
  indexes_empty: '沒有匹配的索引',
  field: {
    name: '字段名稱',
    type: '字段類型',
    type_placeholder: '請選擇字段類型',
    edit_title: '編輯字段',
    alias: '字段別名',
    alias_tip: '日誌查詢中顯示的字段名稱, 查詢和過濾使用原字段名稱',
    format: {
      title: '自定義展示格式',
      type: '自定義展示格式',
      params: {
        date: {
          pattern: '日期格式',
          pattern_tip: '使用 Moment.js 格式模式, 默認值為 YYYY-MM-DD HH:mm:ss.SSS',
          pattern_placeholder: 'YYYY-MM-DD HH:mm:ss.SSS',
        },
        url: {
          urlTemplate: 'URL 模板',
          urlTemplateTip: '可用{{value}}代表该字段的值',
          urlTemplateTip1: '如跳转tracing系统：http://flashcat.cloud/trace?traceId={{value}}&dataSourceName=traceSystemName',
          urlTemplatePlaceholder: 'https://www.example.com/?q={{value}}',
          labelTemplate: '標籤模板',
          labelTemplatePlaceholder: '{{value}}',
        },
      },
    },
  },
};

export default zh_HK;
