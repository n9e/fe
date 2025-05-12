const en_US = {
  title: 'Event pieplines',
  teams: 'Authorized teams',
  teams_tip:
    'Limit which team members can view and modify this configuration. Multiple teams can be associated<br />For example: If the configuration is authorized to the infra-team, only members of the infra-team can access or adjust this configuration.',
  basic_configuration: 'Basic configuration',
  filter_enable: 'Filter conditions',
  label_filters: 'Applicable labels',
  label_filters_tip:
    'Set the tag filter condition for event processing. Events will be processed only when they contain tags that match the configuration here. <br /> Example: Fill in service=mon, which means that only when an event contains the tag service=mon will it enter this processing flow.',
  attribute_filters: 'Applicable attributes',
  attribute_filters_tip:
    'Set the attribute filtering conditions for event processing. Events will be processed only when they contain attributes that match the configuration here. <br /> Example: Fill in Business Group == DefaultBusiGroup, which means that only when the "Business Group" attribute of the event is DefaultBusiGroup, will the processing flow be entered.',
  attribute_filters_value: 'Attribute value',
  attribute_filters_options: {
    group_name: 'Business group',
    cluster: 'Data source',
  },
  processor: {
    title: 'Processor',
    add_btn: 'Add processor',
    typ: 'Type',
    help_btn: 'Help',
  },
  label_enrich: {
    label_source_type: {
      label: 'Label source',
      options: {
        built_in_mapping: 'Built-in mapping',
      },
    },
    label_mapping_id: 'Label mapping name',
    help: 'Use the label specified in the source label to query the mapping, and append the fields queried from the mapping to the alarm event according to the "Add label" configuration',
    source_keys: {
      label: 'Source label',
      text: 'The field in the mapping <strong>{{field}}</strong> corresponds to the label in the event',
      target_key_placeholder: 'Label key',
      target_key_required: 'Label key cannot be empty',
    },
    append_keys: {
      label: 'Add label',
      source_key_placeholder: 'Field in the mapping',
      rename_key: 'Rename label Key',
      target_key_placeholder: 'Label Key',
    },
  },
  test_modal: {
    title: {
      settings: 'Select event',
      result: 'Event preview',
    },
  },
};
export default en_US;
