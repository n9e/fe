const zh_CN = {
  preview: '数据预览',
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
    schema: '元信息',
    document: '使用文档',
    dashboard: {
      mode: {
        label: '查询模式',
        table: '非时序数据',
        timeSeries: '时序数据',
      },
    },
    historicalRecords: {
      button: '历史记录',
      searchPlaceholder: '搜索历史记录',
    },
    compass_btn_tip: '点击查看表数据',
  },
  trigger: {
    title: '告警条件',
    value_msg: '请输入表达式值',
  },
  datasource: {
    max_query_rows: '单次请求允许检索的最大行数',
  },
};
export default zh_CN;
