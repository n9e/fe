const zh_CN = {
  preview: '数据预览',
  query: {
    title: '查询统计',
    execute: '查询',
    range: '查询区间',
    power_sql: 'SQL增强',
    query: '查询条件',
    query_msg: '请输入查询条件',
    query_tip1: 'IoTDB 查询语法可参考',
    query_tip2: '官方文档',
    sqlTemplates: '查询模板',
    sqlTemplates_tip: '以下 SQL 查询条件仅供参考，在实际使用的时候，需要将其中的 $变量 替换为实际的值',
    sqlTemplates_load_failed: '查询模板加载失败',
    previewFailed: '数据预览失败',
    loadSchemaFailed: '元信息加载失败',
    mode: {
      timeSeries: '时序值',
      raw: '日志原文',
    },
    advancedSettings: {
      title: '辅助配置',
      metricKey_tip: '通过此字段可以指定将哪些字段作为 metricName。',
      tags_placeholder: '回车输入多个',
      labelKey_tip: '通过此字段可以指定将哪些字段作为 labelName。',
      timeKey_tip: '指定哪个字段是时间字段，作为绘制曲线图的x轴坐标',
      timeFormat_tip: '时间的格式，会根据此格式将时间转为时间戳',
    },
    schema: '元信息',
    table: '表',
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
};

export default zh_CN;
