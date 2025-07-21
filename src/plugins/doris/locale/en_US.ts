const en_US = {
  quick_query: 'Quick Query',
  quick_query_tip:
    'Quick Query: Based on a fixed SQL template, quickly generate query statements. For example, if field A is greater than 0, simply enter A>0. By clicking this button, you can quickly switch to custom mode and support viewing and modifying SQL statements',
  custom_query: 'Custom Query',
  custom_query_tip: 'Custom queries support users to freely input query statements based on SQL syntax',
  current_database: 'Database',
  table: 'Table',
  database_table_required: 'Please select database and table',
  query: {
    mode: {
      raw: 'Raw',
      metric: 'Metric',
    },
    time_field: 'Time field',
    time_field_msg: 'Please enter the time field',
    query_tip:
      'SQL example: To query the number of log entries in the last 5 minutes, use SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: 'Execute',
    database: 'Database',
    database_placeholder: 'Default can be left empty',
    query: 'Query',
    query_required: 'Query is required',
    advancedSettings: {
      title: 'Auxiliary Configuration',
      tags_placeholder: 'Enter multiple tags by pressing Enter',
      valueKey: 'Value Field',
      valueKey_tip: 'SQL query results usually contain multiple columns, you can specify which columns are used as curves to display on the chart',
      valueKey_required: 'Value Field is required',
      labelKey: 'Label Field',
      labelKey_tip: 'SQL query results usually contain multiple columns, you can specify which columns are used as label metadata for curves',
    },
  },
};
export default en_US;
