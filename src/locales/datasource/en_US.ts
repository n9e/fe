const en_US = {
  es: {
    ref: 'Name',
    index: 'Index',
    index_tip: `
      Support for multiple configuration methods:
      <br />
      1. Specify a single index 'gb' to search all documents in the 'gb' index
      <br />
      2. Specify multiple indexes 'gb, us' to search all documents in the 'gb' and 'us' indexes
      <br />
      3. Specify index prefixes 'g*, u*' to search all documents in any index starting with 'g' or 'u'
      <br />
      `,
    index_msg: 'Index is required',
    indexPattern: 'Index pattern',
    indexPatterns: 'Index patterns',
    indexPattern_msg: 'Index pattern is required',
    indexPatterns_manage: 'Manage index patterns',
    filter: 'Filter',
    time_label: 'Time',
    date_field: 'Date field',
    date_field_msg: 'Date field is required',
    interval: 'Interval',
    value: 'Metric',
    func: 'Function',
    funcField: 'Field',
    terms: {
      label: 'Group by field',
      more: 'More',
      size: 'Size',
      min_value: 'Min doc count',
    },
    raw: {
      limit: 'Limit',
      date_format: 'Date format',
      date_format_tip: 'Use Moment.js format pattern, such as YYYY-MM-DD HH:mm:ss.SSS',
    },
    alert: {
      query: {
        title: 'Queries',
        preview: 'Preview',
      },
      trigger: {
        title: 'Trigger',
        builder: 'Builder',
        code: 'Code',
        label: 'Label',
      },
      prom_eval_interval_tip: 'Every {{num}} seconds, to query the backend storage',
      prom_for_duration_tip:
        'Usually the duration is greater than the execution frequency. During the duration, PromQL query is executed multiple times according to the execution frequency, and an alert is generated only if it is triggered every time. If the duration is set to 0, an alert is generated as long as the threshold is triggered once during the PromQL query.',
      advancedSettings: 'Advanced settings',
      delay: 'Delay',
    },
    event: {
      groupBy: `Group by {{field}}, number of matches {{size}}, document minimum value {{min_value}}`,
      logs: {
        title: 'Logs detail',
        size: 'Size',
        fields: 'Fields',
        jsonParseError: 'Parse failed',
      },
    },
    syntaxOptions: 'Syntax options',
    queryFailed: 'Query failed, please try again later',
    offset_tip: 'Used to query data before a specified time period, similar to offset in PromQL, unit is seconds',
  },
  datasource: {
    max_query_rows: 'Maximum number of rows allowed to be retrieved in a single request',
    max_idle_conns: 'Maximum idle connections',
    max_open_conns: 'Maximum open connections',
    conn_max_lifetime: 'Maximum connection lifetime (unit: seconds)',
    timeout: 'Timeout (unit: seconds)',
    timeout_ms: 'Timeout (unit: milliseconds)',
  },
  query: {
    title: 'Queries',
    execute: 'Execute',
    query: 'Query',
    query_required: 'Query is required',
    query_placeholder: 'Enter SQL to query, Press Shift+Enter to wrap',
    query_placeholder2: 'Press Shift+Enter to wrap',
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
