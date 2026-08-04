const en_US = {
  preview: 'Preview',
  query: {
    title: 'Query',
    execute: 'Execute',
    range: 'Range',
    power_sql: 'SQL enhance',
    query: 'SQL',
    query_msg: 'Please enter SQL',
    query_tip1: 'IoTDB query syntax reference',
    query_tip2: 'Document',
    sqlTemplates: 'SQL templates',
    sqlTemplates_tip: 'The following SQL query conditions are for reference only. When using them in practice, you need to replace the $variable with the actual value',
    sqlTemplates_load_failed: 'Failed to load SQL templates',
    previewFailed: 'Failed to preview data',
    loadSchemaFailed: 'Failed to load schema',
    mode: {
      timeSeries: 'Time series',
      raw: 'Raw logs',
    },
    advancedSettings: {
      title: 'Advanced settings',
      metricKey_label: 'Value field',
      metricKey_tip: 'SQL query results usually contain multiple columns; specify which columns are displayed as series on the chart',
      tags_placeholder: 'Press Enter to input multiple',
      labelKey_label: 'Label field',
      labelKey_tip: 'SQL query results usually contain multiple columns; specify which columns are used as label metadata for series',
      timeKey_label: 'Time field',
      timeKey_tip: 'Specify which field is the time field, used as the x-axis of the chart',
      timeFormat_tip: 'The format of the time, which will convert the time to a timestamp according to this format',
    },
    schema: 'Schema',
    table: 'Tables',
  },
  trigger: {
    title: 'Trigger',
    value_msg: 'Please enter the expression value',
  },
};

export default en_US;
