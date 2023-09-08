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
  inspect_btn: '排查',
  public: {
    name: '公开',
    0: {
      confirm: '确认公开吗？',
      success: '公开成功',
    },
    1: {
      confirm: '确认取消公开吗？',
      success: '取消公开成功',
    },
  },
  create_title: '创建仪表盘',
  edit_title: '编辑仪表盘',
  add_panel: '添加图表',
  cluster: '集群', // TODO: 监控仪表盘暂时使用
  full_screen: '全屏',
  exit_full_screen: '退出全屏',
  batch: {
    import: '导入仪表盘 JSON',
    label: '仪表盘 JSON',
    import_grafana: '导入 Grafana 仪表盘 JSON',
    import_grafana_tip: '目前只支持导入 v8+ 版本的仪表盘配置，导入完的图表只支持夜莺目前支持的图表类型和功能',
    import_grafana_tip_version_error: '不支持导入小于 v7 版本的仪表盘配置',
    import_grafana_tip_version_warning: '导入小于 v8 版本的仪表盘配置，可能会有部分图表不支持，以及图表无法正常渲染问题',
    continueToImport: '继续导入',
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
    hide: '隐藏变量',
    definition: '变量定义',
    reg: '正则',
    reg_tip: '可选，可通过正则来过滤可选项，或提取值',
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
      regex_tip: '可选，可通过正则来过滤可选项',
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
          special: '固定值',
          range: '范围值',
          specialValue: '特殊值',
        },
        text: '显示文字',
        text_placeholder: '可选',
        color: '颜色',
        operations: '操作',
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
    },
    overrides: {
      matcher: '查询条件名称',
    },
    custom: {
      title: '图表样式',
      calc: '取值计算',
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
      colSpan: '每行最多显示',
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
      },
      text: {
        textColor: '文字颜色',
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
      },
      iframe: {
        src: 'iframe 地址',
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
    prometheus: {
      time: '时间选择',
      time_tip: '可指定时间范围，默认为仪表盘全局时间范围',
    },
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
  },
};
export default zh_CN;
