const zh_CN = {
  es: {
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
    filter: '过滤条件',
    time_label: '时间颗粒度',
    date_field: '日期字段',
    date_field_msg: '日期字段不能为空',
    interval: '时间间隔',
    value: '数值提取',
    terms: {
      more: '高级设置',
      size: '匹配个数',
      min_value: '文档最小值',
    },
    raw: {
      limit: '日志条数',
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
    },
  },
};
export default zh_CN;
