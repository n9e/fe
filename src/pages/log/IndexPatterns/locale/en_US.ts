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
  keyword: 'Index',
  should_not_empty: 'Cannot be null',
  should_not_dup: 'Index field cannot be duplicated',
  '日志中的字段均可被作为变量引用，如': 'Fields in the log can be referenced as variables, such as',
  跳转到日志查询: 'Jump to log query',
  跳转到灭火图: 'Jump to fire extinguishing map',
  跳转到仪表盘: 'Jump to dashboard',
  内置变量: 'Built-in variables',
  '，如': ', such as',
  '，包含了协议和域名': ', including protocol and domain',
  起止时间: 'Start and end time',
  '时间偏移(单位毫秒，可为负数)': 'Time offset (milliseconds, negative numbers are supported)',
  时间偏移: 'Time offset',
  '日志中的变量均可被作为变量引用，如': 'The variables in the log can be referenced as variables, such as',
  本系统地址: 'This system address',
  '，推荐使用该变量即可': 'It is recommended to use this variable.',
  本系统的域名: 'The domain name of this system is',
  '，不包含端口信息': ', does not include port information',
  '，包含“': 'Including',
  '”，为 “http': ', for http',
  '” 或 “https': ' or https',
  本系统协议: 'System Protocol',
  "可为指定字段设置展示样式，如，格式、别名等。":"You can set the display style for the specified field, such as format, alias, etc.",
  "如：设置字段的链接为":"For example: setting the link for the field to", 
  "或将该字段显示的值展示为":"or displaying the value of the field as", 
  '可为指定字段设置链接。':
    'You can set the link address for the specified field',
  复制: 'Copy',
  样例: 'Example',
  tip1: 'Where {{value}} is the value of the specified field, which can be referenced in the jump link, and information can also be added based on this variable.',
  tipDisplay: 'Expand',
  tipCollapse: 'Collapse',
  link: 'Link',
  displayStyle: 'Display Style',
  跳转链接: 'Link',
  展示样式: 'Display',
  "链接地址": "Link Address",
  field: {
    name: 'Field name',
    type: 'Field type',
    type_placeholder: 'Please select field type',
    edit_title: 'Edit index',
    alias: 'Alias',
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
          urlTemplateTip: 'Use {{value}} as a placeholder, other fields can be used as variables, such as ${key1}, ${key2}',
          urlTemplateTip1: 'Just as tracing：http://flashcat.cloud/trace?traceId={{value}}&dataSourceName=traceSystemName',
          urlTemplateTip2: 'This field is disabled, please go to the jump link configuration',
          urlTemplatePlaceholder: 'https://www.example.com/?q={{value}}',
          labelTemplate: 'Label template',
          labelTemplatePlaceholder: '{{value}}',
        },
      },
    },
  },
};
export default en_US;
