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
    query: '查詢條件',
    query_msg: '請輸入查詢條件',
    mode: {
      timeSeries: '時序值',
      raw: '日誌原文',
    },
    advancedSettings: {
      title: '輔助配置',
      metricKey_tip:
        '透過此字段可以指定哪些字段作為 metricName，預設會將數值類型的字段作為 metricName，例如查詢的結果為used_percent:96 host:host01，used_percent將作為 metricName, value 為 96',
      tags_placeholder: '回車輸入多個',
      labelKey_tip:
        '透過此字段可以指定哪些字段為 labelName，預設會將非數值類型的字段為 labelName，例如查詢的結果為used_percent:96 host:host01，host 將作為 label 的 name, host01 為 label 的值',
      timeKey_tip: '指定哪個字段是時間字段，作為繪製曲線圖的 x 軸座標',
      timeFormat_tip: '時間的格式，會根據此格式將時間轉為時間戳',
    },
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
};

export default zh_HK;
