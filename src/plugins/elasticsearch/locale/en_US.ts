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
    query: 'Query',
    query_required: 'Please fill query field',
    mode: {
      raw: 'Logs',
      metric: 'Metric',
    },
    submode: {
      table: 'Table',
      timeSeries: 'TimeSeries',
    },
    dashboard: {
      mode: {
        label: 'Query mode',
        table: 'Table',
        timeSeries: 'TimeSeries',
      },
      time: 'Time',
      timeTip: 'Specify the time range, the default is the global time range of the dashboard',
      time_series: 'Auto complete x-axis parameter',
      time_series_tip:
        'In beta version<1 />When the time series mode is on, if the query statement does not contain the __time__ field, the system will automatically infer and complete the parameter to ensure that the x-axis is a timestamp format',
      removeFirstAndLastPoints: 'Remove the first and last points',
    },
    advancedSettings: {
      title: 'Advanced settings',
      valueKey: 'Value key',
      valueKey_tip:
        'The numeric value extracted from the returned result by this field. For example, if the query condition is `* | select count(1) as PV`, the returned result is PV:11, and if the ValueKey writes PV, 11 will be extracted according to the PV as the value of the query result',
      valueKey_required: 'Please fill value field',
      tags_placeholder: 'Press Enter to input multiple',
      labelKey: 'Label key',
      labelKey_tip:
        'Use this field and its corresponding value as a tag and append it to the tag of the monitoring data. For example, the query condition is `* | select count(1) as PV group by host` and the returned result is `[{PV:11 host:dev01 },{PV:10 host:dev02}]`, LabelKey writes host, then the first returned data host=dev01 will be used as tag',
      timeKey: 'Time key',
      timeKey_tip: 'Specify which field is the time field and use it as the x-axis coordinate for drawing the curve',
      timeKey_required: 'Please fill time field',
      timeFormat: 'Time format',
      timeFormat_tip: 'The format of the time, which will convert the time to a timestamp according to this format',
    },
    query_raw_tip: `Query raw logs:
  - Query GET/POST successful logs: (request_method:GET or request_method:POST) and status in [200 299]
  - Query GET/POST failed logs: (request_method:GET or request_method:POST) and status not in [200 299]
  - Query logs whose request_uri starts with /request: request_uri:/request*`,
    query_timeseries_tip: `Query time series values:
  - Count successful GET/POST requests. There are two query ways; if you don't have special requirements for the displayed time style, you can omit [time_series](https://help.aliyun.com/document_detail/63451.htm)
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count, select time_series(__time__, '1m', '%H:%i:%s' ,'0') as Time group by Time order by Time limit 100`,
    query_document: `Documentation:
  - [Query syntax](https://help.aliyun.com/document_detail/29060.htm)
  - [Analysis syntax](https://help.aliyun.com/document_detail/53608.html)
  - [Function overview](https://help.aliyun.com/document_detail/321454.html)`,
    variable_help: 'Combines and deduplicates the values of all fields in the queried logs as variable options. By default, only the first 500 logs are queried.',
  },
  trigger: {
    title: 'Trigger',
    value_msg: 'Please input expression value',
  },
  logs: {
    title: 'Logs',
    count: 'Count',
    filter_fields: 'Filter fields',
    settings: {
      mode: {
        origin: 'Origin',
        table: 'Table',
      },
      breakLine: 'Break line',
      reverse: 'Time',
      organizeFields: {
        title: 'Organize fields',
        allFields: 'All fields',
        showFields: 'Show fields',
        showFields_empty: 'Show all fields by default',
      },
      jsonSettings: {
        title: 'JSON settings',
        displayMode: 'Default display mode',
        displayMode_tree: 'Tree',
        displayMode_string: 'String',
        expandLevel: 'Default expand level',
      },
    },
    tagsDetail: 'Tag detail',
    expand: 'Expand',
    collapse: 'Collapse',
    fieldValues_topnNoData: 'No data',
    stats: {
      numberOfUniqueValues: 'Number of unique values',
      min: 'Min',
      max: 'Max',
      sum: 'Sum',
      avg: 'Avg',
    },
    fieldLabelTip: 'The field is not enabled for statistics, and statistical analysis cannot be performed',
    filterAnd: 'Add to this search',
    filterNot: 'Exclude from this search',
    total: 'Total',
    context: {
      title: 'Context Viewer',
      back_lines_btn: 'Earlier',
      current_lines_btn: 'Current log',
      forward_lines_btn: 'Newer',
      organize_fields: 'Field settings',
      organize_fields_tip: 'Currently only showing fields {{fields}}',
      filter_keywords: 'Filter',
      filter_keywords_add: 'Add filter',
      highlight_keywords: 'Highlight',
      highlight_keywords_add: 'Add highlight',
      no_more_top: 'No more earlier logs',
      no_more_bottom: 'No more newer logs',
    },
  },
  enrich_queries: {
    title: 'Enrich queries',
  },
};
export default en_US;
