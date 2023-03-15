const zh_CN = {
  title: '通知设置',
  webhooks: {
    title: '回调地址',
    enable: '启用',
    note: '备注',
    url: 'URL',
    timeout: '超时 (单位: s)',
    basic_auth_user: '用户名 (Basic Auth)',
    basic_auth_password: '密码 (Basic Auth)',
    skip_verify: '跳过 SSL 验证',
    add: '添加',
  },
  script: {
    title: '通知脚本',
    enable: '启用',
    timeout: '超时 (单位: s)',
    type: ['使用脚本', '使用路径'],
    path: '文件路径',
    content: '脚本内容',
  },
  channels: {
    title: '通知媒介',
    name: '名称',
    ident: '标识',
    ident_msg1: '标识只能包含字母、数字、下划线和中划线',
    ident_msg2: '标识已存在',
    hide: '隐藏',
    add: '添加',
    add_title: '添加通知媒介',
    edit_title: '编辑通知媒介',
  },
  contacts: {
    title: '联系方式',
    add_title: '添加联系方式',
    edit_title: '编辑联系方式',
  },
  smtp: {
    title: 'SMTP 设置',
  },
  ibex: {
    title: '告警自愈',
  },
};
export default zh_CN;
