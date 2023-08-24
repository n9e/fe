const en_US = {
  unauthorized: 'Unauthorized',
  title: 'Index Patterns',
  name: 'Name',
  name_msg1: 'Please enter name',
  name_msg2: 'The same name already exists',
  time_field: 'Time field',
  allow_hide_system_indices: 'Match any index, including hidden ones',
  create_btn: 'Create Index Pattern',
  create_title: 'Create Index Pattern',
  indexes_empty: 'No matching indexes',
  field: {
    name: 'Field name',
    type: 'Field type',
    type_placeholder: 'Please select field type',
    edit_title: 'Edit field',
    alias: 'Field alias',
    alias_tip: 'The field name to display in the explorer, Queries and filters use the original field name',
    format: {
      title: 'Format',
      type: 'Format',
      params: {
        date: {
          pattern: 'Pattern',
          pattern_tip: 'Moment.js format pattern, default value is YYYY-MM-DD HH:mm:ss.SSS',
          pattern_placeholder: 'YYYY-MM-DD HH:mm:ss.SSS',
        },
        url: {
          urlTemplate: 'URL template',
          urlTemplateTip: 'Use {{value}} as a placeholder',
          urlTemplatePlaceholder: 'https://www.example.com/?q={{value}}',
          labelTemplate: 'Label template',
          labelTemplatePlaceholder: '{{value}}',
        },
      },
    },
  },
};
export default en_US;
