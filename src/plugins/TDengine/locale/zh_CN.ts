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
    query: '查询条件',
    query_msg: '请输入查询条件',
    mode: {
      timeSeries: '时序值',
      raw: '日志原文',
    },
    advancedSettings: {
      title: '辅助配置',
      metricKey_tip:
        '通过此字段可以指定将哪些字段作为 metricName，默认会将数值类型的字段作为 metricName，例如查询的结果为used_percent:96 host:host01，used_percent将作为 metricName, value 为 96',
      tags_placeholder: '回车输入多个',
      labelKey_tip:
        '通过此字段可以指定将哪些字段作为 labelName，默认会将非数值类型的字段作为 labelName，例如查询的结果为used_percent:96 host:host01，host 将作为 label 的 name, host01 为 label 的值',
      timeKey_tip: '指定哪个字段是时间字段，作为绘制曲线图的x轴坐标',
      timeFormat_tip: '时间的格式，会根据此格式将时间转为时间戳',
    },
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
};
export default zh_CN;
