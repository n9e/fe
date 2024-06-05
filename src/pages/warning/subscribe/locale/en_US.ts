const en_US = {
  title: 'Alert Subscribes',
  search_placeholder: 'Search rules, tags, and receiving groups',
  rule_name: 'Rule Name',
  sub_rule_name: 'Subscribe Alert Rule',
  sub_rule_selected: 'Selected Rules',
  tags: 'Tags',
  user_groups: 'Receiving Group',
  tag: {
    key: {
      label: 'Subscribed Event Tag Key',
      tip: 'The tag is the tag of the alert event, and the alert event is filtered by the following tag matching rules',
    },
    func: {
      label: 'Operator',
    },
    value: {
      label: 'Value',
    },
  },
  group: {
    key: {
      label: 'Subscribed Groups',
      placeholder: 'Subscribed Groups',
    },
    func: {
      label: 'Operator',
    },
    value: {
      label: 'Value',
    },
  },
  redefine_severity: 'Redefine Severity',
  redefine_channels: 'Redefine Channels',
  redefine_webhooks: 'Redefine Webhooks',
  user_group_ids: 'Receiving Group',
  for_duration: 'Duration (seconds)',
  for_duration_tip:
    'For example: If 300 is configured, the same alarm event will not match the subscription when it is subscribed for the first time. When it is subscribed again later, the trigger time of the current event and the time when this event was subscribed for the first time will be calculated. The difference in trigger time. If the obtained value exceeds 300 seconds, it will meet the subscription conditions and the relevant notification logic will be used. If it is less than 300 seconds, the subscription will not be matched. This function can be used as an alarm upgrade. The person in charge of the team can configure a subscription with a duration of more than 1 hour (3600s), and the recipient is configured as himself. As the person in charge, it is guaranteed that someone will follow up on the alarm.',
  webhooks: 'New Webhooks',
  webhooks_msg: 'Webhook is required',
  prod: 'Type',
  subscribe_btn: 'Subscribe',
  basic_configs: 'Basic Settings',
  severities: 'Severity',
  severities_msg: 'Severity is required',
  tags_groups_require: 'Tags and receiving groups must fill in at least one item',
  note: 'Note',
};
export default en_US;
