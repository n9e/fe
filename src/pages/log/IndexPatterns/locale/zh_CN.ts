const zh_CN = {
  unauthorized: '没有权限',
  title: '索引模式',
  name: '名称',
  name_msg1: '请输入名称',
  name_msg2: '已存在同名的规则',
  time_field: '时间字段',
  allow_hide_system_indices: '匹配隐藏的索引',
  create_btn: '创建索引模式',
  create_title: '创建索引模式',
  indexes_empty: '没有匹配的索引',
  field: {
    name: '字段名称',
    type: '字段类型',
    type_placeholder: '请选择字段类型',
    edit_title: '编辑字段',
    alias: '字段别名',
    alias_tip: '日志查询中显示的字段名称, 查询和过滤使用原字段名称',
    format: {
      title: '自定义展示格式',
      type: '自定义展示格式',
      params: {
        date: {
          pattern: '日期格式',
          pattern_tip: '使用 Moment.js 格式模式，默认值为 YYYY-MM-DD HH:mm:ss.SSS',
          pattern_placeholder: 'YYYY-MM-DD HH:mm:ss.SSS',
        },
        url: {
          urlTemplate: 'URL 模板',
          urlTemplateTip: '使用 {{value}} 作为占位符',
          urlTemplatePlaceholder: 'https://www.example.com/?q={{value}}',
          labelTemplate: '标签模板',
          labelTemplatePlaceholder: '{{value}}',
        },
      },
    },
  },
};
export default zh_CN;
