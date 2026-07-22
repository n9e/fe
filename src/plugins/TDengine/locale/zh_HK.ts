const zh_HK = {
  preview: '資料預覽',
  query: {
    title: '查詢統計',
    execute: '查詢',
    project: '專案',
    project_msg: '請選擇專案',
    project_tip: `
      <1>專案是日誌服務的資源管理單元，是進行多使用者隔離與訪問控制的主要邊界。更多資訊，請參見<1>
      <2>專案</2>
    `,
    logstore: '日誌庫',
    logstore_msg: '請選擇日誌庫',
    logstore_tip: `
      <1>日誌庫是日誌服務中日誌資料的採集、儲存和查詢單元。更多資訊，請參見<1>
      <2>日誌庫</2>
    `,
    range: '查詢區間',
    power_sql: 'SQL 增強',
    query: 'SQL',
    query_msg: '請輸入SQL',
    query_tip1: 'TDengine 查詢語法可參考',
    query_tip2: '官方文檔',
    sqlTemplates: '查詢模板',
    sqlTemplates_tip: '以下 SQL 查詢條件僅供參考，在實際使用的時候，需要將其中的 $變量 替換為實際的值',
    mode: {
      timeSeries: '時序值',
      raw: '日誌原文',
    },
    advancedSettings: {
      title: '輔助配置',
      metricKey_label: '值字段',
      metricKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列的值作為曲線展示在圖表上',
      tags_placeholder: '回車輸入多個',
      labelKey_label: '標籤字段',
      labelKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列作為曲線的標籤元信息',
      timeKey_tip: '指定哪個字段是時間字段，作為繪製曲線圖的 x 軸座標',
      timeFormat_tip: '時間的格式，會根據此格式將時間轉為時間戳',
    },
    schema: '元信息',
    table: '普通表',
    stable: '超級表',
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
};

export default zh_HK;
