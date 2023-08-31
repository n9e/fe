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
    power_sql: 'SQL Enhance',
    query: 'Query',
    mode: {
      timeSeries: 'Time Series',
      raw: 'Raw Logs',
    },
    advancedSettings: {
      title: 'Advanced Settings',
      valueKey_tip:
        'The numeric value extracted from the returned result by this field. For example, if the query condition is `* | select count(1) as PV`, the returned result is PV:11, and if the ValueKey writes PV, 11 will be extracted according to the PV as the value of the query result',
      tags_placeholder: 'Press Enter to input multiple',
      labelKey_tip:
        'Add this field and the corresponding value as a tag to the tag of the monitoring data. For example, if the query condition is `* | select count(1) as PV group by host`, the returned result is `[{PV:11 host:dev01 },{PV:10 host:dev02}]`, LabelKey writes host, then the first returned data host=dev01 will be used as tag',
      timeKey_tip: 'Specify which field is the time field and use it as the x-axis coordinate for drawing the curve',
      timeFormat_tip: 'The format of the time, which will convert the time to a timestamp according to this format',
    },
  },
  trigger: {
    title: 'Trigger',
    value_msg: 'Please input expression value',
  },
  logs: {
    title: 'Logs',
    count: 'Count',
    filter_fields: 'Filter Fields',
    settings: {
      breakLine: 'Break Line',
      reverse: 'Time',
      organizeFields: {
        title: 'Organize Fields',
        allFields: 'All Fields',
        showFields: 'Show Fields',
        showFields_empty: 'Show all fields by default',
      },
      jsonSettings: {
        title: 'JSON Settings',
        displayMode: 'Default Display Mode',
        displayMode_tree: 'Tree',
        displayMode_string: 'String',
        expandLevel: 'Default Expand Level',
      },
    },
    tagsDetail: 'Tag Detail',
    expand: 'Expand',
    collapse: 'Collapse',
  },
};
export default en_US;
