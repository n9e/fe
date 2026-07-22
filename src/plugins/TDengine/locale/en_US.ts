const en_US = {
  preview: 'Preview',
  query: {
    title: 'Query',
    execute: 'Execute',
    project: 'Project',
    project_msg: 'Please select project',
    project_tip: `
      <1>Project is the resource management unit of Log Service and the main boundary for multi-user isolation and access control. For more information, see<1>
      <2>Project</2>
    `,
    logstore: 'Logstore',
    logstore_msg: 'Please select logstore',
    logstore_tip: `
      <1>Logstore is the unit for collecting, storing, and querying log data in Log Service. For more information, see<1>
      <2>Logstore</2>
    `,
    range: 'Range',
    power_sql: 'SQL enhance',
    query: 'SQL',
    query_msg: 'Please input SQL',
    query_tip1: 'TDengine query syntax reference',
    query_tip2: 'Document',
    sqlTemplates: 'SQL Templates',
    sqlTemplates_tip: 'The following SQL query conditions are for reference only. When using them in practice, you need to replace the $variable with the actual value',
    mode: {
      timeSeries: 'Time series',
      raw: 'Raw logs',
    },
    advancedSettings: {
      title: 'Advanced settings',
      metricKey_label: 'Value field',
      metricKey_tip: 'SQL query results usually contain multiple columns, you can specify which columns are used as curves to display on the chart',
      tags_placeholder: 'Press Enter to input multiple',
      labelKey_label: 'LabelKey',
      labelKey_tip: 'SQL query results usually contain multiple columns, you can specify which columns are used as label metadata for curves',
      timeKey_tip: 'Specify which field is the time field and use it as the x-axis coordinate for drawing the curve',
      timeFormat_tip: 'The format of the time, which will convert the time to a timestamp according to this format',
    },
    schema: 'Schema',
    table: 'Table',
    stable: 'Stable',
  },
  trigger: {
    title: 'Trigger',
    value_msg: 'Please input expression value',
  },
};
export default en_US;
