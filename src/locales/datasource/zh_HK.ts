const zh_HK = {
  es: {
    ref: '名稱',
    index: '索引',
    index_tip: `
      支援多種配置方式
      <1/>
      1. 指定單個索引 gb 在 gb 索引中搜索所有的文件
      <1/>
      2. 指定多個索引 gb,us 在 gb 和 us 索引中搜索所有的文件
      <1/>
      3. 指定索引字首 g*,u* 在任何以 g 或者 u 開頭的索引中搜索所有的文件
      <1/>
      `,
    index_msg: '索引不能為空',
    indexPattern: '索引模式',
    indexPatterns: '索引模式',
    indexPattern_msg: '索引模式不能為空',
    indexPatterns_manage: '管理索引模式',
    filter: '過濾條件',
    syntax: '語法',
    time_label: '時間顆粒度',
    date_field: '日期字段',
    date_field_msg: '日期字段不能為空',
    interval: '時間間隔',
    value: '數值提取',
    func: '函數',
    funcField: '字段名',
    terms: {
      label: '根據指定 field 分組',
      more: '高階設定',
      size: '匹配個數',
      min_value: '文件最小值',
    },
    raw: {
      limit: '日誌條數',
      date_format: '日期格式',
      date_format_tip: '使用 Moment.js 格式模式，比如 YYYY-MM-DD HH:mm:ss.SSS',
    },
    alert: {
      query: {
        title: '查詢統計',
        preview: '資料預覽',
      },
      trigger: {
        title: '告警條件',
        builder: '簡單模式',
        code: '表示式模式',
        label: '關聯 Label',
      },
      prom_eval_interval_tip: '每隔 {{num}} 秒，去查詢後端儲存',
      prom_for_duration_tip:
        '通常持續時長大於執行頻率，在持續時長內按照執行頻率多次執行查詢，每次都觸發才生成告警；如果持續時長置為 0，表示只要有一次查詢的資料滿足告警條件，就生成告警',
      advancedSettings: '高階設定',
      delay: '延遲執行',
    },
    event: {
      groupBy: `根據 {{field}} 分組，匹配個數 {{size}}, 文檔最小值 {{min_value}}`,
      logs: {
        title: '日誌詳情',
        size: '結果數',
        fields: '篩選字段',
        jsonParseError: '解析失敗',
      },
    },
    syntaxOptions: '語法選項',
    queryFailed: '查詢失敗，請稍後重試',
    offset_tip: '用於查詢指定時間段之前的資料，類似 PromQL 中的 offset，單位為秒',
  },
  datasource: {
    max_query_rows: '單次請求允許檢索的最大行數',
    max_idle_conns: '最大空閒連接數',
    max_open_conns: '最大打開連接數',
    conn_max_lifetime: '連接最大生存時間 （單位: 秒）',
    timeout: '超時時間 （單位: 秒）',
    timeout_ms: '超時時間 （單位: 毫秒）',
  },
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
  },
};

export default zh_HK;
