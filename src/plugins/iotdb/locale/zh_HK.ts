const zh_HK = {
  preview: '資料預覽',
  query: {
    title: '查詢統計',
    execute: '查詢',
    range: '查詢區間',
    power_sql: 'SQL 增強',
    query: '查詢條件',
    query_msg: '請輸入查詢條件',
    query_tip1: 'IoTDB 查詢語法可參考',
    query_tip2: '官方文檔',
    sqlTemplates: '查詢模板',
    sqlTemplates_tip: '以下 SQL 查詢條件僅供參考，在實際使用的時候，需要將其中的 $變量 替換為實際的值',
    sqlTemplates_load_failed: '查詢模板載入失敗',
    previewFailed: '資料預覽失敗',
    loadSchemaFailed: '元信息載入失敗',
    mode: {
      timeSeries: '時序值',
      raw: '日誌原文',
    },
    advancedSettings: {
      title: '輔助配置',
      metricKey_tip: '透過此字段可以指定哪些字段作為 metricName。',
      tags_placeholder: '回車輸入多個',
      labelKey_tip: '透過此字段可以指定哪些字段為 labelName。',
      timeKey_tip: '指定哪個字段是時間字段，作為繪製曲線圖的 x 軸座標',
      timeFormat_tip: '時間的格式，會根據此格式將時間轉為時間戳',
    },
    schema: '元信息',
    table: '表',
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
};

export default zh_HK;
