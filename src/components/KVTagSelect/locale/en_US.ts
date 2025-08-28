const en_US = {
  append_tags_msg: 'Invalid tag format, please check!',
  append_tags_msg1: 'Tag length should be less than or equal to 64 bits',
  append_tags_msg2: 'Tag format should be key=value. And the key starts with a letter or underscore, and is composed of letters, numbers and underscores.',
  append_tags_placeholder: 'Tag format is key=value, use Enter or Space to separate',
  tag: {
    key: {
      label: 'Tag Key',
      msg: 'Tag key is required',
      duplicate_error: 'Duplicate keys are not allowed, which may cause events to not be matched',
      placeholder: 'Enter or select a tag key for matching, such as app / cluster / alertname',
    },
    func: {
      label: 'Operator',
      label_tip: `Supports multiple matching operators, described as follows:
- \`==\` Match a specific tag value, only one value can be entered. If you want to match multiple values simultaneously, use the \`in\` operator
- \`=~\` Enter a regular expression to flexibly match tag values
- \`in\` Match multiple tag values, similar to the \`in\` operation in SQL
- \`not in\` Exclude tag values, multiple values can be entered, similar to the \`not in\` operation in SQL, used to exclude multiple tag values
- \`!=\` Not equal to, used to exclude a specific tag value
- \`!~\` Regular expression not match, enter a regular expression, tag values matching this regex will be excluded, similar to \`!~\` in PromQL`,
      msg: 'Operator is required',
    },
    value: {
      label: 'Tag Value',
      placeholder: 'Enter or select a tag value for matching',
      msg: 'Tag value is required',
    },
    add: 'Add Tag',
  },
  attr: {
    key: {
      label: 'Attribute Name',
      msg: 'Attribute name is required',
      duplicate_error: 'Attribute names must be unique',
    },
  },
};
export default en_US;
