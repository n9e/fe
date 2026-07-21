const zh_CN = {
  preview: '数据预览',
  query: {
    title: '查询统计',
    execute: '查询',
    project: '项目',
    project_msg: '请选择项目',
    project_tip: `
      <1>项目是日志服务的资源管理单元，是进行多用户隔离与访问控制的主要边界。更多信息，请参见<1>
      <2>项目</2>
    `,
    logstore: '日志库',
    logstore_msg: '请选择日志库',
    logstore_tip: `
      <1>日志库是日志服务中日志数据的采集、存储和查询单元。更多信息，请参见<1>
      <2>日志库</2>
    `,
    range: '查询区间',
    power_sql: 'SQL增强',
    query: 'SQL',
    query_msg: '请输入SQL',
    query_tip1: 'TDengine 查询语法可参考',
    query_tip2: '官方文档',
    sqlTemplates: '查询模板',
    sqlTemplates_tip: '以下 SQL 查询条件仅供参考，在实际使用的时候，需要将其中的 $变量 替换为实际的值',
    mode: {
      timeSeries: '时序值',
      raw: '日志原文',
    },
    advancedSettings: {
      title: '辅助配置',
      metricKey_label: '值字段',
      metricKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列的值作为曲线展示在图表上',
      tags_placeholder: '回车输入多个',
      labelKey_label: '标签字段',
      labelKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列作为曲线的标签元信息',
      timeKey_tip: '指定哪个字段是时间字段，作为绘制曲线图的x轴坐标',
      timeFormat_tip: '时间的格式，会根据此格式将时间转为时间戳',
    },
    schema: '元信息',
    table: '普通表',
    stable: '超级表',
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
};
export default zh_CN;
