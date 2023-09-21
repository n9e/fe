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
    mode: {
      timeSeries: '時序值',
      raw: '日誌原文',
    },
    advancedSettings: {
      title: '輔助配置',
      metricKey_tip:
        '透過此欄位可以指定哪些欄位作為 metricName，預設會將數值類型的欄位作為 metricName，例如查詢的結果為used_percent:96 host:host01，used_percent將作為 metricName, value 為 96',
      tags_placeholder: '回車輸入多個',
      labelKey_tip:
        '透過此欄位可以指定哪些欄位為 labelName，預設會將非數值類型的欄位為 labelName，例如查詢的結果為used_percent:96 host:host01，host 將作為 label 的 name, host01 為 label 的值',
      timeKey_tip: '指定哪個欄位是時間欄位，作為繪製曲線圖的 x 軸座標',
      timeFormat_tip: '時間的格式，會根據此格式將時間轉為時間戳',
    },
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
  logs: {
    title: '日誌詳情',
    count: '結果數',
    filter_fields: '篩選欄位',
    settings: {
      breakLine: '換行',
      reverse: '時間',
      organizeFields: {
        title: '字段列設置',
        allFields: '可用字段',
        showFields: '顯示字段',
        showFields_empty: '日誌默認顯示全部字段',
      },
      jsonSettings: {
        title: 'JSON 設置',
        displayMode: '默認展示類型',
        displayMode_tree: '樹形展示',
        displayMode_string: '字符串展示',
        expandLevel: '默認展開層級',
      },
    },
    tagsDetail: 'Tag 詳情',
    expand: '展開',
    collapse: '收起',
  },
};

export default zh_HK;
