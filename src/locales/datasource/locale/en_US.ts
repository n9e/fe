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
    index_placeholder: 'Index log-* (wildcards supported)',
    index_pattern_placeholder: 'Select index pattern',
    filter_placeholder: 'Filter status:500 AND method:GET',
    syntax: 'Syntax',
    time_label: 'Time',
    date_field: 'Date field',
    date_field_msg: 'Date field is required',
    interval: 'Interval',
    value: 'Metric',
    func: 'Function',
    funcField: 'Field',
    histogram: {
      interval: 'Interval',
    },
    terms: {
      label: 'Group by field',
      more: 'More',
      size: 'Size',
      min_doc_count: 'Min doc count',
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
      prom_eval_interval_tip: 'The query runs against the backend storage every {{num}} seconds',
      prom_for_duration_tip:
        'Usually the for duration is longer than the evaluation interval. During the for duration, the query is evaluated multiple times at the evaluation interval, and an alert fires only if the condition is met every time. If set to 0, an alert fires as soon as the condition is met once.',
      advancedSettings: 'Advanced settings',
      delay: 'Delay',
    },
    event: {
      groupBy: `Group by {{field}}, number of matches {{size}}, document minimum value {{min_doc_count}}`,
      logs: {
        title: 'Log details',
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
    query_placeholder: 'Enter SQL to query. Press Shift+Enter for a new line',
    query_placeholder2: 'Press Shift+Enter for a new line',
    advancedSettings: {
      title: 'Auxiliary settings',
      tags_placeholder: 'Enter multiple tags by pressing Enter',
      valueKey: 'Value field',
      valueKey_tip: 'SQL query results usually contain multiple columns; specify which columns are displayed as series on the chart',
      valueKey_required: 'Value field is required',
      labelKey: 'Label field',
      labelKey_tip: 'SQL query results usually contain multiple columns; specify which columns are used as label metadata for series',
    },
  },
};
export default en_US;
