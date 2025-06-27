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
    query_tip: 'SQL樣例：查詢最近5分鐘的日志行數 SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: '查詢',
    database: '數據庫',
    database_placeholder: '默認可以留空',
  },
};

export default zh_HK;
