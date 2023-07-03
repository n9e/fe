const zh_HK = {
  title: '監控儀表盤',
  name: '儀表盤名稱',
  tags: '分類標籤',
  ident: '英文標識',
  ident_msg: '請輸入英文字母、數字、中劃線',
  search_placeholder: '儀表盤名稱、分類標籤',
  refresh_tip: '重新整理間隔小於 step({{num}}s) 將不會更新資料',
  refresh_btn: '重新整理',
  share_btn: '分享',
  public: {
    '0': {
      confirm: '確認公開嗎？',
      success: '公開成功',
    },
    '1': {
      confirm: '確認取消公開嗎？',
      success: '取消公開成功',
    },
    name: '公開',
  },
  create_title: '建立儀表盤',
  edit_title: '編輯儀表盤',
  add_panel: '新增圖表',
  cluster: '叢集',
  full_screen: '全屏',
  exit_full_screen: '退出全屏',
  batch: {
    import: '匯入儀表盤 JSON',
    label: '儀表盤 JSON',
    import_grafana: '匯入 Grafana 儀表盤 JSON',
    import_grafana_tip: '目前只支援匯入 v8+ 版本的儀表盤配置，匯入完的圖表只支援夜鶯目前支援的圖表型別和功能',
  },
  link: {
    title: '儀表盤連結',
    name: '連結名稱',
    url: '連結地址',
    url_tip: `
      變數使用說明
      <1/>
      \${variable_name}: 顯示儀表盤變數值
      <1/>
      \${__field.name}: 顯示序列的名稱
      <1/>
      \${__field.value}: 顯示序列的數值
      <1/>
      \${__field.labels.X}: 顯示指定的標籤值
      <1/>
      \${__field.labels.__name__}: 顯示指標名
      <1/>
      \${__from}: 起始時間, 毫秒
      <1/>
      \${__from_date_seconds}: 起始時間, 秒
      <1/>
      \${__from_date_iso}: 起始時間, ISO 8601/RFC 3339
      <1/>
      上面語法適用於 \${__to}
    `,
    isNewBlank: '是否新視窗開啟',
  },
  var: {
    btn: '新增變數',
    title: {
      list: '變數列表',
      add: '新增變數',
      edit: '編輯變數',
    },
    name: '變數名稱',
    name_msg: '僅支援數字和字元下劃線',
    label: '顯示名稱',
    type: '變數型別',
    hide: '隱藏變數',
    definition: '變數定義',
    reg: '正則',
    reg_tip: '可選，可通過正則來過濾可選項，或提取值',
    multi: '多選',
    allOption: '包含全選',
    allValue: '自定義全選值',
    textbox: {
      defaultValue: '預設值',
      defaultValue_tip: '可選，僅作為初次加載時的默認值',
    },
    custom: {
      definition: '逗號分割的自定義值',
    },
    constant: {
      definition: '常量值',
      defaultValue_tip: '定義一個隱藏的常量值',
    },
    datasource: {
      definition: '資料來源型別',
      defaultValue: '預設值',
      regex: '數據源過濾',
      regex_tip: '可選，可通過正則來過濾可選項，或提取值',
    },
  },
  row: {
    edit_title: '編輯分組',
    delete_title: '刪除分組',
    name: '分組名稱',
    delete_confirm: '確認刪除分組嗎？',
    cancel: '取消',
    ok: '刪除分組和圖表',
    ok2: '僅刪除分組',
  },
  panel: {
    title: {
      add: '新增圖表',
      edit: '編輯圖表',
    },
    base: {
      title: '面板配置',
      name: '標題',
      name_tip: '表格型別的圖表必須設定標題，否則面板編輯會跟表格表頭衝突',
      link: {
        label: '連結',
        btn: '新增',
        name: '連結名稱',
        name_msg: '請輸入連結名稱',
        url: '連結地址',
        url_msg: '請輸入連結地址',
        isNewBlank: '是否新視窗開啟',
      },
      description: '備註',
    },
    options: {
      legend: {
        displayMode: {
          label: '顯示模式',
          table: '表格',
          list: '列表',
          hidden: '隱藏',
        },
        placement: '位置',
        max: '最大值',
        min: '最小值',
        avg: '平均值',
        sum: '彙總值',
        last: '當前值',
        columns: '顯示列',
      },
      thresholds: {
        title: '閾值',
        btn: '新增',
      },
      tooltip: {
        mode: '模式',
        sort: '排序',
      },
      valueMappings: {
        title: '值對映',
        btn: '新增',
        type: '條件',
        type_tip: `
          <0>範圍值預設值： from=-Infinity; to=Infinity </0>
          <1>特殊值 Null 說明： 匹配值為 null 或 undefined 或 no data</1>
        `,
        type_map: {
          special: '固定值',
          range: '範圍值',
          specialValue: '特殊值',
        },
        text: '顯示文字',
        text_placeholder: '可選',
        color: '顏色',
        operations: '操作',
      },
    },
    standardOptions: {
      title: '高階設定',
      unit: '單位',
      unit_tip: `
        <0>預設會做 SI Prefixes 處理，如不想預設的處理可選擇 none 關閉</0>
        <1>Data(SI): 基數為 1000, 單位為 B、kB、MB、GB、TB、PB、EB、ZB、YB</1>
        <2>Data(IEC): 基數為 1024, 單位為 B、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB</2>
        <3>bits: b</3>
        <4>bytes: B</4>
      `,
      datetime: '時間格式化',
      min: '最小值',
      max: '最大值',
      decimals: '小數位數',
    },
    overrides: {
      matcher: '查詢條件名稱',
    },
    custom: {
      title: '圖表樣式',
      calc: '取值計算',
      maxValue: '最大值',
      baseColor: '基礎顏色',
      serieWidth: '序列名寬度',
      sortOrder: '排序',
      textMode: '顯示內容',
      valueAndName: '值和名稱',
      value: '值',
      name: '名稱',
      background: '背景',
      colorMode: '顏色模式',
      valueField: '值欄位',
      colSpan: '每行最多顯示',
      textSize: {
        title: '標題字型大小',
        value: '值字型大小',
      },
      colorRange: '顏色',
      reverseColorOrder: '反轉顏色',
      colorDomainAuto: '自動 min/max 值',
      colorDomainAuto_tip: '預設自動從 series 裏面取 min max 值',
      detailName: '連結名稱',
      detailUrl: '連結地址',
      pie: {
        legengPosition: '圖例位置',
        max: '最多展示塊數',
        max_tip: '超過的塊數則合併展示為其他',
        donut: '環圖模式',
        labelWithName: 'label 是否包含名稱',
        labelWithValue: 'label 顯示指標值',
        detailName: '連結名稱',
        detailUrl: '連結地址',
      },
      table: {
        displayMode: '顯示模式',
        showHeader: '顯示錶頭',
        seriesToRows: '每行展示 serie 的值',
        labelsOfSeriesToRows: '每行展示 labels 的值',
        labelValuesToRows: '每行展示指定聚合維度的值',
        columns: '顯示列',
        aggrDimension: '顯示維度',
        sortColumn: '預設排序列',
        sortOrder: '預設排序',
      },
      text: {
        textColor: '文字顏色',
        bgColor: '背景顏色',
        textSize: '文字大小',
        justifyContent: {
          name: '水平對齊',
          unset: '不設定',
          flexStart: '左對齊',
          center: '居中',
          flexEnd: '右對齊',
        },
        alignItems: {
          name: '垂直對齊',
          unset: '不設定',
          flexStart: '頂部對齊',
          center: '居中',
          flexEnd: '底部對齊',
        },
        content: '內容',
        content_placeholder: '支援 Markdown 和 HTML',
        content_tip: `
          <0>預設簡單模式，可通過上方設定簡單配置卡片樣式</0>
          <1>支援 Markdown 和 HTML</1>
          <2>如輸入 Markdown 或 HTML 建議關閉上方的對齊設定</2>
        `,
      },
      timeseries: {
        drawStyle: '繪製模式',
        lineInterpolation: '線條插值',
        spanNulls: '連線空值',
        spanNulls_0: '關閉',
        spanNulls_1: '開啟',
        lineWidth: '曲線寬度',
        fillOpacity: '透明度',
        gradientMode: '漸變',
        gradientMode_opacity: '開啟',
        gradientMode_none: '關閉',
        stack: '堆疊',
        stack_noraml: '開啟',
        stack_off: '關閉',
      },
      iframe: {
        src: 'iframe 地址',
      },
    },
  },
  export: {
    copy: '複製 JSON 內容到剪貼簿',
  },
  query: {
    title: '查詢條件',
    transform: '資料轉換',
    datasource_placeholder: '請選擇資料來源',
    datasource_msg: '請選擇資料來源',
    prometheus: {
      time: '時間選擇',
      time_tip: '可指定時間範圍，預設為儀表盤全域性時間範圍',
      step_tip: '可指定 step，預設為儀表盤全域性 step',
    },
  },
  detail: {
    datasource_empty: '沒有資料來源資訊，請先配置資料來源',
  },
};

export default zh_HK;
