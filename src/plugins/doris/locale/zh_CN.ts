const zh_CN = {
  quick_query: '快捷查询',
  quick_query_tip: '快捷查询 根据固定的SQL模板，快速生成查询语句，比如字段A大于0，只需要输入 A > 0，通过点击该按钮可以快速切换到自定义模式，支持查看并修改SQL语句',
  custom_query: '自定义查询',
  custom_query_tip: '自定义查询 支持用户根据SQL语法自由输入查询语句',
  current_database: '当前数据库',
  table: '数据表',
  database_table_required: '请先选择数据库和数据表',
  query: {
    mode: {
      raw: '日志原文',
      metric: '统计图表',
    },
    time_field: '时间字段',
    time_field_msg: '请输入时间字段',
    sql_msg: '请输入SQL语句',
    execute: '查询',
    database: '数据库',
    advancedSettings: {
      title: '辅助配置',
      valueKey: '值字段',
      valueKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列的值作为曲线展示在图表上',
      valueKey_required: '值字段不能为空',
      labelKey: '标签字段',
      labelKey_tip: 'SQL 查询结果通常包含多个列，您可以指定哪些列作为曲线的标签元信息',
    },
  },
};
export default zh_CN;
