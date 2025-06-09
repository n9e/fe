const en_US = {
  preview: 'Preview',
  query: {
    title: 'Query',
    execute: 'Execute',
    query: 'SQL',
    query_required: 'SQL is required',
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
    schema: 'Schema',
    document: 'Document',
    dashboard: {
      mode: {
        label: 'Query Mode',
        table: 'Table',
        timeSeries: 'TimeSeries',
      },
    },
    historicalRecords: {
      button: 'Historical Records',
      searchPlaceholder: 'Search Historical Records',
    },
    compass_btn_tip: 'Click to view table data',
  },
  trigger: {
    title: 'Trigger',
    value_msg: 'Please input expression value',
  },
  datasource: {
    shards: {
      title: 'Basic Information of Data Source',
      title_tip:
        'Whether the database can be connected depends on whether the DBA has granted the corresponding DB user authorization. If it cannot be connected due to this reason, you can continue to complete the subsequent settings first, and then verify later.',
      addr: 'Database Address',
      addr_tip: 'The database address must be unique',
      user: 'Username',
      password: 'Password',
      help: 'Note: The account needs to have read permission for the corresponding database to continue subsequent operations. If you change to another account, try to use a read-only account.',
    },
  },
};
export default en_US;
