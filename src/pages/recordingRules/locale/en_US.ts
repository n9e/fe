const en_US = {
  title: 'Record Rules',
  search_placeholder: 'Search by name or tags',
  name: 'Metric Name',
  name_msg: 'Metric name is invalid',
  name_tip: 'Promql is calculated periodically, and a new metric is generated. Fill in the name of the new metric here',
  note: 'Note',
  disabled: 'Enable',
  prom_eval_interval: 'Eval interval',
  prom_eval_interval_tip:
    'PromQL query is executed every {{num}} seconds to query the time-series database, and the results retrieved are renamed and written back to the time-series database',
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
      prom_eval_interval_tip:
        'PromQL query is executed every {{num}} seconds to query the time-series database, and the results retrieved are renamed and written back to the time-series database',
      options: {
        datasource_ids: 'Datasource',
        prom_eval_interval: 'Eval interval',
        disabled: 'Enable',
        append_tags: 'Tags',
      },
    },
  },
};
export default en_US;
