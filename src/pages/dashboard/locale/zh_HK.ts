const zh_HK = {
  title: '監控儀表盤',
  name: '儀表盤名稱',
  tags: '分類標籤',
  ident: '英文標識',
  ident_msg: '請輸入英文字母、數字、中劃線',
  search_placeholder: '儀表盤名稱、分類標籤',
  refresh_tip: '刷新間隔小於 step({{num}}s) 將不會更新資料',
  refresh_btn: '刷新',
  share_btn: '分享',
  export_btn: '匯出（CSV）',
  clear_cache_btn: '清除缓存',
  clear_cache_btn_tip: '清除表格列寬缓存，刷新頁面後生效',
  inspect_btn: '排查',
  public: {
    name: '公開',
    unpublic: '未公開',
    cate: {
      0: '匿名訪問',
      1: '登錄訪問',
      2: '授權訪問',
    },
    bgids: '授權業務組',
  },
  default_filter: {
    title: '預置篩選',
    public: '公開儀表盤',
    all: '所屬業務組儀錶板',
    all_tip: '此選項會顯示您所在業務群組下關聯的所有儀表板',
  },
  create_title: '創建儀表盤',
  edit_title: '編輯儀表盤',
  add_panel: '新增圖表',
  cluster: '叢集',
  full_screen: '全屏',
  exit_full_screen: '退出全屏',
  copyPanelTip: '圖表已複製。點擊 "添加圖表" 進行貼上。',
  batch: {
    import: '匯入儀表盤',
    label: '儀表盤 JSON',
    import_grafana: '匯入 Grafana 儀表盤',
    import_grafana_tip: '匯入完的圖表只支援夜鶯目前支援的圖表類型和功能, <a>問題反饋</a>',
    import_grafana_tip_version_error: '不支援匯入小於 v7 版本的儀表盤配置',
    import_grafana_tip_version_warning: '匯入的儀表盤配置版本小於 v8，部分圖表可能無法正常顯示，是否繼續匯入？',
    continueToImport: '繼續匯入',
    noSelected: '請選擇儀表盤',
    import_builtin: '匯入內置儀表盤',
    import_builtin_board: '內置儀表盤',
    clone: {
      name: '名稱',
      result: '結果',
      errmsg: '錯誤信息',
    },
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
    type: '變數類型',
    type_map: {
      query: '查詢',
      custom: '自定義',
      textbox: '文本框',
      constant: '常量',
      datasource: '數據源',
      hostIdent: '主機標識',
      businessGroupIdent: '業務組標識',
    },
    hide: '隱藏變數',
    hide_map: {
      yes: '是',
      no: '否',
    },
    definition: '變數定義',
    definition_msg1: '請輸入變數定義',
    definition_msg2: '變數定義必須是合法的JSON',
    reg: '正則',
    reg_tip: '可選，可通過正則來過濾可選項，或提取值。這裡是填寫的<a>正規表示式字面量</a>，其由包含在斜線之間的模式組成',
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
      definition: '數據源類型',
      defaultValue: '預設值',
      regex: '數據源過濾',
      regex_tip: '可選，可通過正則來過濾可選項。這裡是填寫的<a>正規表示式字面量</a>，其由包含在斜線之間的模式組成',
    },
    businessGroupIdent: {
      ident: '業務組標識',
      invalid: '沒有找到目前業務組的標識，請先去業務組管理設置',
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
      name_tip: '表格類型的圖表必須設定標題，否則面板編輯會跟表格表頭衝突',
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
      repeatOptions: {
        title: '圖表重複',
        byVariable: '變量',
        byVariableTip: '根據變量的值來重複圖表',
        maxPerRow: '每行最多顯示',
      },
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
        behaviour: {
          label: '點擊觸發的行為',
          showItem: '显示项目',
          hideItem: '隐藏项目',
        },
        heightInPercentage: '高度百分比',
        heightInPercentage_tip: 'Legend 高度佔據面板的最大高度百分比，最小值為 20%，最大值為 80%',
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
          special: '固定值(數值)',
          textValue: '固定值(文字值)',
          range: '範圍值',
          specialValue: '特殊值',
        },
        value_placeholder: '精確匹配的值',
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
      displayName: '顯示名稱',
      displayName_tip: '自定義顯示名稱',
    },
    overrides: {
      matcher: {
        id: '匹配類型',
        byFrameRefID: {
          option: '根據查詢條件名稱',
          name: '查詢條件名稱',
        },
        byName: {
          option: '根據字段名',
          name: '字段名',
        },
      },
    },
    custom: {
      title: '圖表樣式',
      calc: '取值計算',
      calc_tip: '時序資料需要對所有時間點資料做取值計算，非時序資料忽略此設置',
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
      valueField: '值字段',
      valueField_tip: 'Value 是保留關鍵字，作為時序資料取值計算後的字段名',
      valueField_tip2: '需選擇值為數值類型的字段',
      colSpan: '每行最多顯示',
      colSpanTip: '即將廢棄，選擇"自動"選項將使用下方的佈局方向設置',
      colSpanAuto: '自動',
      textSize: {
        title: '標題字型大小',
        value: '值字型大小',
      },
      colorRange: '顏色',
      reverseColorOrder: '反轉顏色',
      colorDomainAuto: '自動 min/max 值',
      colorDomainAuto_tip: '預設自動從 series 裏面取 min max 值',
      fontBackground: '文字背景色',
      detailName: '連結名稱',
      detailUrl: '連結地址',
      stat: {
        graphMode: '圖表模式',
        none: '無',
        area: '迷你圖',
        orientation: '佈局方向',
        orientationTip: '選擇"自動"選項將根據圖表類型自動選擇佈局方向',
        orientationValueMap: {
          auto: '自動',
          vertical: '垂直',
          horizontal: '水平',
        },
      },
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
        link: {
          mode: '連結模式',
          cellLink: '單元格連結',
          appendLinkColumn: '追加連結列',
        },
        tableLayout: {
          label: '表格佈局',
          label_tip: '固定佈局下列預設寬度根據列數量等分不會產生橫向捲軸。自動佈局下列預設最大寬度為 150px 表格內容可能會溢位進而產生橫向捲軸。',
          auto: '自動',
          fixed: '固定',
        },
        nowrap: '單元格不換行',
        organizeFields: '組織字段',
        colorMode_tip: '顏色模式是針對 "值欄位" 的顏色設定。值模式下顏色作用於值文字；背景模式下顏色作用於欄位所在儲存格背景色。',
      },
      text: {
        textColor: '文字顏色',
        textDarkColor: '暗黑文字顏色',
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
        yAxis: {
          title: 'Y軸設定',
          rightYAxis: {
            label: '右側Y軸顯示',
            noraml: '開啟',
            off: '關閉',
          },
        },
        showPoints: '點顯示',
        showPoints_always: '顯示',
        showPoints_none: '不顯示',
        pointSize: '點大小',
      },
      iframe: {
        src: 'iframe 地址',
      },
      heatmap: {
        xAxisField: 'X軸',
        yAxisField: 'Y軸',
        valueField: '數值列',
      },
      barchart: {
        xAxisField: 'X轴',
        yAxisField: 'Y轴',
        colorField: '颜色字段',
        barMaxWidth: '條形最大寬度',
        colorField_tip: 'Name 是保留關鍵字，序列名值的欄位名稱',
      },
    },
    inspect: {
      title: '排查',
      query: '查詢',
      json: '圖表配置',
    },
  },
  export: {
    copy: '複製 JSON 內容到剪貼簿',
  },
  query: {
    title: '查詢條件',
    transform: '資料轉換',
    datasource_placeholder: '請選擇數據源',
    datasource_msg: '請選擇數據源',
    time: '時間選擇',
    time_tip: '可指定時間範圍，預設為儀表盤全域性時間範圍',
    prometheus: {
      maxDataPoints: {
        tip: '每條曲線最多的點數，計算 step = (end - start) / maxDataPoints，預設值為 240 在最近 1 小時內的 step = 15s',
      },
      minStep: {
        tip: '最小的 step，計算 step = max(step, minStep, safeStep)，safeStep = (end - start) / 11000',
      },
      step: {
        tag_tip: '計算 step = max((end - start) / maxDataPoints, minStep, safeStep), safeStep = (end - start) / 11000',
      },
    },
    expression_placeholder: '對一個或多個查詢進行數學運算。您透過 ${refId} 引用查詢，即 $A、$B、$C 等。兩個標量值的總和：$A + $B > 10',
    legendTip: '圖例名稱的覆寫或模板，例如 {{hostname}} 將替換為 hostname 標籤的值',
    legendTip2: '圖例名稱的覆寫或模板，例如 {{hostname}} 將替換為 hostname 標籤的值，目前只在時序資料下生效',
  },
  detail: {
    datasource_empty: '沒有數據源資訊，請先配置數據源',
    invalidTimeRange: '無效的 __from 和 __to 值',
    invalidDatasource: '無效的數據源',
    fullscreen: {
      notification: {
        esc: '按 ESC 鍵退出全螢幕模式',
        theme: '主題模式',
      },
    },
    saved: '保存成功',
    expired: '儀表板已經被別人修改，為避免相互覆蓋，請刷新儀表板查看最新配置和數據',
    prompt: {
      title: '有更改未儲存',
      message: '您想儲存變更嗎？',
      cancelText: '取消',
      discardText: '放棄',
      okText: '儲存',
    },
    noPanelToPaste: '沒有可粘貼的圖表',
  },
  settings: {
    graphTooltip: {
      label: '圖表提示信息 (Tooltip)',
      tip: '控制所有圖表的提示資訊 (Tooltip) 行為',
      default: '默認',
      sharedCrosshair: '共享十字線',
      sharedTooltip: '共享提示信息 (Tooltip)',
    },
    graphZoom: {
      label: '縮放方式',
      tip: '控制所有圖表的縮放行為',
      default: '默认',
      updateTimeRange: '更新時間範圍',
    },
  },
  visualizations: {
    timeseries: '時序圖',
    barchart: '柱狀圖',
    stat: '指標圖',
    table: '表格',
    pie: '餅圖',
    hexbin: '蜂窩圖',
    barGauge: '排行榜',
    text: '文本卡片',
    gauge: '儀表圖',
    heatmap: '色塊圖',
    iframe: '內嵌文檔(iframe)',
    row: '分組',
    pastePanel: '粘貼圖表',
  },
  calcs: {
    lastNotNull: '最後一個非空值',
    last: '最後一個值',
    firstNotNull: '第一個非空值',
    first: '第一個值',
    min: '最小值',
    max: '最大值',
    avg: '平均值',
    sum: '總和',
    count: '數量',
    origin: '原始值',
  },
};

export default zh_HK;
