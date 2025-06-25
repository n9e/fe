const zh_HK = {
  quick_query: '快捷查詢',
  quick_query_tip: '快捷查詢 根據固定的SQL模闆，快速生成查詢語句，比如字段A大於0，只需要輸入 A > 0，通過點擊該按鈕可以快速切換到自定義模式，支持查看併修改SQL語句',
  custom_query: '自定義查詢',
  custom_query_tip: '自定義查詢 支持用戶根據SQL語法自由輸入查詢語句',
  current_database: '當前數據庫',
  table: '數據表',
  database_table_required: '請先選擇數據庫和數據表',
  query: {
    mode: {
      raw: '日志原文',
      metric: '統計圖表',
    },
    time_field: '時間字段',
    time_field_msg: '請輸入時間字段',
    sql_msg: '請輸入SQL語句',
    execute: '查詢',
    database: '數據庫',
    advancedSettings: {
      title: '輔助配置',
      valueKey: '值字段',
      valueKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列的值作為曲線展示在圖表上',
      valueKey_required: '值字段不能為空',
      labelKey: '標籤字段',
      labelKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列作為曲線的標籤元信息',
    },
  },
};

export default zh_HK;
