const zh_CN = {
  es: {
    ref: '名称',
    index: '索引',
    index_tip: `
      支持多种配置方式
      <1 />
      1. 指定单个索引 gb 在 gb 索引中搜索所有的文档
      <1 />
      2. 指定多个索引 gb,us 在 gb 和 us 索引中搜索所有的文档
      <1 />
      3. 指定索引前缀 g*,u* 在任何以 g 或者 u 开头的索引中搜索所有的文档
      <1 />
      `,
    index_msg: '索引不能为空',
    indexPatterns: '索引模式',
    indexPattern_msg: '索引模式不能为空',
    indexPatterns_manage: '管理索引模式',
    filter: '过滤条件',
    time_label: '时间颗粒度',
    date_field: '日期字段',
    date_field_msg: '日期字段不能为空',
    interval: '时间间隔',
    value: '数值提取',
    func: '函数',
    funcField: '字段名',
    terms: {
      label: '根据指定 field 分组',
      more: '高级设置',
      size: '匹配个数',
      min_value: '文档最小值',
    },
    raw: {
      limit: '日志条数',
      date_format: '日期格式',
      date_format_tip: '使用 Moment.js 格式模式，比如 YYYY-MM-DD HH:mm:ss.SSS',
    },
    alert: {
      query: {
        title: '查询统计',
        preview: '数据预览',
      },
      trigger: {
        title: '告警条件',
        builder: '简单模式',
        code: '表达式模式',
        label: '关联 Label',
      },
      prom_eval_interval_tip: '每隔 {{num}} 秒，去查询后端存储',
      prom_for_duration_tip:
        '通常持续时长大于执行频率，在持续时长内按照执行频率多次执行查询，每次都触发才生成告警；如果持续时长置为0，表示只要有一次查询的数据满足告警条件，就生成告警',
      advancedSettings: '高级设置',
      delay: '延迟执行',
    },
    event: {
      groupBy: `根据 {{field}} 分组，匹配个数 {{size}}, 文档最小值 {{min_value}}`,
      logs: {
        title: '日志详情',
        size: '结果数',
        fields: '筛选字段',
        jsonParseError: '解析失败',
      },
    },
    syntaxOptions: '语法选项',
    queryFailed: '查询失败，请稍后重试',
    offset_tip: '用于查询指定时间段之前的数据，类似 PromQL 中的 offset，单位为秒',
  },
  datasource: {
    max_query_rows: '单次请求允许检索的最大行数',
    max_idle_conns: '最大空闲连接数',
    max_open_conns: '最大打开连接数',
    conn_max_lifetime: '连接最大生存时间（单位: 秒）',
    timeout: '超时时间（单位: 秒）',
    timeout_ms: '超时时间（单位: 毫秒）',
  },
  query: {
    title: '查询统计',
    execute: '查询',
    query: '查询条件',
    query_required: '查询条件不能为空',
    query_placeholder: '输入 SQL 进行查询，按 Shift+Enter 换行',
    query_placeholder2: '按 Shift+Enter 换行',
    advancedSettings: {
      title: '辅助配置',
      tags_placeholder: '回车输入多个',
      valueKey: '值字段',
      valueKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列的值作为曲线展示在图表上',
      valueKey_required: '值字段不能为空',
      labelKey: '标签字段',
      labelKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列作为曲线的标签元信息',
    },
  },
};
export default zh_CN;
