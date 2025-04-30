const en_US = {
  title: 'Event piepline',
  teams: 'Authorized teams',
  basic_configuration: 'Basic configuration',
  filter_enable: 'Filter conditions',
  label_filters: 'Applicable labels',
  label_filters_tip: 'Applicable labels',
  attribute_filters: 'Applicable attributes',
  attribute_filters_tip: 'Applicable attributes',
  attribute_filters_value: 'Attribute value',
  attribute_filters_options: {
    group_name: 'Business group',
    cluster: 'Data source',
  },
  processor: {
    title: 'Processor',
    add_btn: 'Add processor',
    typ: 'Type',
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
