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
    query_tip: 'SQL样例：查询最近5分钟的日志行数 SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: '查询',
    database: '数据库',
    database_placeholder: '默认可以留空',
    query: '查询条件',
    query_required: '查询条件不能为空',
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
