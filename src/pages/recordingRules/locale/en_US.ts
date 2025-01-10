const en_US = {
  title: 'Recording rules',
  search_placeholder: 'Search by name or tags',
  name: 'Metric name',
  name_msg: 'Metric name is invalid',
  name_tip: 'Promql is calculated periodically, and a new metric is generated. Fill in the name of the new metric here',
  note: 'Note',
  disabled: 'Enable',
  append_tags: 'Tags',
  append_tags_msg: 'Invalid tag format, please check!',
  append_tags_msg1: 'Tag length should be less than or equal to 64 bits',
  append_tags_msg2: 'Tag format should be key=value. And the key starts with a letter or underscore, and is composed of letters, numbers and underscores.',
  append_tags_placeholder: 'Tag format is key=value, use Enter or Space to separate',
  batch: {
    must_select_one: 'No rule selected',
    import: {
      title: 'Import recording rules',
      name: 'Recording rule',
    },
    export: {
      title: 'Export recording rules',
      copy: 'Copy JSON to clipboard',
    },
    delete: 'Delete recording rules',
    update: {
      title: 'Update recording rules',
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
