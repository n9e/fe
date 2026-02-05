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
    query_required: '請填寫查詢條件',
    mode: {
      raw: '日誌原文',
      metric: '統計圖表',
    },
    submode: {
      table: '表格圖',
      timeSeries: '時序圖',
    },
    dashboard: {
      mode: {
        label: '查詢模式',
        table: '非時序資料',
        timeSeries: '時序資料',
      },
      time: '時間選擇',
      timeTip: '可指定時間範圍，默認為儀表板全局時間範圍',
      time_series: '自動補全x軸參數',
      time_series_tip: 'beta 版<1 />時序模式下，如果查詢語句中不包含__time__字段，系統自動推斷並補全該參數，確保x軸是時間戳格式',
      removeFirstAndLastPoints: '去除前後端點',
    },
    advancedSettings: {
      title: '輔助配置',
      valueKey: '值字段',
      valueKey_tip: '通過此字段從返回結果中提取的數值。例如查詢條件為 `* | select count(1) as PV` 返回結果為 PV:11，ValueKey 寫了 PV，則會根據 PV 提取到 11，作為查詢結果的值',
      valueKey_required: '請填寫值字段',
      tags_placeholder: '回車輸入多個',
      labelKey: '標籤字段',
      labelKey_tip:
        '將此字段以及其對應的 value，作為 tag，追加到監控資料的標籤中，例如查詢條件為  `* | select count(1) as PV group by host` 返回結果為 `[{PV:11 host:dev01},{PV:10 host:dev02}]`, LabelKey 寫了 host, 則第一條返回資料 host=dev01 會作為 tag',
      timeKey: '時間字段',
      timeKey_tip: '指定哪個字段是時間字段，作為繪製曲線圖的 x 軸座標',
      timeKey_required: '請填寫時間字段',
      timeFormat: '時間格式',
      timeFormat_tip: '時間的格式，會根據此格式將時間轉為時間戳',
    },
    query_raw_tip: `查詢日誌原文:
  - 查詢GET、POST請求成功的日誌：(request_method:GET or request_method:POST) and status in [200 299]
  - 查詢GET、POST請求失敗的日誌：(request_method:GET or request_method:POST) and status not in [200 299]
  - 查詢request_uri字段值以/request開頭的日誌：request_uri:/request*`,
    query_timeseries_tip: `查詢時序值:
  - 查詢GET、POST請求成功的日誌條數，有兩種查詢方式，如果對展示的時間樣式沒有特殊要求，可以不寫 [time_series](https://help.aliyun.com/document_detail/63451.htm)
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count, select time_series(__time__, '1m', '%H:%i:%s' ,'0') as Time group by Time order by Time limit 100`,
    query_document: `詳細文檔:
  - [查詢語法](https://help.aliyun.com/document_detail/29060.htm)
  - [分析語法](https://help.aliyun.com/document_detail/53608.html)
  - [函數概覽](https://help.aliyun.com/document_detail/321454.html)`,
    variable_help: '會將查詢到的日誌中所有字段的值進行組合並去重，作為變量的可選項。默認只查詢前 500 條日誌。',
  },
  trigger: {
    title: '告警條件',
    value_msg: '請輸入數值',
  },
  logs: {
    title: '日誌詳情',
    count: '結果數',
    filter_fields: '篩選字段',
    settings: {
      mode: {
        origin: '原始',
        table: '表格',
      },
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
    fieldValues_topnNoData: '無數據',
    stats: {
      numberOfUniqueValues: '唯一值個數',
      min: '最小值',
      max: '最大值',
      sum: '求和',
      avg: '平均值',
    },
    fieldLabelTip: '字段未開啟統計，無法進行統計分析',
    filterAnd: '添加到本次檢索',
    filterNot: '從本次檢索中排除',
    total: '日誌條數',
    context: {
      title: '上下文瀏覽',
      back_lines_btn: '更早',
      current_lines_btn: '當前日誌',
      forward_lines_btn: '更新',
      organize_fields: '字段設置',
      organize_fields_tip: '當前只顯示字段 {{fields}}',
      filter_keywords: '過濾',
      filter_keywords_add: '添加過濾',
      highlight_keywords: '高亮',
      highlight_keywords_add: '添加高亮',
      no_more_top: '沒有更早的日誌',
      no_more_bottom: '沒有更新的日誌',
    },
  },
  enrich_queries: {
    title: '擴展查詢',
  },
};

export default zh_HK;
