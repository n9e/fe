const en_US = {
  toolbar: {
    current_chat: 'Current Chat',
    new_chat: 'New Chat',
    history: 'Chat History',
    switch_to_drawer: 'Switch to Drawer Mode',
    switch_to_floating: 'Switch to Floating Panel',
  },
  history: {
    untitled: 'New Chat',
    today: 'Today',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
    unknown_time: '--:--',
    delete_confirm: 'Delete this conversation?',
    empty: 'No conversation history',
  },
  input: {
    placeholder: 'Ask a question. Press Enter to send, Shift + Enter for a new line',
  },
  query: {
    title: 'Query',
    copied: 'Query copied',
    copy: 'Copy',
    execute: 'Run Query',
    execute_disabled: 'Execution callback is not provided. Copy only.',
  },
  action: {
    query_generator: 'Generate Query',
  },
  message: {
    generating: 'Generating reply...',
    hint: 'Hint',
    stopped: 'Generation stopped',
    request_failed: 'Request failed',
    cancelled: 'This reply has been cancelled.',
    retry_later: 'Please try again later.',
    empty_response: 'No reply content',
    thinking: 'Thinking',
    unsupported_type: 'Unsupported content type: {{type}}',
  },
  form_select: {
    title: 'Please fill in the following information to continue:',
    busi_group: 'Business Group',
    datasource: 'Datasource',
    placeholder_select: 'Please select',
    confirm: 'Confirm',
  },
  alert_rule: {
    title: 'Alert Rule',
    copy: 'Copy',
    copied: 'Rule ID copied',
    duration_seconds: 'for {{seconds}} seconds',
    field: {
      id: 'Rule ID',
      name: 'Rule Name',
      group: 'Business Group',
      datasource: 'Datasource',
      cate: 'Datasource Type',
      severity: 'Severity',
      metric: 'Metric',
      condition: 'Condition',
      note: 'Alert Content',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  dashboard: {
    title: 'Dashboard',
    copied: 'Dashboard ID copied',
    field: {
      id: 'Dashboard ID',
      name: 'Name',
      group: 'Business Group',
      datasource: 'Default Datasource',
      panels_count: 'Panels',
      variables_count: 'Variables',
      tags: 'Tags',
    },
  },
  empty: {
    greeting_prefix: 'Hello, I am',
  },
};

export default en_US;
