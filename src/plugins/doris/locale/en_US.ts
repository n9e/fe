const en_US = {
  快捷查询: 'Quick',
  自定义查询: 'Custom',
  '自定义查询 支持用户根据SQL语法自由输入查询语句': 'Custom queries support users to freely input query statements based on SQL syntax',
  '快捷查询 根据固定的SQL模板，快速生成查询语句，比如字段A大于0，只需要输入 A > 0，通过点击该按钮可以快速切换到自定义模式，支持查看并修改SQL语句':
    'Quick Query: Based on a fixed SQL template, quickly generate query statements. For example, if field A is greater than 0, simply enter A>0. By clicking this button, you can quickly switch to custom mode and support viewing and modifying SQL statements',
  当前数据库: 'Database',
  数据表: 'Table',
  请先选择数据库和数据表: 'Please select database and table',
  query: {
    mode: {
      raw: 'Raw',
      metric: 'Metric',
    },
    time_field: 'Time field',
    time_field_msg: 'Please enter the time field',
    sql_msg: 'Please enter the SQL statement',
    execute: 'Query',
    advancedSettings: {
      title: 'Advanced settings',
      valueKey: 'Value field',
      valueKey_tip: "SQL query results usually contain multiple columns. You can specify which columns' values are displayed as curves on the chart",
      valueKey_required: 'Value field cannot be empty',
      labelKey: 'Label field',
      labelKey_tip: 'SQL query results usually contain multiple columns. You can specify which columns are used as label metadata for curves',
    },
  },
};
export default en_US;
