const zh_CN = {
  es: {
    index: '索引',
    index_tip: `
      支持多种配置方式
      <br />
      1. 指定单个索引 gb 在 gb 索引中搜索所有的文档
      <br />
      2. 指定多个索引 gb,us 在 gb 和 us 索引中搜索所有的文档
      <br />
      3. 指定索引前缀 g*,u* 在任何以 g 或者 u 开头的索引中搜索所有的文档
      <br />
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
  },
};
export default zh_CN;
