const zh_HK = {
  preview: '資料預覽',
  query: {
    title: '查詢統計',
    execute: '查詢',
    query: '查詢條件',
    query_required: '查詢條件不能為空',
    query_placeholder: '輸入 SQL 進行查詢，按 Shift+Enter 換行',
    query_placeholder2: '按 Shift+Enter 換行',
    advancedSettings: {
      title: '輔助配置',
      tags_placeholder: '回車輸入多個',
      valueKey: '值字段',
      valueKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列的值作為曲線展示在圖表上',
      valueKey_required: '值字段不能為空',
      labelKey: '標籤字段',
      labelKey_tip: 'SQL 查詢結果通常包含多個列，您可以指定哪些列作為曲線的標籤元信息',
    },
    schema: '元信息',
    document: '使用文檔',
    dashboard: {
      mode: {
        label: '查詢模式',
        table: '非時序數據',
        timeSeries: '時序數據',
      },
    },
    historicalRecords: {
      button: '歷史記錄',
      searchPlaceholder: '搜索歷史記錄',
    },
    compass_btn_tip: '點擊查看表數據',
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
  datasource: {
    shards: {
      title: '資料源基本資訊',
      title_tip: '資料庫是否能夠連通依賴 DBA 是否已給相應 DB 使用者授權，如因此未能連通仍可先繼續完成後面的設置，後續再做驗證。',
      addr: '資料庫地址',
      addr_tip: '資料庫地址需唯一',
      user: '用戶名',
      password: '密碼',
      help: '說明：帳號需對相應資料庫有讀取權限才可繼續後續操作，如修改為其他帳號請盡量使用唯讀權限帳號。',
    },
  },
};

export default zh_HK;
