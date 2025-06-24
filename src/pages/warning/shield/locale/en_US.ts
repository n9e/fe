const en_US = {
  title: 'Blackout',
  search_placeholder: 'Search by rule name, tag, or blackout reason',
  cause: 'Cause',
  time: 'Time',
  note: 'Name',
  btime: 'Start time',
  duration: 'Duration',
  etime: 'End time',
  prod: 'Type',
  severities: 'Severity',
  severities_msg: 'Severity is required',
  mute_type: {
    label: 'Mute type',
    0: 'Fixed time',
    1: 'Periodic time',
    days_of_week: 'Mute time',
    start: 'Start time',
    start_msg: 'Start time is required',
    end: 'End time',
    end_msg: 'End time is required',
  },
  tag: {
    key: {
      label: 'Event tags',
      tip: `The tags here refer to the tags of alert events, which filter alert events through the following tag matching rules. Multiple matching operators are supported, explained as follows:

- \`==\` matches a specific tag value, can only fill in one. If you want to match multiple values at the same time, you should use the \`in\` operator
- \`=~\` fills in a regular expression to flexibly match tag values
- \`in\` matches multiple tag values, similar to the \`in\` operation in SQL
- \`not in\` does not match tag values, can fill in multiple values, similar to the \`not in\` operation in SQL, used to exclude multiple tag values
- \`!=\` not equal, used to exclude a specific tag value
- \`!~\` does not match the regular expression, fill in a regular expression, and tag values that match this regular expression will be excluded, similar to \`!~\` in PromQL`,
    },
  },
  basic_configs: 'Basic information',
  filter_configs: 'Filter conditions',
  filter_configs_tip:
    'The alert events that meet the filter conditions will be muted by the mute rule, and then be muted. The filter condition is essentially to filter the alert event, and filter the event data source, level, tag, etc. through the filter condition',
  mute_configs: 'Mute duration',
  alert_content:
    'In order to prevent the misalignment of the mute rule from muting all the alerts of the company, this mute rule will only take effect on the alerts of a specific business group',
  preview_muted_title: 'Preview related events',
  preview_muted_save_only: 'Save only',
  preview_muted_save_and_delete: 'Save and delete related events',
  expired: 'Expired',
};
export default en_US;
