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
    template: 'Message template',
    template_tip: 'The template of the notification content, different templates can be used according to different scenarios',
    severities: 'Applicable Level',
    severities_tip: 'Select which level of alarm event to notify, only the level that is checked will be notified',
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
    },
    run_test_btn: 'Run test',
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
