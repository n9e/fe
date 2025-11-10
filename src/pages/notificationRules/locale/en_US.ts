const en_US = {
  title: 'Notification rules',
  basic_configuration: 'Basic configuration',
  user_group_ids: 'Authorized teams',
  user_group_ids_tip: 'Users in the teams filled in here will have permission to manage or view this notification rule',
  enabled_tip: 'Whether to enable this notification rule',
  note_tip: 'You can supplement the detailed information or explanation of this notification rule here for future maintenance',
  notification_configuration: {
    title: 'Notification configuration',
    add_btn: 'Add Notification configuration',
    channel: 'Media type',
    channel_tip:
      'Select which medium to use to send alarm event notifications. If the existing medium does not meet the requirements, you can contact the administrator to create a new medium',
    channel_msg: 'Please select the notification medium',
    template: 'Message template',
    template_tip: 'The template of the notification content, different templates can be used according to different scenarios',
    template_msg: 'Please select the message template',
    severities: 'Applicable Level',
    severities_tip:
      'Select which level of alarm event to notify, only the checked level will be notified. If none of the three levels are checked, this medium will not match the alarm event, which is equivalent to disabling this medium',
    time_ranges: 'Applicable Time Period',
    time_ranges_tip: 'The notification rule can limit the effective time period, not configured means no restriction',
    effective_time_start: 'Start time',
    effective_time_end: 'End time',
    effective_time_week_msg: 'Please select the effective week',
    effective_time_start_msg: 'Please select the start time',
    effective_time_end_msg: 'Please select the end time',
    label_keys: 'Applicable tags',
    label_keys_tip:
      'The notification rule can limit only part of the alarm events that meet the conditions (filtered by event tags) to take effect, not configured means no restriction',
    attributes: 'Applicable attributes',
    attributes_value: 'Attribute value',
    attributes_tip: 'The notification rule can limit only part of the alarm events that meet certain event attributes to take effect, not configured means no restriction',
    attributes_options: {
      group_name: 'Business group',
      cluster: 'Cluster',
      is_recovered: 'Is recovered?',
      rule_id: 'Alarm rule',
      severity: 'Severity',
    },
    run_test_btn: 'Run test',
    run_test_btn_tip:
      'You can select a few events that have already occurred to test whether this notification configuration is correct. If it is correct, you should receive relevant notification messages',
    run_test_request_result: 'Test notification sent, notification target returned response as follows:',
    user_info: {
      user_ids: 'Users',
      user_group_ids: 'Teams',
      error: 'Recipient and recipient team cannot be empty at the same time',
    },
    flashduty: {
      ids: 'Channels',
    },
    pagerduty: {
      services: 'Service/Integration',
    },
  },
  user_group_id_invalid_tip: 'Authorized team does not exist',
  channel_invalid_tip: 'Notification medium does not exist',
  pipeline_configuration: {
    title: 'Event Pipeline',
    name_placeholder: 'Please select event pipeline',
    name_required: 'Event pipeline is required',
    add_btn: 'Add a new event pipeline',
    disable: 'Disable',
    enable: 'Enable',
  },
  escalations: {
    title: 'Escalation Configuration',
    title_tip:
      'When alerts exceed the set duration and have not recovered, the system will escalate notifications to specified channels according to the conditions below to avoid long-term lack of follow-up. For detailed configuration, refer to <a>documentation</a>',
    item_title: 'Notification Escalation',
    item_add_btn: 'Add Notification Escalation',
    interval: 'Detection Interval',
    interval_required: 'Detection interval is required',
    duration_required: 'Duration is required',
    duration_1: 'When abnormal events have exceeded',
    duration_2: 'and are still in',
    duration_3: 'status, use this configuration to send notifications.',
    repeating_notification: 'Repeating Notification Settings',
    repeating_notification_tip: 'If this switch is off, the escalation notification for the same event will only notify once',
    repeating_notification_1: 'Every',
    repeating_notification_2: 'minutes, up to',
    repeating_notification_3: 'times',
    notification_interval_required: 'Notification interval is required',
    notification_max_times_required: 'Maximum number of repeating notifications is required',
    event_status_options: {
      0: 'Not recovered',
      1: 'Not recovered and unclaimed',
    },
    time_ranges: {
      label_tip: 'Can limit escalation to only trigger during selected days of the week and time periods. Not configured means no restriction',
    },
    labels_filter: {
      label_tip:
        'Only execute escalation notifications for alert events that meet these label conditions. Used to narrow the impact scope. Not configured means no restriction. Supports dropdown selection of existing label keys (recommended) or manual input',
    },
    attributes_filter: {
      label_tip: 'Only enable escalation for alerts that simultaneously match these attributes; not configured means no restriction. Multiple conditions are in AND relationship',
    },
  },
  notify_aggr_configs: {
    title: 'Aggregation Configuration',
    enable: 'Enable Aggregation',
    group_enable: 'Fine-grained Aggregation',
    group_title: 'Fine-grained Aggregation',
    group_add_btn: 'Add Fine-grained Aggregation',
    group_tip1: 'Meeting the following conditions',
    group_tip2: 'Aggregate into one group for notification according to the following dimensions',
    group_label_keys: 'Labels',
    group_label_keys_required: 'Labels cannot be empty',
    group_attribute_keys: 'Attributes',
    group_attribute_keys_required: 'Attributes cannot be empty',
    group_keys_at_least_one_required: 'At least one of labels and attributes must be filled',
    group_duration_1: 'After receiving an alert, alerts from the same group received within',
    group_duration_2: 'seconds will be aggregated and sent together',
    group_duration_required: 'Aggregation duration cannot be empty',
    default_title: 'Default Dimensions',
    default_tip: 'If the above filtering conditions are not met, <b>aggregate into one group for notification according to the following dimensions</b>',
    default_duration_tip: 'Please note that too large aggregation time intervals will cause alert delivery delays',
    default_duration_tip2: 'Maximum aggregation interval cannot exceed 3600 seconds',
    attribute_keys_map: {
      cluster: 'Data Source',
      group_name: 'Business Group',
      rule_id: 'Alert Rule',
      severity: 'Alert Level',
    },
    enable_tip: 'After enabling, alerts that match the rules will be merged by dimension into one notification <a>documentation</a>',
    labels_filter: {
      label_tip:
        'Only execute aggregation notifications for alert events that meet these label conditions. Used to narrow the impact scope. Not configured means no restriction. Supports dropdown selection of existing label keys (recommended) or manual input',
    },
    attributes_filter: {
      label_tip:
        'Only let alerts matching these label filtering conditions participate in aggregation, unmatched alerts are not affected by this rule<br />Multiple conditions are in AND relationship, and also in AND relationship with the applicable attribute filtering conditions below',
    },
    label_keys: {
      tip: 'If configured as ident, events with the same ident will be merged into one group and send one notification message, commonly used for SMS/IM noise reduction',
      placeholder: 'For example: ident, app. Supports dropdown selection of existing label keys (recommended) or manual input',
    },
    attribute_keys: {
      tip: 'If configured as Business Group, events with the same Business Group will be merged into one group and send one notification message',
      placeholder: 'For example: Business Group',
    },
  },
  statistics: {
    total_notify_events: 'Total notification events in the last {{days}} days',
    total_notify_events_tip: 'Statistics of the actual number of notifications sent; events that are <b>converged, suppressed, or blocked</b> are not counted',
    escalation_events: 'Escalation events in the last {{days}} days',
    escalation_events_tip:
      'Number of events that meet the escalation rules and are promoted in priority; a high number usually means a longer processing cycle, and <b>response SLA/escalation threshold/alert noise reduction strategy</b> need to be optimized',
    noise_reduction_ratio: 'Noise reduction ratio in the last {{days}} days',
    noise_reduction_ratio_tip:
      'Noise reduction ratio = <b>(1 − actual number of notifications sent ÷ original number of alert events) × 100%</b>; the closer the value is to <b>100%</b>, the better the <b>noise reduction effect</b>',
  },
  tabs: {
    events: 'Event list',
    rules: 'Alarm rules',
    sub_rules: 'Subscription rules',
  },
};
export default en_US;
