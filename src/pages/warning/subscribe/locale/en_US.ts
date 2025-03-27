const en_US = {
  title: 'Subscriptions',
  search_placeholder: 'Search by name, subscribed rules, subscribed tags, and receiving groups',
  rule_name: 'Subscription rules',
  sub_rule_name: 'Subscribe alert rule',
  sub_rule_selected: 'Selected rules',
  tags: 'Tags',
  user_groups: 'Receiving group',
  tag: {
    key: {
      label: 'Subscribed event tag key',
      tip: 'The tag is the tag of the alert event, and the alert event is filtered by the following tag matching rules',
      required: 'Tag key is required',
      placeholder: 'Please enter tag key',
    },
    func: {
      label: 'Operator',
    },
    value: {
      label: 'Value',
      equal_placeholder: 'Please enter value',
      include_placeholder: 'Multiple values can be entered, separated by carriage return',
      regex_placeholder: 'Please enter a regular expression match',
      required: 'Tag value is required',
    },
  },
  group: {
    key: {
      label: 'Subscribed groups',
      placeholder: 'Subscribed groups',
    },
    func: {
      label: 'Operator',
    },
    value: {
      label: 'Value',
      required: 'Value is required',
    },
  },
  redefine_severity: 'Redefine severity',
  redefine_channels: 'Redefine channels',
  redefine_webhooks: 'Redefine webhooks',
  user_group_ids: 'Receiving group',
  for_duration: 'Duration (seconds)',
  for_duration_tip:
    'For example: If 300 is configured, the same alarm event will not match the subscription when it is subscribed for the first time. When it is subscribed again later, the trigger time of the current event and the time when this event was subscribed for the first time will be calculated. The difference in trigger time. If the obtained value exceeds 300 seconds, it will meet the subscription conditions and the relevant notification logic will be used. If it is less than 300 seconds, the subscription will not be matched. This function can be used as an alarm upgrade. The person in charge of the team can configure a subscription with a duration of more than 1 hour (3600s), and the recipient is configured as himself. As the person in charge, it is guaranteed that someone will follow up on the alarm.',
  webhooks: 'New webhooks',
  webhooks_msg: 'Webhook is required',
  prod: 'Type',
  subscribe_btn: 'Subscribe',
  basic_configs: 'Basic settings',
  severities: 'Severity',
  severities_msg: 'Severity is required',
  tags_groups_require: 'Tags and receiving groups must fill in at least one item',
  note: 'Name',
  filter_configs: 'Filter settings',
  notify_configs: 'Notification settings',
  and: 'And',
};
export default en_US;
