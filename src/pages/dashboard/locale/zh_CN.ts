const zh_CN = {
  title: '监控仪表盘',
  name: '仪表盘名称',
  tags: '分类标签',
  ident: '英文标识',
  ident_msg: '请输入英文字母、数字、中划线',
  search_placeholder: '仪表盘名称、分类标签',
  refresh_tip: '刷新间隔小于 step({{num}}s) 将不会更新数据',
  refresh_btn: '刷新',
  share_btn: '分享',
  export_btn: '导出（CSV）',
  clear_cache_btn: '清除缓存',
  clear_cache_btn_tip: '清除表格列宽缓存，刷新页面后生效',
  inspect_btn: '排查',
  public: {
    name: '公开',
    unpublic: '不公开',
    public_cate: '类型',
    cate: {
      0: '匿名访问',
      1: '登录访问',
      2: '授权访问',
    },
    bgids: '授权业务组',
  },
  default_filter: {
    title: '预置筛选',
    public: '公开仪表盘',
    all: '所属业务组仪表盘',
    all_tip: '此选项会展示您所在业务组下关联的所有仪表盘',
  },
  create_title: '创建仪表盘',
  edit_title: '编辑仪表盘',
  add_panel: '添加图表',
  cluster: '集群', // TODO: 监控仪表盘暂时使用
  full_screen: '全屏',
  exit_full_screen: '退出全屏',
  copyPanelTip: '图表已复制。单击 "添加图表" 进行粘贴。',
  batch: {
    import: '导入仪表盘',
    label: '仪表盘 JSON',
    import_grafana: '导入 Grafana 仪表盘',
    import_grafana_tip: '导入完的图表只支持夜莺目前支持的图表类型和功能，<a>问题反馈</a>',
    import_grafana_tip_version_error: '不支持导入小于 v7 版本的仪表盘配置',
    import_grafana_tip_version_warning: '导入小于 v8 版本的仪表盘配置，可能会有部分图表不支持，以及图表无法正常渲染问题',
    continueToImport: '继续导入',
    noSelected: '请选择仪表盘',
    import_builtin: '导入内置仪表盘',
    import_builtin_board: '内置仪表盘',
    clone: {
      name: '名称',
      result: '结果',
      errmsg: '错误信息',
    },
  },
  link: {
    title: '仪表盘链接',
    name: '链接名称',
    url: '链接地址',
    url_tip: `
      变量使用说明
      <1 />
      \${variable_name}: 显示仪表盘变量值
      <1 />
      \${__field.name}: 显示序列的名称
      <1 />
      \${__field.value}: 显示序列的数值
      <1 />
      \${__field.labels.X}: 显示指定的标签值
      <1 />
      \${__field.labels.__name__}: 显示指标名
      <1 />
      \${__from}: 起始时间, 毫秒
      <1 />
      \${__from_date_seconds}: 起始时间, 秒
      <1 />
      \${__from_date_iso}: 起始时间, ISO 8601/RFC 3339
      <1 />
      上面语法适用于 \${__to}
      `,
    isNewBlank: '是否新窗口打开',
  },
  var: {
    btn: '添加变量',
    title: {
      list: '变量列表',
      add: '添加变量',
      edit: '编辑变量',
    },
    name: '变量名称',
    name_msg: '仅支持数字和字符下划线',
    label: '显示名称',
    type: '变量类型',
    type_map: {
      query: '查询 (Query)',
      custom: '自定义 (Custom)',
      textbox: '文本框 (Text box)',
      constant: '常量 (Constant)',
      datasource: '数据源 (Datasource)',
      hostIdent: '机器标识 (Host ident)',
      businessGroupIdent: '业务组标识 (Business group ident)',
    },
    hide: '隐藏变量',
    hide_map: {
      yes: '是',
      no: '否',
    },
    definition: '变量定义',
    definition_msg1: '请输入变量定义',
    definition_msg2: '变量定义必须是合法的JSON',
    reg: '正则',
    reg_tip: '可选，可通过正则来过滤可选项，或提取值。这里是填写的<a>正则表达式字面量</a>，其由包含在斜杠之间的模式组成',
    multi: '多选',
    allOption: '包含全选',
    allValue: '自定义全选值',
    textbox: {
      defaultValue: '默认值',
      defaultValue_tip: '可选，仅作为初次加载时的默认值',
    },
    custom: {
      definition: '逗号分割的自定义值',
    },
    constant: {
      definition: '常量值',
      defaultValue_tip: '定义一个隐藏的常量值',
    },
    datasource: {
      definition: '数据源类型',
      defaultValue: '默认值',
      regex: '数据源过滤',
      regex_tip: '可选，可通过正则来过滤可选项。这里是填写的<a>正则表达式字面量</a>，其由包含在斜杠之间的模式组成。',
    },
    businessGroupIdent: {
      ident: '业务组标识',
      invalid: '没有找到当前业务组的标识，请先先去业务组管理设置',
    },
  },
  row: {
    edit_title: '编辑分组',
    delete_title: '删除分组',
    name: '分组名称',
    delete_confirm: '确认删除分组吗？',
    cancel: '取消',
    ok: '删除分组和图表',
    ok2: '仅删除分组',
  },
  panel: {
    title: {
      add: '添加图表',
      edit: '编辑图表',
    },
    base: {
      title: '面板配置',
      name: '标题',
      name_tip: '表格类型的图表必须设置标题，否则面板编辑会跟表格表头冲突',
      link: {
        label: '链接',
        btn: '添加',
        name: '链接名称',
        name_msg: '请输入链接名称',
        url: '链接地址',
        url_msg: '请输入链接地址',
        isNewBlank: '是否新窗口打开',
      },
      description: '备注',
      repeatOptions: {
        title: '图表重复',
        byVariable: '变量',
        byVariableTip: '根据变量的值来重复图表',
        maxPerRow: '每行最多显示',
      },
    },
    options: {
      legend: {
        displayMode: {
          label: '显示模式',
          table: '表格',
          list: '列表',
          hidden: '隐藏',
        },
        placement: '位置',
        max: '最大值',
        min: '最小值',
        avg: '平均值',
        sum: '汇总值',
        last: '当前值',
        columns: '显示列',
        behaviour: {
          label: '单击触发行为',
          showItem: '显示项目',
          hideItem: '隐藏项目',
        },
        heightInPercentage: '高度百分比',
        heightInPercentage_tip: 'Legend 高度占据面板的最大高度百分比，最小值为 20%，最大值为 80%',
      },
      thresholds: {
        title: '阈值',
        btn: '添加',
      },
      tooltip: {
        mode: '模式',
        sort: '排序',
      },
      valueMappings: {
        title: '值映射',
        btn: '添加',
        type: '条件',
        type_tip: `
          <0>范围值默认值: from=-Infinity; to=Infinity </0>
          <1>特殊值Null说明: 匹配值为 null 或 undefined 或 no data</1>
        `,
        type_map: {
          special: '固定值(数值)',
          textValue: '固定值(文本值)',
          range: '范围值',
          specialValue: '特殊值',
        },
        value_placeholder: '精准匹配的值',
        text: '显示文字',
        text_placeholder: '可选',
        color: '颜色',
        operations: '操作',
      },
      colors: {
        name: '颜色设置',
        scheme: '颜色方案',
        reverse: '反转颜色',
      },
    },
    standardOptions: {
      title: '高级设置',
      unit: '单位',
      unit_tip: `
        <0>默认会做 SI Prefixes 处理，如不想默认的处理可选择 none 关闭</0>
        <1>Data(SI): 基数为 1000, 单位为 B、kB、MB、GB、TB、PB、EB、ZB、YB</1>
        <2>Data(IEC): 基数为 1024, 单位为 B、KiB、MiB、GiB、TiB、PiB、EiB、ZiB、YiB</2>
        <3>bits: b</3>
        <4>bytes: B</4>
      `,
      datetime: '时间格式化',
      min: '最小值',
      max: '最大值',
      decimals: '小数位数',
      displayName: '显示名称',
      displayName_tip: '自定义系列名称',
    },
    overrides: {
      matcher: {
        id: '匹配类型',
        byFrameRefID: {
          option: '根据查询条件名称',
          name: '查询条件名称',
        },
        byName: {
          option: '根据字段名',
          name: '字段名',
        },
      },
    },
    custom: {
      title: '图表样式',
      calc: '取值计算',
      calc_tip: '时序数据需要对所有时间点数据做取值计算，非时序数据忽略此设置',
      maxValue: '最大值',
      baseColor: '基础颜色',
      serieWidth: '序列名宽度',
      sortOrder: '排序',
      textMode: '显示内容',
      valueAndName: '值和名称',
      value: '值',
      name: '名称',
      background: '背景',
      colorMode: '颜色模式',
      valueField: '值字段',
      valueField_tip: 'Value 是保留关键字，作为时序数据取值计算后的字段名',
      valueField_tip2: '需选择值为数值类型的字段',
      colSpan: '每行最多显示',
      colSpanTip: '即将废弃，选择"自动"选项将使用下方的布局方向设置',
      colSpanAuto: '自动',
      textSize: {
        title: '标题字体大小',
        value: '值字体大小',
      },
      colorRange: '颜色', // hexbin
      reverseColorOrder: '反转颜色', // hexbin
      colorDomainAuto: '自动 min/max 值', // hexbin
      colorDomainAuto_tip: '默认自动从 series 里面取 min max 值', // hexbin
      fontBackground: '文字背景色', // hexbin
      detailName: '链接名称',
      detailUrl: '链接地址',
      stat: {
        graphMode: '图表模式',
        none: '不显示',
        area: '迷你图',
        orientation: '布局方向',
        orientationTip: '选择"自动"时，会根据图表的宽高自动选择布局方向',
        orientationValueMap: {
          auto: '自动',
          vertical: '垂直',
          horizontal: '水平',
        },
      },
      pie: {
        legengPosition: '图例位置', // pie
        max: '最多展示块数',
        max_tip: '超过的块数则合并展示为其他',
        donut: '环图模式',
        labelWithName: 'label是否包含名称',
        labelWithValue: 'label显示指标值',
        detailName: '链接名称',
        detailUrl: '链接地址',
      },
      table: {
        displayMode: '显示模式',
        showHeader: '显示表头',
        seriesToRows: '每行展示 serie 的值',
        labelsOfSeriesToRows: '每行展示 labels 的值',
        labelValuesToRows: '每行展示指定聚合维度的值',
        columns: '显示列',
        aggrDimension: '显示维度',
        sortColumn: '默认排序列',
        sortOrder: '默认排序',
        link: {
          mode: '链接模式',
          cellLink: '单元格链接',
          appendLinkColumn: '追加链接列',
        },
        tableLayout: {
          label: '表格布局',
          label_tip: '固定布局下列默认宽度根据列数量等分不会产生横向滚动条。自动布局下列默认最大宽度为 150px 表格内容可能会溢出从而产生横向滚动条。',
          auto: '自动',
          fixed: '固定',
        },
        nowrap: '单元格不换行',
        organizeFields: '字段整理',
        colorMode_tip: '颜色模式是针对 "值字段" 的颜色设置。值模式下颜色作用于值文字；背景模式下颜色作用于字段所在单元格背景色。',
      },
      text: {
        textColor: '文字颜色',
        textDarkColor: '暗黑文字颜色',
        bgColor: '背景颜色',
        textSize: '文字大小',
        justifyContent: {
          name: '水平对齐',
          unset: '不设置',
          flexStart: '左对齐',
          center: '居中',
          flexEnd: '右对齐',
        },
        alignItems: {
          name: '垂直对齐',
          unset: '不设置',
          flexStart: '顶部对齐',
          center: '居中',
          flexEnd: '底部对齐',
        },
        content: '内容',
        content_placeholder: '支持 Markdown 和 HTML',
        content_tip: `
          <0>默认简单模式，可通过上方设置简单配置卡片样式</0>
          <1>支持 Markdown 和 HTML</1>
          <2>如输入 Markdown 或 HTML 建议关闭上方的对齐设置</2>
        `,
      },
      timeseries: {
        drawStyle: '绘制模式',
        lineInterpolation: '线条插值',
        spanNulls: '连接空值',
        spanNulls_0: '关闭',
        spanNulls_1: '开启',
        lineWidth: '曲线宽度',
        fillOpacity: '透明度',
        gradientMode: '渐变',
        gradientMode_opacity: '开启',
        gradientMode_none: '关闭',
        stack: '堆叠',
        stack_noraml: '开启',
        stack_off: '关闭',
        yAxis: {
          title: 'Y轴设置',
          rightYAxis: {
            label: '右侧Y轴显示',
            noraml: '开启',
            off: '关闭',
          },
        },
        showPoints: '显示点',
        showPoints_always: '显示',
        showPoints_none: '不显示',
        pointSize: '点大小',
      },
      iframe: {
        src: 'iframe 地址',
      },
      heatmap: {
        xAxisField: 'X轴',
        yAxisField: 'Y轴',
        valueField: '数值列',
      },
      barchart: {
        xAxisField: 'X轴',
        yAxisField: 'Y轴',
        colorField: '颜色字段',
        barMaxWidth: '条形最大宽度',
        colorField_tip: 'Name 是保留关键字，作为序列名值的字段名',
      },
    },
    inspect: {
      title: '排查',
      query: '查询',
      json: '图表配置',
    },
  },
  export: {
    copy: '复制 JSON 内容到剪贴板',
  },
  query: {
    title: '查询条件',
    transform: '数据转换',
    datasource_placeholder: '请选择数据源',
    datasource_msg: '请选择数据源',
    time: '时间选择',
    time_tip: '可指定时间范围，默认为仪表盘全局时间范围',
    prometheus: {
      maxDataPoints: {
        tip: '每条曲线最多的点数，计算 step = (end - start) / maxDataPoints，默认值为 240 在最近 1 小时内的 step = 15s',
      },
      minStep: {
        tip: '最小的 step，计算 step = max(step, minStep, safeStep)，safeStep = (end - start) / 11000',
      },
      step: {
        tag_tip: '计算 step = max((end - start) / maxDataPoints, minStep, safeStep), safeStep = (end - start) / 11000',
      },
    },
    expression_placeholder: '对一个或多个查询进行数学运算。您通过 ${refId} 引用查询，即 $A、$B、$C 等。两个标量值的总和：$A + $B > 10',
    legendTip: '图例名称的覆盖或模板，例如 {{hostname}} 将替换为 hostname 标签的值',
    legendTip2: '图例名称的覆盖或模板，例如 {{hostname}} 将替换为 hostname 标签的值，目前只在时序数据下生效',
  },
  detail: {
    datasource_empty: '没有数据源信息，请先配置数据源',
    invalidTimeRange: '无效的 __from 和 __to 值',
    invalidDatasource: '无效的数据源',
    fullscreen: {
      notification: {
        esc: '按 ESC 键退出全屏模式',
        theme: '主题切换',
      },
    },
    saved: '保存成功',
    expired: '仪表盘已经被别人修改，为避免相互覆盖，请刷新仪表盘查看最新配置和数据',
    prompt: {
      title: '有更改未保存',
      message: '您想保存更改吗？',
      cancelText: '取消',
      discardText: '放弃',
      okText: '保存',
    },
    noPanelToPaste: '没有可粘贴的图表',
  },
  settings: {
    graphTooltip: {
      label: '提示信息 (Tooltip)',
      tip: '控制所有图表的提示信息 (Tooltip) 行为',
      default: '默认',
      sharedCrosshair: '共享十字线',
      sharedTooltip: '共享提示信息 (Tooltip)',
    },
    graphZoom: {
      label: '缩放行为',
      tip: '控制所有图表的缩放行为',
      default: '默认',
      updateTimeRange: '更新时间范围',
    },
  },
  visualizations: {
    timeseries: '时序图',
    barchart: '柱状图',
    stat: '指标值',
    table: '表格',
    pie: '饼图',
    hexbin: '蜂窝图',
    barGauge: '排行榜',
    text: '文本卡片',
    gauge: '仪表图',
    heatmap: '色块图',
    iframe: '内嵌文档(iframe)',
    row: '分组',
    pastePanel: '粘贴图表',
  },
  calcs: {
    lastNotNull: '最后一个非空值',
    last: '最后一个值',
    firstNotNull: '第一个非空值',
    first: '第一个值',
    min: '最小值',
    max: '最大值',
    avg: '平均值',
    sum: '总和',
    count: '数量',
    origin: '原始值',
  },
};
export default zh_CN;
