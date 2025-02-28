const en_US = {
  title: 'Notification Rules',
  basic_configuration: 'Basic Configuration',
  user_group_ids: 'Authorized Teams',
  user_group_ids_tip: 'Users in the teams filled in here will have permission to manage or view this notification rule',
  enabled_tip: 'Whether to enable this alarm notification rule. After enabling, alarm events that match this rule will be notified according to the notification configuration',
  note_tip: 'You can supplement the detailed information or explanation of this notification rule here for future maintenance',
  notification_configuration: {
    title: 'Notification Configuration',
    add_btn: 'Add Notification Configuration',
    channel: 'Notification Channel',
    channel_tip:
      'Select the method used to send alarm event notifications. If the existing method does not meet the requirements, you can contact the administrator to create a new configuration',
    template: 'Notification Template',
    template_tip: 'The template of the notification content, different templates can be used according to different scenarios',
    severities: 'Applicable Level',
    severities_tip: 'Select which level of alarm event to notify, only the levels that are checked will be notified',
    time_ranges: 'Applicable Time Period',
    time_ranges_tip:
      'Filter alarm events in the time dimension, set which time period the alarm events are generated, and the alarm events will take effect in this notification configuration. If not written, it means that no filtering is done according to the time period',
    effective_time_start: 'Start Time',
    effective_time_end: 'End Time',
    effective_time_week_msg: 'Please select the effective week',
    effective_time_start_msg: 'Please select the start time',
    effective_time_end_msg: 'Please select the end time',
    label_keys: 'Applicable Tags',
    label_keys_tip:
      'Filter alarm events in the tag dimension, set which events containing which tags will go through this notification configuration, not written means no filtering is done according to the tag',
    run_test_btn: 'Run Test',
    run_test_btn_tip:
      'You can select a few events that have already occurred to test whether this notification configuration is correct. If it is correct, you should receive relevant notification messages',
    run_test_request_success: 'Submit test success',
    user_info: {
      user_ids: 'Users',
      user_group_ids: 'Teams',
      error: 'Recipient and recipient team cannot be empty at the same time',
    },
    flashduty: {
      ids: 'Channels',
    },
  },
  user_group_id_invalid_tip: 'Authorized team does not exist',
  channel_invalid_tip: 'Notification medium does not exist',
};
export default en_US;
