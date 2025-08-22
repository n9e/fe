const zh_CN = {
  append_tags_msg: '标签格式不正确，请检查！',
  append_tags_msg1: '标签长度应小于等于 64 位',
  append_tags_msg2: '标签格式应为 key=value。且 key 以字母或下划线开头，由字母、数字和下划线组成。',
  append_tags_placeholder: '标签格式为 key=value ，使用回车或空格分隔',
  tag: {
    key: {
      label: '标签名',
      msg: '标签名不能为空',
      duplicate_error: '标签名不能重复',
    },
    func: {
      label: '运算符',
      label_tip: `支持多种匹配运算符，说明如下：
- \`==\` 匹配某个具体的标签值，只能填写一个，如果想同时匹配多个，应该使用 \`in\` 操作符
- \`=~\` 填写正则表达式，灵活匹配标签值
- \`in\` 匹配多个标签值，类似 SQL 里的 \`in\` 操作
- \`not in\` 不匹配的标签值，可填写多个，类似 SQL 里的 \`not in\` 操作，用于排除多个标签值
- \`!=\` 不等于，用于排除特定的某个标签值
- \`!~\` 正则不匹配，填写正则，匹配这个正则的标签值都将被排除，类似 PromQL 中的 \`!~\``,
      msg: '运算符不能为空',
    },
    value: {
      label: '标签值',
      placeholder1: '可以输入多个值，用回车分割',
      placeholder2: '请输入正则表达式',
      msg: '标签值不能为空',
    },
    add: '新增标签',
  },
  attr: {
    key: {
      label: '属性名',
      msg: '属性名不能为空',
      duplicate_error: '属性名不能重复',
    },
  },
};
export default zh_CN;
