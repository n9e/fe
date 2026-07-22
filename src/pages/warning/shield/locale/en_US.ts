const en_US = {
  title: 'Blackout',
  edit_missing_params: 'Missing required parameters, unable to edit, please contact the administrator',
  search_placeholder: 'Search by rule name, tag, or blackout reason',
  datasource_type: 'Datasource type',
  datasource_id: 'Datasource',
  cause: 'Cause',
  cause_tip: 'Describe why the alerts are muted, so teammates know the background and when the mute can be released',
  cause_placeholder: 'e.g. Order service release, expected to finish within 1 hour',
  time: 'Time',
  note: 'Name',
  btime: 'Start time',
  btime_msg: 'Start time is required',
  duration: 'Duration',
  duration_quick: 'Quick duration',
  duration_quick_tip: 'The end time is calculated from the start time, you can also edit the start and end time below',
  etime: 'End time',
  etime_msg: 'End time is required',
  etime_before_btime_msg: 'End time must be later than start time',
  expired_tip: 'This rule has expired and mutes nothing right now. Pick a quick duration or change the end time to make it effective again',
  long_duration_tip: 'The mute lasts longer than {{days}} days, alerts will stay invisible for a long time, please confirm',
  prod: 'Type',
  severities: 'Severity',
  severities_tip: 'Only the checked severities are muted, the others still alert as usual',
  severities_msg: 'Severity is required',
  scope_unlimited_tip: 'No datasource and no event tag is configured, this rule will mute all alert events of the selected business group, please confirm',
  mute_type: {
    label: 'Mute type',
    0: 'Fixed time',
    1: 'Periodic time',
    days_of_week: 'Mute time',
    days_preset: {
      everyday: 'Every day',
      workday: 'Workdays',
      weekend: 'Weekend',
    },
    start: 'Start time',
    start_msg: 'Start time is required',
    end: 'End time',
    end_msg: 'End time is required',
    periodic_tip: 'A periodic mute never expires, alerts matched in the time ranges above are muted every week. Same start and end time means the whole day',
  },
  mute_method: {
    label: 'Mute method',
    0: 'Mute events and notifications',
    '0_desc': '(no event, no notification)',
    1: 'Mute notifications only',
    '1_desc': '(events are still recorded)',
    tip: 'With "Mute notifications only", matched alerts still generate and record events during the mute period; only notifications are suppressed, so you can still tell whether a change caused anomalies and release the mute after recovery.',
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
  name_auto_tip: 'The name is generated from the filter conditions above, you can change it at any time',
  name_auto_template: 'Mute {{scope}}',
  name_auto_separator: ', ',
  name_auto_all_alerts: 'all alerts',
  summary: {
    severities_all: 'All severities',
    tags_none: 'Any tag',
    tags_count: '{{count}} tag conditions',
    periodic_count: '{{count}} time ranges',
  },
  basic_configs: 'Basic information',
  basic_configs_desc: 'Rule name and mute cause, which make the rule easier to maintain and search',
  filter_configs: 'Filter conditions',
  filter_configs_desc:
    'Decide which alert events are muted: business group, datasource, severity and event tags. Conditions are combined with AND, an empty one means no restriction',
  mute_configs: 'Mute settings',
  mute_configs_desc: 'Decide when and how the alerts are muted: a fixed time range, or time ranges repeated every week',
  alert_content:
    'In order to prevent the misalignment of the mute rule from muting all the alerts of the company, this mute rule will only take effect on the alerts of a specific business group',
  preview_muted_title: 'Preview related events',
  preview_muted_desc:
    'The following existing alert events match the filter conditions. After saving, newly generated events will be muted, existing events will not disappear automatically, you can delete them here.',
  preview_muted_save_only: 'Save only',
  preview_muted_save_and_delete: 'Save and delete related events',
  expired: 'Expired',
  empty_guide: {
    title: 'No mute rule yet',
    desc: 'During releases, maintenance or drills, a mute rule temporarily silences alerts you already know about, so the on-call is not disturbed. It expires on its own, no manual cleanup needed.',
    select_busi_group: 'Pick a specific business group on the left to create a mute rule',
  },
  delete_mutes: {
    title: 'Mute Rule Cleanup',
    alert_message: 'Once deleted, data cannot be recovered. Please proceed with caution!',
    timestamp: 'Time Filter',
    timestamp_options: {
      1: '1 month ago',
      3: '3 months ago',
      6: '6 months ago',
      12: '1 year ago',
    },
  },
  filter_disabled: {
    placeholder: 'Enabled status',
    0: 'Enabled',
    1: 'Disabled',
  },
};
export default en_US;
