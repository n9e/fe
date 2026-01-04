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
      query: 'Query mode',
      sql: 'SQL mode',
    },
    submode: {
      raw: 'Raw',
      timeSeries: 'TimeSeries',
    },
    query_tip:
      'SQL example: Query the number of log lines in the last 5 minutes SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) <br />For more SQL mode instructions, please refer to <a>Doris SQL Mode Instructions</a>',
    query_placeholder: 'SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m',
    execute: 'Execute',
    database: 'Database',
    database_msg: 'Please select database',
    table: 'Table',
    table_msg: 'Please select table',
    time_field: 'Date Field',
    time_field_msg: 'Please select date field',
    time_field_tip: '<span>To link this time picker, you need to use a time macro in the query condition</span><br/>Introduction to time macro usage: <a>Details</a>',
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
    get_index_fail: 'Getting table index failed',
    warn_message_btn_1: 'Continue to submit query',
    warn_message_btn_2: 'Return to modify',
    warn_message: 'The query condition does not contain a time macro, and the selected time range will not take effect!',
    warn_message_content_1:
      'This query condition may trigger a full table scan. Please evaluate the impact on storage performance yourself and decide whether to continue submitting the query or return to modify and add a time macro.',
    warn_message_content_2: 'Common time macros: ',
    warn_message_content_3: 'Example:',
    warn_message_content_4: 'Usage of time macros: <a>Details</a>',
    dashboard: {
      mode: {
        label: 'Query Mode',
        table: 'Table',
        timeSeries: 'TimeSeries',
      },
    },
    stack_disabled_tip: 'Stacked charts are not supported when the number of unique values is 1 or exceeds 10',
    stack_tip_pin: 'Enable stacked chart',
    stack_tip_unpin: 'Disable stacked chart',
    stack_group_by_tip: 'Display stacked trend chart by this field value',
    sql_format: 'SQL Format',
    interval: 'Interval',
    interval_tip:
      'The query interval configuration will only take effect when the $__timeFilter time macro is used in the SQL.<br />The alerting system will limit the data scanning range based on this time window to ensure alert timeliness and database performance',
    offset: 'Offset',
    offset_tip:
      'On the basis of the current query time, offset a specified number of seconds forward before executing the query, similar to offset in PromQL.<br />It is commonly used to handle scenarios such as data write delay and link delay to avoid alert misreporting due to data not arriving in time',
    sql_warning_1:
      'It is strongly recommended to use $__timeFilter(time field) in the WHERE condition to explicitly limit the time range, otherwise it may lead to issues such as: <b>abnormal database load, alert query timeout</b>',
    sql_warning_2: 'The SQL uses $__timeGroup, which will return data for multiple time points. In this scenario, <b>the system only uses the results of the latest time point</b>',
    default_search_tip_1: 'Set as default search field',
    default_search_tip_2: 'Cancel default search field',
    default_search_by_tip: 'Default search field',
  },
};
export default en_US;
