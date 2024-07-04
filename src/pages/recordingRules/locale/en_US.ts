const en_US = {
  title: 'Recording Rules',
  search_placeholder: 'Search by name or tags',
  name: 'Metric Name',
  name_msg: 'Metric name is invalid',
  name_tip: 'Promql is calculated periodically, and a new metric is generated. Fill in the name of the new metric here',
  note: 'Note',
  disabled: 'Enable',
  cron_pattern: 'Execution frequency',
  cron_pattern_msg: 'Please enter Cron expression',
  cron_pattern_tip:
    'Cron expression, support to second, that is: second minute hour day month week, such as 1 * * * * * means execute the first second every minute. You can also abbreviate @every 60s',
  append_tags: 'Tags',
  append_tags_msg: 'Invalid tag format, please check!',
  append_tags_msg1: 'Tag length should be less than or equal to 64 bits',
  append_tags_msg2: 'Tag format should be key=value. And the key starts with a letter or underscore, and is composed of letters, numbers and underscores.',
  append_tags_placeholder: 'Tag format is key=value, use Enter or Space to separate',
  batch: {
    must_select_one: 'No rule selected',
    import: {
      title: 'Import Recording Rules',
      name: 'Recording Rule',
    },
    export: {
      title: 'Export Recording Rules',
      copy: 'Copy JSON to clipboard',
    },
    delete: 'Delete Recording Rules',
    update: {
      title: 'Update Recording Rules',
      field: 'Field',
      changeto: 'Change to',
      options: {
        datasource_ids: 'Datasource',
        disabled: 'Enable',
        append_tags: 'Tags',
        cron_pattern: 'Execution frequency',
      },
    },
  },
};
export default en_US;
