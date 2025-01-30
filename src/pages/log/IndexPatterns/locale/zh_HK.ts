const zh_HK = {
  unauthorized: '沒有權限',
  title: '索引規則',
  name: '名稱',
  name_msg1: '請輸入名稱',
  name_msg2: '已存在同名的規則',
  time_field: '時間字段',
  allow_hide_system_indices: '匹配隱藏的索引',
  create_btn: '新增索引規則',
  create_title: '創建索引規則',
  edit_title: '編輯索引規則',
  cross_cluster_enabled: '跨集群',
  indexes_empty: '沒有匹配的索引',
  keyword:'字段',
  should_not_empty: '不可為空',
  should_not_dup: "字段不能重複",
  "日志中的字段均可被作为变量引用，如": "日志中的字段都可以作为变量引用，例如",
  "跳转到日志查询": "跳转到日志查询",
  "跳转到灭火图": "跳转到灭火图",
  "跳转到仪表盘": "跳转到仪表盘",
  "内置变量": "内置变量",
  "，如": "，例如",
  "，包含了协议和域名": "，包括协议和域名",
  "起止时间": "起止时间",
  "时间偏移(单位毫秒，可为负数)": "時間偏移（毫秒，支持負數）",
  "时间偏移": "時間偏移",
  "日志中的变量均可被作为变量引用，如": "日志中的变量都可以作为变量引用，例如",
  "本系统地址": "本系统地址",
  "，推荐使用该变量即可": "，建議只使用該變量。",
  "本系统的域名": "本系统的域名是",
  "，不包含端口信息": "，不包括端口信息",
  "，包含“": "，包括",
  "”，为 “http": "”，為“http”",
  "” 或 “https": "”或“https”",
  "本系统协议": "本系统协议",
  "可为指定字段设置链接": "可為指定字段設置連結",
  "复制": "复制",
  "样例": "样例",
  tipDisplay: '展开',
  tipCollapse: '收起',
  link: '链接',
  displayStyle: '顯示樣式',
  "链接地址": "連結位址",
  "可为指定字段设置展示样式，如，格式、别名等。":"可為指定字段設置展示樣式，如，格式、別名等。",
  "如：设置字段的链接为":"如：設定欄位的連結為", 
  "或将该字段显示的值展示为":"或將該欄位顯示的值展示為", 
  tip1:"其中{{value}}為指定字段的值，可在該變量的基礎上增加信息。",
  跳转链接: '跳轉連結',
  展示样式: '展示樣式',
  field: {
    alias1: '連結別名',
    fieldPlaceholder: '請選擇字段',
    namePlaceholder: '請輸入',
    name: '字段名稱',
    type: '字段類型',
    type_placeholder: '請選擇字段類型',
    edit_title: '編輯索引',
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
          urlTemplateTip: '可用{{value}}代表该字段的值,其他字段均可被作為變量引用，如${key1}，${key2}',
          urlTemplateTip1: '如跳转tracing系统：http://flashcat.cloud/trace?traceId={{value}}&dataSourceName=traceSystemName',
          urlTemplateTip2: '連結的配置和修改請到“跳轉連結”中進行，如“跳轉連結”中配置了同一字段的連結，此處的配置將失效。',
          urlTemplatePlaceholder: 'https://www.example.com/?q={{value}}',
          labelTemplate: '標籤模板',
          labelTemplatePlaceholder: '{{value}}',
        },
      },
    },
  },
};

export default zh_HK;